// Sonde en direct de la matrice de droits de `/admin-directory` et du
// verrou STUDENT de `/academic-registration`, contre la Function déployée.
//
// Règles du propriétaire (2026-09-20) :
//   - `superadmin` (admin de la plateforme) : crée et modifie tout rôle ;
//   - `ADMIN` (administration) : crée et modifie TEACHER / DELEGATE / STUDENT
//     de sa propre université, jamais un ADMIN ;
//   - tout autre appelant : 403 ;
//   - un auto-inscrit est toujours STUDENT, quoi qu'il prétende.
// Le rôle réel est porté par les labels Appwrite (`ADMIN`, `TEACHER`,
// `DELEGATE`, `superadmin`) : chaque succès vérifie donc les labels du compte
// créé ou modifié, pas seulement la réponse de la Function.
//
// Le script provisionne des comptes jetables (superadmin, administration UY1,
// administration d'une autre université, étudiant) et supprime tout ce qu'il a
// créé, y compris les comptes créés par la Function pendant le test.
//
//   node scripts/test-admin-directory-matrix.mjs

import { apiKey, databaseId, endpoint, projectId, requireConfig } from './appwrite-env.mjs'

requireConfig()

const UY1 = 'Université de Yaoundé I'
const AUTRE = 'Université de Dschang'
const runId = `${Date.now()}${Math.floor(Math.random() * 10000)}`
const motDePasse = `UniFlowQa-${runId}!`

const comptes = {
  superadmin: { userId: `qasuper${runId}`.slice(0, 36), email: `qa-super-${runId}@example.invalid`, labels: ['ADMIN', 'superadmin'], university: UY1 },
  adminUy1: { userId: `qaadmin${runId}`.slice(0, 36), email: `qa-admin-${runId}@example.invalid`, labels: ['ADMIN'], university: UY1 },
  adminAutre: { userId: `qaautre${runId}`.slice(0, 36), email: `qa-autre-${runId}@example.invalid`, labels: ['ADMIN'], university: AUTRE },
  etudiant: { userId: `qaetud${runId}`.slice(0, 36), email: `qa-etud-${runId}@example.invalid`, labels: [], university: UY1 },
}

/** Comptes créés par la Function pendant le test, à supprimer à la fin. */
const creesParLaFunction = []

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
    body: JSON.stringify({ email: compte.email, password: motDePasse }),
  })
  const { cookie } = await responseOf(response)
  if (!cookie) throw new Error('SESSION_COOKIE_MISSING')
  return cookie.split(';')[0]
}

