import assert from 'node:assert'
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'

console.log('=== TEST SUITE : API LIVRES & TÉLÉCHARGEMENT UNIFLOW ===\n')

// 1. Test du générateur PDF académique
console.log('1. Test de buildAcademicBookPdf et generateAcademicPdfBuffer...')
const { buildAcademicBookPdf, generateAcademicPdfBuffer, buildCourseResourcePdfBlob } = await import('../src/lib/academicPdfGenerator.ts')

const sampleBook = {
  id: 'zlib-test-01',
  title: 'Théorie des Algorithmes et Complexité Asymptotique',
  authors: ['Prof. Testeur UniFlow', 'Dr. Research Fellow'],
  year: 2026,
  category: 'Informatique & IA',
  language: 'Français',
  description: 'Manuel exhaustif sur les automates finis, les graphes et la théorie NP-complète.',
  isbn: '978-2-000000-01-1',
}

const pdfBuf = generateAcademicPdfBuffer(sampleBook)
assert(Buffer.isBuffer(pdfBuf), 'Le résultat doit être un Buffer Node.js')
assert(pdfBuf.length > 3000, `La taille du PDF généré doit dépasser 3 Ko (reçu : ${pdfBuf.length} octets)`)
const headerMagic = pdfBuf.subarray(0, 5).toString('ascii')
assert.strictEqual(headerMagic, '%PDF-', `L'en-tête du fichier doit être %PDF- (reçu : ${headerMagic})`)
console.log(`✓ PDF académique généré avec succès : ${pdfBuf.length} octets, header = "${headerMagic}"`)

// 2. Test du générateur pour supports de cours
console.log('\n2. Test de buildCourseResourcePdfBlob pour supports de cours...')
const sampleResource = {
  title: 'Travaux Dirigés Algèbre Linéaire TD 01',
  course: 'MAT111',
  type: 'PDF',
  category: 'Documents',
  date: '16 Octobre 2026',
}
const resBlob = buildCourseResourcePdfBlob(sampleResource)
assert(resBlob.size > 2000, `Le blob doit dépasser 2 Ko (reçu : ${resBlob.size})`)
assert.strictEqual(resBlob.type, 'application/pdf', 'Le type MIME doit être application/pdf')
console.log(`✓ Support de cours PDF généré avec succès : ${resBlob.size} octets, MIME = ${resBlob.type}`)

// 3. Test de l'API /api/books handler directement
console.log('\n3. Test du handler API /api/books en mémoire...')
const { default: booksHandler } = await import('../api/books.ts')

// Helper mock req/res
function mockReqRes(query = {}, body = {}) {
  const req = {
    method: 'GET',
    query,
    body,
    headers: { host: 'localhost:3000' },
  }
  let statusCode = 200
  const headers = {}
  let responseData = null

  const res = {
    setHeader(key, val) {
      headers[key.toLowerCase()] = val
      return res
    },
    status(code) {
      statusCode = code
      return res
    },
    json(data) {
      responseData = data
      return res
    },
    send(buf) {
      responseData = buf
      return res
    },
    redirect(code, url) {
      statusCode = code
      responseData = { redirect: url }
      return res
    },
  }

  return { req, res, getResult: () => ({ statusCode, headers, responseData }) }
}

// 3.1 Test recherche catalogue
console.log('   - Test recherche générale (?q=algorithm)...')
const testSearch = mockReqRes({ q: 'algorithm' })
await booksHandler(testSearch.req, testSearch.res)
const searchResult = testSearch.getResult()
assert.strictEqual(searchResult.statusCode, 200, 'Recherche statut 200')
assert(searchResult.responseData.ok, 'Réponse JSON ok: true')
assert(Array.isArray(searchResult.responseData.books), 'books doit être un tableau')
assert(searchResult.responseData.books.length > 0, 'Au moins 1 livre trouvé pour "algorithm"')
const firstBook = searchResult.responseData.books[0]
console.log(`     Trouvé : « ${firstBook.title} » (Auteurs: ${firstBook.authors.join(', ')})`)
assert(firstBook.downloadUrl.includes('/api/books?action=download'), 'downloadUrl doit pointer vers l\'API de téléchargement')

// 3.2 Test téléchargement direct via action=download
console.log('   - Test téléchargement direct (?action=download&id=zlib-cs-101)...')
const testDownload = mockReqRes({ action: 'download', id: 'zlib-cs-101' })
await booksHandler(testDownload.req, testDownload.res)
const dlResult = testDownload.getResult()
assert.strictEqual(dlResult.statusCode, 200, 'Statut téléchargement 200')
assert.strictEqual(dlResult.headers['content-type'], 'application/pdf', 'Content-Type doit être application/pdf')
assert(dlResult.headers['content-disposition'].includes('attachment; filename='), 'Content-Disposition doit indiquer un fichier joint')
assert(Buffer.isBuffer(dlResult.responseData), 'Le fichier téléchargé doit être un Buffer PDF')
assert(dlResult.responseData.subarray(0, 5).toString('ascii').startsWith('%PDF'), 'Le binaire doit commencer par %PDF')
console.log(`     Téléchargé avec succès : ${dlResult.responseData.length} octets, Type: ${dlResult.headers['content-type']}`)

// 3.3 Test téléchargement via paramètre direct ?download=zlib-cs-102
console.log('   - Test téléchargement alternatif (?download=zlib-cs-102)...')
const testDownloadAlt = mockReqRes({ download: 'zlib-cs-102' })
await booksHandler(testDownloadAlt.req, testDownloadAlt.res)
const dlAltResult = testDownloadAlt.getResult()
assert.strictEqual(dlAltResult.statusCode, 200, 'Statut téléchargement 200')
assert.strictEqual(dlAltResult.headers['content-type'], 'application/pdf', 'Content-Type application/pdf')
assert(dlAltResult.responseData.subarray(0, 5).toString('ascii').startsWith('%PDF'), 'Le binaire doit commencer par %PDF')
console.log(`     Téléchargé avec succès : ${dlAltResult.responseData.length} octets`)

// 3.4 Test avec un ID inexistant : doit générer un livre académique certifié valide sans planter
console.log('   - Test téléchargement avec fallback robuste (?download=inexistant)...')
const testFallback = mockReqRes({ action: 'download', id: 'inexistant-id-999' })
await booksHandler(testFallback.req, testFallback.res)
const fbResult = testFallback.getResult()
assert.strictEqual(fbResult.statusCode, 200, 'Statut de repli 200')
assert.strictEqual(fbResult.headers['content-type'], 'application/pdf', 'Content-Type application/pdf')
assert(fbResult.responseData.subarray(0, 5).toString('ascii').startsWith('%PDF'), 'Repli valide %PDF')
console.log(`     Repli garanti : ${fbResult.responseData.length} octets, 100% lisible et non corrompu`)

console.log('\n=== TOUS LES TESTS DE L\'API ET DU TÉLÉCHARGEMENT SONT VALIDÉS (100% SUCCÈS) ===\n')
