import test from 'node:test'
import assert from 'node:assert/strict'
import {
  buildAcademicBookPdf,
  generateAcademicPdfBlob,
  generateAcademicPdfBuffer,
  buildCourseResourcePdfBlob,
} from './academicPdfGenerator.ts'
import booksHandler from '../../api/books.ts'

test('génération d’un livre académique en PDF standard et lisible', () => {
  const book = {
    id: 'zlib-cs-101',
    title: 'Structure and Interpretation of Computer Programs',
    authors: ['Harold Abelson', 'Gerald Jay Sussman'],
    year: 1996,
    category: 'Informatique & IA',
    language: 'Anglais',
    description: 'Le chef-d’œuvre mondial du MIT sur les principes fondamentaux de la programmation.',
  }

  const doc = buildAcademicBookPdf(book)
  assert.ok(doc, 'Le document jsPDF doit être instancié')

  const buf = generateAcademicPdfBuffer(book)
  assert.ok(Buffer.isBuffer(buf), 'Le résultat doit être un Buffer')
  assert.ok(buf.length > 5000, `La taille du PDF doit dépasser 5 Ko (reçu: ${buf.length})`)

  // Vérifier la signature magique standard ISO PDF (%PDF-)
  const magic = buf.subarray(0, 5).toString('ascii')
  assert.equal(magic, '%PDF-', 'Le fichier doit commencer par %PDF-')
})

test('génération d’un support de cours au format PDF valide', () => {
  const resource = {
    title: 'Algorithmique Avancée — Fiche de TD 03',
    course: 'INF111',
    type: 'PDF',
    category: 'Documents',
    date: '16 Octobre 2026',
  }

  const blob = buildCourseResourcePdfBlob(resource)
  assert.ok(blob.size > 2000, 'Le blob doit dépasser 2 Ko')
  assert.equal(blob.type, 'application/pdf', 'Le type MIME doit être application/pdf')
})

test('API /api/books : recherche et structure de réponse', async () => {
  const req = {
    method: 'GET',
    query: { q: 'algorithm', limit: '5' },
    body: {},
    headers: { host: 'localhost:3000' },
  } as any

  let responseData: any = null
  let statusCode = 200

  const res = {
    setHeader: () => res,
    status: (code: number) => {
      statusCode = code
      return res
    },
    json: (data: any) => {
      responseData = data
      return res
    },
    send: (buf: any) => {
      responseData = buf
      return res
    },
    redirect: () => res,
  } as any

  await booksHandler(req, res)

  assert.equal(statusCode, 200)
  assert.ok(responseData.ok, 'Réponse ok: true')
  assert.ok(Array.isArray(responseData.books), 'books doit être une liste')
  assert.ok(responseData.books.length > 0, 'Au moins un livre doit être retourné')

  const first = responseData.books[0]
  assert.ok(first.downloadUrl.includes('/api/books?action=download'), 'Le downloadUrl doit pointer vers l’API de téléchargement')
})

test('API /api/books : téléchargement direct retourne un PDF binaire certifié', async () => {
  const req = {
    method: 'GET',
    query: { action: 'download', id: 'zlib-cs-101' },
    body: {},
    headers: { host: 'localhost:3000' },
  } as any

  let responseData: any = null
  let contentType = ''
  let contentDisposition = ''
  let statusCode = 200

  const res = {
    setHeader: (key: string, val: string) => {
      if (key.toLowerCase() === 'content-type') contentType = val
      if (key.toLowerCase() === 'content-disposition') contentDisposition = val
      return res
    },
    status: (code: number) => {
      statusCode = code
      return res
    },
    json: (data: any) => {
      responseData = data
      return res
    },
    send: (buf: any) => {
      responseData = buf
      return res
    },
    redirect: () => res,
  } as any

  await booksHandler(req, res)

  assert.equal(statusCode, 200, 'Statut 200')
  assert.equal(contentType, 'application/pdf', 'Content-Type doit être application/pdf')
  assert.ok(contentDisposition.includes('attachment; filename='), 'Content-Disposition doit indiquer un fichier attaché')
  assert.ok(Buffer.isBuffer(responseData), 'Le fichier renvoyé doit être un buffer binaire')

  const magic = responseData.subarray(0, 5).toString('ascii')
  assert.equal(magic, '%PDF-', 'Le fichier binaire téléchargé doit impérativement débuter par %PDF-')
})
