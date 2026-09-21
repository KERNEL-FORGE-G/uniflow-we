// Vérifie, contre la Function déployée, que le service `/app-releases` réserve
// bien l'écriture au label `superadmin`.
//
// La collection `app_releases` est lisible par tous (`read("any")`, la landing
// l'affiche sans session) et n'accorde aucune écriture côté client : ce
// service est la seule porte. S'il laissait passer un ADMIN d'université ou un
// étudiant, n'importe quel compte pourrait remplacer le lien de l'APK que des
// inconnus téléchargent depuis la page d'accueil.
//
// Le script provisionne deux comptes jetables — un sans label (contre-épreuve
// 403) et un portant `superadmin` — exerce `list` et `upsert`, puis supprime
// tout ce qu'il a créé. Le document `android` réel, s'il existe, est sauvegardé
// au départ et **restauré** à la fin : le lien public ne doit jamais rester sur
// une valeur de test, ni disparaître.
//
//   node scripts/test-app-releases-function.mjs

import { apiKey, databaseId, endpoint, projectId, requireConfig } from './appwrite-env.mjs'

requireConfig()
const runId = `${Date.now()}${Math.floor(Math.random() * 1000)}`
const student = { userId: `qarelstu${runId}`.slice(0, 36), email: `qarel-s-${runId}@example.invalid`, password: `UniFlowQa-${runId}!`, labels: [] }
const superadmin = { userId: `qarelsup${runId}`.slice(0, 36), email: `qarel-a-${runId}@example.invalid`, password: `UniFlowQa-${runId}!`, labels: ['superadmin'] }

