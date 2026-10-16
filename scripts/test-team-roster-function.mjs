// Vérifie que la Function `team-roster` réserve bien les écritures aux ADMIN.
//
// C'est la seule barrière de la page Équipe : la collection `team_members` est
// lisible par tout le monde (`read("any")`, la page publique s'affiche sans
// session) mais n'accorde **aucune** écriture au niveau collection. Si la
// Function laissait passer un étudiant, n'importe quel compte connecté pourrait
// effacer la page publique de l'équipe — et rien d'autre ne l'en empêcherait.
//
// Le script provisionne donc deux comptes jetables, un ADMIN et un STUDENT,
// exerce les trois actions avec les deux, puis supprime tout ce qu'il a créé.
// La contre-épreuve est le refus de l'étudiant : sans elle, un succès ne
// prouverait pas que le contrôle de rôle existe.
//
//   node scripts/test-team-roster-function.mjs

import { apiKey, databaseId, endpoint, projectId, requireConfig } from './appwrite-env.mjs'

const collectionId = 'team_members'
const profileCollectionId = 'users'
const avatarBucketId = 'uniflow_assets'

requireConfig()

const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64')

const runId = `${Date.now()}${Math.floor(Math.random() * 10000)}`
const adminAccount = { userId: `qateama${runId}`.slice(0, 36), email: `qateam-a-${runId}@example.invalid`, password: `UniFlowQa-${runId}!`, role: 'ADMIN' }
const etudiantAccount = { userId: `qateamb${runId}`.slice(0, 36), email: `qateam-b-${runId}@example.invalid`, password: `UniFlowQa-${runId}!`, role: 'STUDENT' }

let membreId = ''
let photoIds = []

async function responseOf(response) {
  const text = await response.text()
  let payload = {}
  try { payload = text ? JSON.parse(text) : {} } catch { payload = { raw: text } }
  if (!response.ok) throw new Error(`${response.status}:${payload.message || text || 'Appwrite error'}`)
  return { payload, cookie: response.headers.get('set-cookie') || '' }
}

async function admin(method, path, body) {
  const response = await fetch(`${endpoint}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', 'X-Appwrite-Project': projectId, 'X-Appwrite-Key': apiKey },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  return responseOf(response)
}

async function adminQuiet(method, path) {
  try { await admin(method, path) } catch { /* nettoyage : un échec ne doit pas masquer le verdict */ }
}

async function sessionDe(compte) {
  const response = await fetch(`${endpoint}/account/sessions/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Appwrite-Project': projectId },
    body: JSON.stringify({ email: compte.email, password: compte.password }),
  })
  const { cookie } = await responseOf(response)
  if (!cookie) throw new Error('SESSION_COOKIE_MISSING')
  return cookie.split(';')[0]
}

/**
 * Exécute la Function et rend son corps applicatif **sans lever** : le refus
 * d'un étudiant est le résultat attendu, pas une erreur du script.
 */