/** Exécute un service et rend son corps applicatif sans lever : un 403 est un résultat attendu. */
async function executer(cookie, path, body) {
  const response = await fetch(`${endpoint}/functions/uniflow-api/executions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Appwrite-Project': projectId, Cookie: cookie },
    body: JSON.stringify({ body: JSON.stringify(body), async: false, method: 'POST', path }),
  })
  const { payload } = await responseOf(response)
  const corps = payload.responseBody ? JSON.parse(payload.responseBody) : { ok: false, code: 'NO_BODY' }
  return { ...corps, status: payload.responseStatusCode }
}

async function provisionner(compte, role) {
  await admin('POST', '/users', { userId: compte.userId, email: compte.email, password: motDePasse, name: compte.userId })
  await admin('PUT', `/users/${compte.userId}/labels`, { labels: compte.labels })
  await admin('POST', `/databases/${databaseId}/collections/users/documents`, {
    documentId: compte.userId,
    data: { email: compte.email, name: compte.userId, username: compte.userId, accountType: 'UNIVERSITY', role, university: compte.university, program: 'ICT4D', level: 'L1', country: 'Cameroun' },
    permissions: [`read("user:${compte.userId}")`, `update("user:${compte.userId}")`, `delete("user:${compte.userId}")`],
  })
}

async function labelsDe(userId) {
  const { payload } = await admin('GET', `/users/${userId}`)
  return (payload.labels || []).slice().sort()
}

async function documentsDe(collection, attribut, valeur) {
  const query = encodeURIComponent(JSON.stringify({ method: 'equal', attribute: attribut, values: [valeur] }))
  const { payload } = await admin('GET', `/databases/${databaseId}/collections/${collection}/documents?queries[]=${query}`)
  return payload.documents || []
}

async function supprimerCompte(userId) {
  for (const enrollment of await documentsDe('academic_enrollments', 'studentId', userId).catch(() => [])) {
    await adminQuiet('DELETE', `/databases/${databaseId}/collections/academic_enrollments/documents/${enrollment.$id}`)
  }
  for (const entry of await documentsDe('academic_directory', 'userId', userId).catch(() => [])) {
    await adminQuiet('DELETE', `/databases/${databaseId}/collections/academic_directory/documents/${entry.$id}`)
  }
  await adminQuiet('DELETE', `/databases/${databaseId}/collections/users/documents/${userId}`)
  await adminQuiet('DELETE', `/users/${userId}`)
}

async function nettoyer() {
  for (const userId of creesParLaFunction) await supprimerCompte(userId)
  for (const compte of Object.values(comptes)) await supprimerCompte(compte.userId)
}

const etapes = []
function verifier(intitule, condition, detail = '') {
  etapes.push({ intitule, ok: Boolean(condition), detail })
  console.log(`${condition ? '  ok  ' : ' ÉCHEC'} ${intitule}${detail ? ` — ${detail}` : ''}`)
}

const nouveauCompte = (suffixe, role) => ({
  action: 'create',
  name: `QA ${suffixe} ${runId}`,
  email: `qa-${suffixe}-${runId}@example.invalid`,
  password: motDePasse,
  role,
  program: 'ICT4D',
  level: 'L1',
})

try {
  await provisionner(comptes.superadmin, 'ADMIN')
  await provisionner(comptes.adminUy1, 'ADMIN')
  await provisionner(comptes.adminAutre, 'ADMIN')
  // Le document `users` de l'étudiant prétend ADMIN : c'est exactement ce que
  // le contrat des labels doit rendre inoffensif.
  await provisionner(comptes.etudiant, 'ADMIN')

  const [cSuper, cAdmin, cAutre, cEtudiant] = await Promise.all([
    sessionDe(comptes.superadmin), sessionDe(comptes.adminUy1), sessionDe(comptes.adminAutre), sessionDe(comptes.etudiant),
  ])
  const dir = (cookie, body) => executer(cookie, '/admin-directory', body)

  // --- Un étudiant (même avec `role: ADMIN` dans son document) est refusé ---
  const refusListe = await dir(cEtudiant, { action: 'list' })
  verifier('un étudiant ne liste pas les comptes malgré users.role=ADMIN', refusListe.ok === false && refusListe.code === 'ADMIN_REQUIRED', `${refusListe.status} ${refusListe.code}`)
  const refusCreation = await dir(cEtudiant, nouveauCompte('intrus', 'TEACHER'))
  verifier('un étudiant ne crée pas d’enseignant', refusCreation.ok === false && refusCreation.code === 'ADMIN_REQUIRED' && refusCreation.status === 403, `${refusCreation.status} ${refusCreation.code}`)

  // --- Une administration ne crée pas d'ADMIN --------------------------------
  const refusAdmin = await dir(cAdmin, nouveauCompte('faux-admin', 'ADMIN'))
  verifier('une administration ne crée pas de compte administration', refusAdmin.ok === false && refusAdmin.code === 'SUPERADMIN_REQUIRED' && refusAdmin.status === 403, `${refusAdmin.status} ${refusAdmin.code}`)

  // --- Une administration crée un enseignant de son université --------------
  const enseignant = await dir(cAdmin, nouveauCompte('prof', 'TEACHER'))
  if (enseignant.userId) creesParLaFunction.push(enseignant.userId)
  verifier('une administration crée un enseignant', enseignant.ok === true && Boolean(enseignant.userId), `${enseignant.status} ${enseignant.code || enseignant.userId}`)
  verifier('le compte créé porte le label TEACHER', enseignant.userId && (await labelsDe(enseignant.userId)).join(',') === 'TEACHER')
  const profilProf = enseignant.userId ? await admin('GET', `/databases/${databaseId}/collections/users/documents/${enseignant.userId}`) : null
  verifier('le miroir users.role et l’université sont écrits', profilProf?.payload.role === 'TEACHER' && profilProf?.payload.university === UY1, `${profilProf?.payload.role} / ${profilProf?.payload.university}`)
  const annuaireProf = enseignant.userId ? await documentsDe('academic_directory', 'userId', enseignant.userId) : []
  verifier('l’entrée d’annuaire est créée', annuaireProf.length === 1 && annuaireProf[0].role === 'TEACHER', String(annuaireProf[0]?.role))

  // --- Une autre université ne touche pas à ce compte ------------------------
  const horsScope = await dir(cAutre, { action: 'update', userId: enseignant.userId, name: 'Pirate' })
  verifier('une administration d’une autre université ne modifie pas le compte', horsScope.ok === false && horsScope.code === 'UNIVERSITY_SCOPE_DENIED', `${horsScope.status} ${horsScope.code}`)
  const listeAutre = await dir(cAutre, { action: 'list' })
  verifier('la liste d’une autre université ne montre pas ce compte', listeAutre.ok === true && !(listeAutre.entries || []).some((entry) => entry.userId === enseignant.userId), `${(listeAutre.entries || []).length} entrées`)

  // --- Changement de rôle par l'administration -------------------------------
  const promu = await dir(cAdmin, { action: 'update', userId: enseignant.userId, role: 'DELEGATE' })
  verifier('une administration change TEACHER → DELEGATE', promu.ok === true && promu.role === 'DELEGATE', `${promu.status} ${promu.code || promu.role}`)
  verifier('les labels suivent le nouveau rôle', (await labelsDe(enseignant.userId)).join(',') === 'DELEGATE')
  const versAdmin = await dir(cAdmin, { action: 'update', userId: enseignant.userId, role: 'ADMIN' })
  verifier('une administration ne promeut pas en ADMIN', versAdmin.ok === false && versAdmin.code === 'SUPERADMIN_REQUIRED', `${versAdmin.status} ${versAdmin.code}`)
  const versEtudiant = await dir(cAdmin, { action: 'update', userId: enseignant.userId, role: 'STUDENT' })
  verifier('une administration rétrograde en STUDENT (aucun label)', versEtudiant.ok === true && (await labelsDe(enseignant.userId)).length === 0, `${versEtudiant.status} ${versEtudiant.code || versEtudiant.role}`)

  // --- La liste de l'administration reflète les labels -----------------------
  const liste = await dir(cAdmin, { action: 'list', program: 'ICT4D' })
  const entree = (liste.entries || []).find((row) => row.userId === enseignant.userId)
  verifier('la liste UY1 montre le compte avec son rôle réel', liste.ok === true && entree?.role === 'STUDENT', String(entree?.role))
  verifier('la liste expose l’appelant (rôle, université)', liste.caller?.role === 'ADMIN' && liste.caller?.university === UY1)

  // --- Le superadmin crée un ADMIN ------------------------------------------
  // Suffixe distinct de `qa-admin` (déjà pris par le compte jetable adminUy1) :
  // un email en double renvoie 409 et ferait passer un conflit pour un refus.
  const administration = await dir(cSuper, { ...nouveauCompte('direction', 'ADMIN'), university: AUTRE })
  if (administration.userId) creesParLaFunction.push(administration.userId)
  verifier('le superadmin crée une administration (autre université)', administration.ok === true && Boolean(administration.userId), `${administration.status} ${administration.code ? `${administration.code} ${administration.message}` : administration.userId}`)
  verifier('le compte créé porte le label ADMIN', administration.userId && (await labelsDe(administration.userId)).join(',') === 'ADMIN')
  const retoucheAdmin = await dir(cAdmin, { action: 'update', userId: administration.userId, name: 'Pirate' })
  verifier('une administration ne modifie pas un compte ADMIN', retoucheAdmin.ok === false && ['SUPERADMIN_REQUIRED', 'UNIVERSITY_SCOPE_DENIED'].includes(retoucheAdmin.code), `${retoucheAdmin.status} ${retoucheAdmin.code}`)
  const retoucheSuper = await dir(cSuper, { action: 'update', userId: administration.userId, name: `QA admin renommé ${runId}` })
  verifier('le superadmin modifie un compte ADMIN', retoucheSuper.ok === true, `${retoucheSuper.status} ${retoucheSuper.code || 'ok'}`)

  // --- Suppression -----------------------------------------------------------
  const suppressionParAdmin = await dir(cAdmin, { action: 'delete', userId: administration.userId })
  verifier('une administration ne supprime pas un compte ADMIN', suppressionParAdmin.ok === false, `${suppressionParAdmin.status} ${suppressionParAdmin.code}`)
  const suppression = await dir(cSuper, { action: 'delete', userId: administration.userId })
  verifier('le superadmin supprime le compte ADMIN', suppression.ok === true, `${suppression.status} ${suppression.code || 'ok'}`)
  if (suppression.ok) creesParLaFunction.splice(creesParLaFunction.indexOf(administration.userId), 1)

  // --- Auto-inscription : toujours STUDENT ----------------------------------
  const provision = await executer(cEtudiant, '/academic-registration', { action: 'provision', role: 'ADMIN', matricule: `QA-${runId}` })
  verifier('l’auto-inscription réussit malgré le rôle ADMIN demandé', provision.ok === true, `${provision.status} ${provision.code || `${provision.enrollmentsCreated} inscriptions`}`)
  const annuaireEtudiant = await documentsDe('academic_directory', 'userId', comptes.etudiant.userId)
  verifier('l’annuaire de l’auto-inscrit dit STUDENT', annuaireEtudiant[0]?.role === 'STUDENT', String(annuaireEtudiant[0]?.role))
  const profilEtudiant = await admin('GET', `/databases/${databaseId}/collections/users/documents/${comptes.etudiant.userId}`)
  verifier('le miroir users.role de l’auto-inscrit est remis à STUDENT', profilEtudiant.payload.role === 'STUDENT', String(profilEtudiant.payload.role))
  verifier('l’auto-inscrit est inscrit aux cours de sa filière et de son niveau', (provision.totalCourses || 0) > 0 && (await documentsDe('academic_enrollments', 'studentId', comptes.etudiant.userId)).length === provision.totalCourses, `${provision.totalCourses} cours`)
} finally {
  await nettoyer()
}

const echecs = etapes.filter((etape) => !etape.ok)
console.log(`\n${etapes.length - echecs.length}/${etapes.length} vérifications passées.`)
if (echecs.length) {
  console.error(`Échecs : ${echecs.map((etape) => etape.intitule).join(' | ')}`)
  process.exit(1)
}