async function responseOf(response) {
  const text = await response.text()
  let payload = {}
  try { payload = text ? JSON.parse(text) : {} } catch { payload = { raw: text } }
  if (!response.ok) throw new Error(`${response.status}:${payload.message || text}`)
  return { payload, cookie: response.headers.get('set-cookie') || '' }
}
async function admin(method, path, body) {
  return responseOf(await fetch(`${endpoint}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', 'X-Appwrite-Project': projectId, 'X-Appwrite-Key': apiKey },
    body: body === undefined ? undefined : JSON.stringify(body),
  }))
}
async function quiet(method, path) { try { await admin(method, path) } catch { /* nettoyage */ } }
async function sessionOf(account) {
  const { cookie } = await responseOf(await fetch(`${endpoint}/account/sessions/email`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Appwrite-Project': projectId },
    body: JSON.stringify({ email: account.email, password: account.password }),
  }))
  return cookie.split(';')[0]
}
async function execute(body, cookie) {
  const headers = { 'Content-Type': 'application/json', 'X-Appwrite-Project': projectId }
  if (cookie) headers.Cookie = cookie
  const { payload } = await responseOf(await fetch(`${endpoint}/functions/uniflow-api/executions`, {
    method: 'POST', headers,
    body: JSON.stringify({ body: JSON.stringify(body), async: false, method: 'POST', path: '/app-releases' }),
  }))
  return { status: payload.responseStatusCode, body: payload.responseBody ? JSON.parse(payload.responseBody) : null, duration: payload.duration }
}
async function provision(account) {
  await admin('POST', '/users', { userId: account.userId, email: account.email, password: account.password, name: account.userId })
  await admin('PUT', `/users/${account.userId}/labels`, { labels: account.labels })
}

const steps = []
function check(label, ok, detail = '') {
  steps.push(ok)
  console.log(`${ok ? '  ok  ' : ' ÉCHEC'} ${label}${detail ? ` — ${detail}` : ''}`)
}

const url = 'https://github.com/KERNEL-FORGE-G/uniflow-apps/releases/download/v0.0.0-qa/uniflow-qa.apk'
const PLATFORM = 'android'
const documentPath = `/databases/${databaseId}/collections/app_releases/documents/${PLATFORM}`
const RELEASE_FIELDS = ['platform', 'version', 'url', 'fileName', 'sizeBytes', 'sha256', 'notes', 'publishedAt', 'enabled']

// Le document `android` est celui que la page d'accueil sert au public. Le
// 2026-09-21, une exécution de ce script a écrasé puis effacé le lien réel de
// l'APK 1.0.0 pendant quelques minutes : on le sauvegarde donc au départ et on
// le remet en place à la fin, quoi qu'il arrive.
const existing = await admin('GET', documentPath).then(({ payload }) => Object.fromEntries(RELEASE_FIELDS.map((field) => [field, payload[field]]))).catch(() => null)
const totalBefore = await admin('GET', `/databases/${databaseId}/collections/app_releases/documents`).then(({ payload }) => payload.total)
if (existing) console.log(`Document ${PLATFORM} existant (version ${existing.version}) sauvegardé ; il sera restauré à la fin.\n`)

try {
  const anonymous = await execute({ action: 'list' })
  check('list anonyme (sans session) répond 200 ok', anonymous.status === 200 && anonymous.body?.ok === true, `${anonymous.status} releases=${JSON.stringify(anonymous.body?.releases?.map((r) => r.platform + ':' + r.version))} en ${anonymous.duration?.toFixed?.(2)} s`)

  const refusedAnonymous = await execute({ action: 'upsert', platform: PLATFORM, version: '1', url })
  check('upsert anonyme refusé 401 AUTH_REQUIRED', refusedAnonymous.status === 401 && refusedAnonymous.body?.code === 'AUTH_REQUIRED', refusedAnonymous.body?.code)

  await provision(student)
  await provision(superadmin)
  const studentCookie = await sessionOf(student)
  const superCookie = await sessionOf(superadmin)

  const refusedStudent = await execute({ action: 'upsert', platform: PLATFORM, version: '1', url }, studentCookie)
  check('upsert par un compte sans label superadmin refusé 403 SUPERADMIN_REQUIRED', refusedStudent.status === 403 && refusedStudent.body?.code === 'SUPERADMIN_REQUIRED', refusedStudent.body?.code)

  const invalid = await execute({ action: 'upsert', platform: PLATFORM, version: '1', url: 'http://insecure.example/x.apk' }, superCookie)
  check('upsert superadmin avec URL http refusé 400 RELEASE_INVALID', invalid.status === 400 && invalid.body?.code === 'RELEASE_INVALID', invalid.body?.message)

  const created = await execute({ action: 'upsert', platform: PLATFORM, version: '0.0.0-qa', url, fileName: 'uniflow-qa.apk', sizeBytes: 44355174, sha256: 'A'.repeat(64), notes: 'test', enabled: false }, superCookie)
  check('upsert superadmin crée le document android (dépublié)', created.status === 200 && created.body?.ok === true && created.body?.release?.platform === PLATFORM && created.body?.release?.enabled === false && created.body?.release?.sha256 === 'a'.repeat(64), JSON.stringify(created.body?.release))

  const doc = await admin('GET', documentPath)
  check('le document a pour $id la plateforme et porte read("any")', doc.payload.$id === PLATFORM && (doc.payload.$permissions || []).includes('read("any")'), (doc.payload.$permissions || []).join(' '))

  const updated = await execute({ action: 'upsert', platform: PLATFORM, version: '0.0.1-qa', url, enabled: false }, superCookie)
  check('second upsert met à jour sans doublon', updated.status === 200 && updated.body?.release?.version === '0.0.1-qa', updated.body?.release?.version)
  const count = await admin('GET', `/databases/${databaseId}/collections/app_releases/documents`)
  const expectedTotal = totalBefore + (existing ? 0 : 1)
  check(`un seul document ${PLATFORM}`, count.payload.total === expectedTotal, `total=${count.payload.total} (attendu ${expectedTotal})`)

  const hasPlatform = (list) => Boolean(list?.releases?.some((r) => r.platform === PLATFORM))
  const publicList = await execute({ action: 'list' })
  check('list public n’expose pas la release dépubliée', publicList.status === 200 && !hasPlatform(publicList.body), JSON.stringify(publicList.body?.releases?.map((r) => r.platform)))
  const adminList = await execute({ action: 'list', all: true }, superCookie)
  check('list all=true pour le superadmin la montre', adminList.body?.includeDisabled === true && adminList.body?.releases?.some((r) => r.platform === PLATFORM && r.enabled === false), JSON.stringify(adminList.body?.releases?.map((r) => r.platform + ':' + r.enabled)))
  const studentAll = await execute({ action: 'list', all: true }, studentCookie)
  check('list all=true pour un autre compte est ignoré', studentAll.body?.includeDisabled === false && !hasPlatform(studentAll.body), JSON.stringify(studentAll.body))
} finally {
  if (existing) {
    // Restauration du lien public tel qu'il était avant le test.
    await admin('PATCH', documentPath, { data: existing }).then(
      () => console.log(`\nDocument ${PLATFORM} restauré (version ${existing.version}, ${existing.enabled ? 'publié' : 'dépublié'}).`),
      (error) => console.error(`\nÉCHEC de la restauration du document ${PLATFORM} : ${error.message}\nÀ rejouer : node scripts/set-app-release.mjs ${PLATFORM} --url "${existing.url}" --version "${existing.version}" …`),
    )
  } else {
    await quiet('DELETE', documentPath)
  }
  await quiet('DELETE', `/users/${student.userId}`)
  await quiet('DELETE', `/users/${superadmin.userId}`)
  const left = await admin('GET', `/databases/${databaseId}/collections/app_releases/documents`).catch(() => ({ payload: { total: '?' } }))
  console.log(`Nettoyage : documents restants dans app_releases = ${left.payload.total} (attendu ${totalBefore}).`)
}
console.log(`${steps.filter(Boolean).length}/${steps.length} vérifications passées.`)
if (steps.some((ok) => !ok)) process.exit(1)