async function executer(cookie, body) {
  const response = await fetch(`${endpoint}/functions/uniflow-api/executions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Appwrite-Project': projectId, Cookie: cookie },
    body: JSON.stringify({ body: JSON.stringify(body), async: false, method: 'POST', path: '/team-roster' }),
  })
  const { payload } = await responseOf(response)
  return payload.responseBody ? JSON.parse(payload.responseBody) : { ok: false, code: 'NO_BODY' }
}

/** Téléverse une photo avec la session de l'administrateur. */
async function televerserPhoto(cookie) {
  const form = new FormData()
  const fileId = `qateam${runId}${photoIds.length}`.slice(0, 36)
  form.set('fileId', fileId)
  form.set('file', new Blob([PNG], { type: 'image/png' }), 'qateam.png')
  form.append('permissions[]', 'read("any")')
  const response = await fetch(`${endpoint}/storage/buckets/${avatarBucketId}/files`, {
    method: 'POST',
    // Surtout pas de `Content-Type` : le multipart porte le sien.
    headers: { 'X-Appwrite-Project': projectId, Cookie: cookie },
    body: form,
  })
  await responseOf(response)
  photoIds.push(fileId)
  return fileId
}

async function provisionner(compte) {
  await admin('POST', '/users', { userId: compte.userId, email: compte.email, password: compte.password, name: compte.userId })
  // La Function lit le rôle dans les labels Appwrite, pas dans le document
  // `users` (que son propriétaire peut réécrire) : sans ce label, l'ADMIN de
  // test recevrait ADMIN_REQUIRED et le script conclurait à tort à une panne.
  await admin('PUT', `/users/${compte.userId}/labels`, { labels: compte.role === 'STUDENT' ? [] : [compte.role] })
  await admin('POST', `/databases/${databaseId}/collections/${profileCollectionId}/documents`, {
    documentId: compte.userId,
    data: {
      email: compte.email,
      name: compte.userId,
      username: compte.userId,
      accountType: 'UNIVERSITY',
      role: compte.role,
      university: 'Université de Yaoundé I',
      program: 'ICT4D',
      level: 'L1',
      country: 'Cameroun',
    },
    permissions: [`read("user:${compte.userId}")`, `update("user:${compte.userId}")`, `delete("user:${compte.userId}")`],
  })
}

async function nettoyer() {
  if (membreId) await adminQuiet('DELETE', `/databases/${databaseId}/collections/${collectionId}/documents/${membreId}`)
  for (const fileId of photoIds) await adminQuiet('DELETE', `/storage/buckets/${avatarBucketId}/files/${fileId}`)
  for (const compte of [adminAccount, etudiantAccount]) {
    await adminQuiet('DELETE', `/databases/${databaseId}/collections/${profileCollectionId}/documents/${compte.userId}`)
    await adminQuiet('DELETE', `/users/${compte.userId}`)
  }
}

const etapes = []
function verifier(intitule, condition, detail = '') {
  etapes.push({ intitule, ok: Boolean(condition), detail })
  console.log(`${condition ? '  ok  ' : ' ÉCHEC'} ${intitule}${detail ? ` — ${detail}` : ''}`)
}

try {
  await provisionner(adminAccount)
  await provisionner(etudiantAccount)
  const cookieAdmin = await sessionDe(adminAccount)
  const cookieEtudiant = await sessionDe(etudiantAccount)

  // --- Contre-épreuve : un étudiant ne doit rien pouvoir écrire -------------
  const refus = await executer(cookieEtudiant, { action: 'create', slug: `qa-etudiant-${runId}`, name: 'QA Étudiant', role: 'Intrus', team: 'Frontend' })
  verifier('un étudiant ne peut pas créer un membre', refus.ok === false && refus.code === 'ADMIN_REQUIRED', refus.code || refus.message)

  const refusSuppression = await executer(cookieEtudiant, { action: 'delete', memberId: 'ravel' })
  verifier('un étudiant ne peut pas supprimer un membre', refusSuppression.ok === false && refusSuppression.code === 'ADMIN_REQUIRED', refusSuppression.code || refusSuppression.message)

  // --- Création par l'administrateur ---------------------------------------
  const creation = await executer(cookieAdmin, {
    action: 'create',
    slug: `qa-membre-${runId}`,
    name: 'QA Membre',
    github: '@qa-handle',
    email: 'qa@example.invalid',
    team: 'Backend',
    subTeam: 'Sous-équipe QA',
    role: 'Développeur QA',
    badge: 'QA',
    accent: 'rose',
    displayOrder: 99,
  })
  membreId = creation.memberId || ''
  verifier('un administrateur crée un membre', creation.ok === true && Boolean(membreId), membreId)

  const cree = await admin('GET', `/databases/${databaseId}/collections/${collectionId}/documents/${membreId}`)
  verifier('le document porte la lecture publique', (cree.payload.$permissions || []).includes('read("any")'), (cree.payload.$permissions || []).join(' '))
  verifier('le @ est retiré du pseudo GitHub', cree.payload.github === 'qa-handle', String(cree.payload.github))

  // Lecture sans session : c'est ce que fait la page publique /teams.
  const publique = await fetch(`${endpoint}/databases/${databaseId}/collections/${collectionId}/documents/${membreId}`, {
    headers: { 'X-Appwrite-Project': projectId },
  })
  verifier('un visiteur non connecté lit le membre', publique.ok, String(publique.status))

  const accentInvalide = await executer(cookieAdmin, { action: 'create', slug: `qa-accent-${runId}`, name: 'QA Accent', role: 'QA', team: 'Frontend', accent: 'turquoise' })
  verifier('une couleur hors liste est refusée', accentInvalide.ok === false && accentInvalide.code === 'TEAM_ROSTER_ERROR', accentInvalide.message)

  const equipeInvalide = await executer(cookieAdmin, { action: 'create', slug: `qa-team-${runId}`, name: 'QA Équipe', role: 'QA', team: 'Marketing' })
  verifier('une équipe hors liste est refusée', equipeInvalide.ok === false, equipeInvalide.message)

  // --- Modification, et remplacement de la photo ---------------------------
  const premierePhoto = await televerserPhoto(cookieAdmin)
  const avecPhoto = await executer(cookieAdmin, { action: 'update', memberId: membreId, avatarFileId: premierePhoto })
  verifier('la photo est attachée au membre', avecPhoto.ok === true, avecPhoto.message)

  const secondePhoto = await televerserPhoto(cookieAdmin)
  const remplacee = await executer(cookieAdmin, { action: 'update', memberId: membreId, avatarFileId: secondePhoto, badge: 'QA v2' })
  verifier('le membre est modifié', remplacee.ok === true, remplacee.message)

  const ancienne = await fetch(`${endpoint}/storage/buckets/${avatarBucketId}/files/${premierePhoto}`, {
    headers: { 'X-Appwrite-Project': projectId, 'X-Appwrite-Key': apiKey },
  })
  verifier('l’ancienne photo est supprimée du bucket', ancienne.status === 404, String(ancienne.status))

  const apres = await admin('GET', `/databases/${databaseId}/collections/${collectionId}/documents/${membreId}`)
  verifier('le libellé de la pastille est mis à jour', apres.payload.badge === 'QA v2', String(apres.payload.badge))
  verifier('les champs omis sont conservés', apres.payload.name === 'QA Membre' && apres.payload.subTeam === 'Sous-équipe QA', `${apres.payload.name} / ${apres.payload.subTeam}`)

  // --- Suppression ---------------------------------------------------------
  const suppression = await executer(cookieAdmin, { action: 'delete', memberId: membreId })
  verifier('un administrateur supprime le membre', suppression.ok === true, suppression.message)
  membreId = ''

  const disparu = await fetch(`${endpoint}/databases/${databaseId}/collections/${collectionId}/documents/${creation.memberId}`, {
    headers: { 'X-Appwrite-Project': projectId, 'X-Appwrite-Key': apiKey },
  })
  verifier('le document a disparu', disparu.status === 404, String(disparu.status))

  const photoSupprimee = await fetch(`${endpoint}/storage/buckets/${avatarBucketId}/files/${secondePhoto}`, {
    headers: { 'X-Appwrite-Project': projectId, 'X-Appwrite-Key': apiKey },
  })
  verifier('la photo du membre supprimé est retirée du bucket', photoSupprimee.status === 404, String(photoSupprimee.status))
  photoIds = []

  // --- L'équipe réelle n'a pas bougé ---------------------------------------
  // Requêtes au format JSON : le serveur est en Appwrite 1.6.1, où la syntaxe
  // historique `limit(100)` / `orderAsc("displayOrder")` est refusée avec
  // « Invalid query: Syntax error ». C'est le format qu'émettent les SDK 17
  // (web) et 26 (Flutter) ; un script écrit à la main doit s'y conformer aussi.
  const equipe = await admin('GET', `/databases/${databaseId}/collections/${collectionId}/documents`
    + `?queries[]=${encodeURIComponent(JSON.stringify({ method: 'limit', values: [100] }))}`
    + `&queries[]=${encodeURIComponent(JSON.stringify({ method: 'orderAsc', values: ['displayOrder'] }))}`)
  const restants = (equipe.payload.documents || []).map((document) => document.slug)
  verifier('les neuf membres de l’équipe sont toujours là', restants.length === 9 && restants.includes('ravel'), restants.join(', '))
  verifier('l’ordre d’affichage est respecté', restants[0] === 'ravel', restants.slice(0, 3).join(', '))
} finally {
  await nettoyer()
}

const echecs = etapes.filter((etape) => !etape.ok)
console.log(`\n${etapes.length - echecs.length}/${etapes.length} vérifications passées.`)
if (echecs.length) {
  console.error(`Échecs : ${echecs.map((etape) => etape.intitule).join(' | ')}`)
  process.exit(1)
}
