/**
 * Test de bout en bout de l'inscription universitaire, contre Appwrite Cloud.
 *
 * Rejoue, en REST et avec les droits d'un simple client, la séquence exacte
 * des trois applications (`createAccount` du web, `register` du mobile et du
 * desktop) : compte → session → document `users` → service
 * `/academic-registration`. Puis vérifie les deux cas qui ont fait échouer
 * l'inscription le 2026-09-21 :
 *
 *  1. filière et niveau **avec** cours publiés (ICT4D L3, données provisoires) :
 *     annuaire créé, inscription à tous les cours, `coursesReady: true` ;
 *  2. filière et niveau **sans** cours publiés : le service répondait 409
 *     « pas encore disponibles » et le client affichait « Compte créé, mais… ».
 *     Il doit désormais répondre `ok: true, coursesReady: false`, annuaire créé.
 *
 * Le second appel `provision` doit être idempotent (aucune inscription en
 * double). Les comptes de test sont supprimés par le service `/account`
 * (`delete-self`), ce qui exerce aussi le droit à l'effacement ; en cas d'échec,
 * la clé serveur nettoie.
 *
 * Usage : node scripts/test-registration-flow.mjs
 */
import { randomUUID } from 'node:crypto'
import { apiKey, databaseId, endpoint, projectId, requireConfig } from './appwrite-env.mjs'

requireConfig()

const FUNCTION_ID = process.env.APPWRITE_API_FUNCTION_ID || 'uniflow-api'
const UNIVERSITY = 'Université de Yaoundé I'
const runId = `${Date.now().toString(36)}${randomUUID().slice(0, 4)}`.toLowerCase()
const password = `Insc!${randomUUID().replaceAll('-', '')}`
const createdUsers = []
let failures = 0

function check(condition, label, detail = '') {
  if (condition) {
    console.log(`  ✔ ${label}`)
  } else {
    failures += 1
    console.log(`  ✖ ${label}${detail ? ` — ${detail}` : ''}`)
  }
}

async function request(path, { method = 'GET', body, headers = {}, expectOk = true } = {}) {
  let response
  for (let attempt = 1; ; attempt += 1) {
    response = await fetch(`${endpoint}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json', 'X-Appwrite-Project': projectId, ...headers },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
    if (![502, 503, 504].includes(response.status) || attempt >= 4) break
    await new Promise((resolve) => setTimeout(resolve, 1500 * attempt))
  }
  const text = await response.text()
  let data = {}
  try { data = text ? JSON.parse(text) : {} } catch { data = { message: text } }
  if (expectOk && !response.ok) throw new Error(`${method} ${path} (${response.status}) : ${data.message || text}`)
  const cookies = typeof response.headers.getSetCookie === 'function' ? response.headers.getSetCookie() : []
  return { status: response.status, data, cookie: cookies.map((value) => value.split(';', 1)[0]).join('; ') }
}

const server = { 'X-Appwrite-Key': apiKey }

/** La séquence client, telle que les trois applications l'exécutent. */
async function registerLikeAClient(kind, { program, level }) {
  const email = `inscription.${kind}.${runId}@uniflow.test`
  const name = `Test inscription ${kind.toUpperCase()}`
  const account = await request('/account', { method: 'POST', body: { userId: 'unique()', email, password, name } })
  const userId = account.data.$id
  createdUsers.push(userId)
  const session = await request('/account/sessions/email', { method: 'POST', body: { email, password } })
  const asUser = { Cookie: session.cookie }
  await request('/account/prefs', { method: 'PATCH', headers: asUser, body: { prefs: { uniflowAccountType: 'UNIVERSITY' } } })
  await request(`/databases/${databaseId}/collections/users/documents`, {
    method: 'POST',
    headers: asUser,
    body: {
      documentId: userId,
      data: { email, name, accountType: 'UNIVERSITY', role: 'STUDENT', university: UNIVERSITY, faculty: 'Faculté des Sciences', program, level, country: 'Cameroun' },
      permissions: [`read("user:${userId}")`, `update("user:${userId}")`, `delete("user:${userId}")`],
    },
  })
  const jwt = await request('/account/jwt', { method: 'POST', headers: asUser })
  return { userId, email, headers: { 'X-Appwrite-JWT': jwt.data.jwt } }
}

async function callService(path, payload, headers) {
  const execution = await request(`/functions/${FUNCTION_ID}/executions`, {
    method: 'POST',
    headers,
    body: { body: JSON.stringify(payload), async: false, path, method: 'POST', headers: { 'content-type': 'application/json' } },
  })
  let response = {}
  try { response = JSON.parse(execution.data.responseBody || '{}') } catch { response = { message: execution.data.responseBody } }
  return { status: execution.data.responseStatusCode, response, errors: execution.data.errors }
}

async function count(collection, attribute, value) {
  const queries = [{ method: 'equal', attribute, values: [value] }, { method: 'limit', values: [100] }]
  const search = queries.map((query, index) => `queries[${index}]=${encodeURIComponent(JSON.stringify(query))}`).join('&')
  const { data } = await request(`/databases/${databaseId}/collections/${collection}/documents?${search}`, { headers: server })
  return data.total ?? (data.documents || []).length
}

async function publishedCourses(program, level) {
  const queries = [{ method: 'equal', attribute: 'program', values: [program] }, { method: 'equal', attribute: 'level', values: [level] }, { method: 'limit', values: [100] }]
  const search = queries.map((query, index) => `queries[${index}]=${encodeURIComponent(JSON.stringify(query))}`).join('&')
  const { data } = await request(`/databases/${databaseId}/collections/academic_courses/documents?${search}`, { headers: server })
  return (data.documents || []).filter((course) => course.university === UNIVERSITY).length
}

async function cleanup() {
  console.log('\n— Nettoyage')
  for (const userId of createdUsers) {
    const probe = await request(`/users/${userId}`, { headers: server, expectOk: false })
    if (probe.status === 404) continue
    await request(`/users/${userId}`, { method: 'DELETE', headers: server, expectOk: false })
    for (const [collection, id] of [['users', userId], ['academic_directory', `directory_${userId}`]]) {
      await request(`/databases/${databaseId}/collections/${collection}/documents/${id}`, { method: 'DELETE', headers: server, expectOk: false })
    }
    const queries = [{ method: 'equal', attribute: 'studentId', values: [userId] }, { method: 'limit', values: [100] }]
    const search = queries.map((query, index) => `queries[${index}]=${encodeURIComponent(JSON.stringify(query))}`).join('&')
    const { data } = await request(`/databases/${databaseId}/collections/academic_enrollments/documents?${search}`, { headers: server })
    for (const row of data.documents || []) {
      await request(`/databases/${databaseId}/collections/academic_enrollments/documents/${row.$id}`, { method: 'DELETE', headers: server, expectOk: false })
    }
    console.log(`  ${userId} : supprimé par la clé serveur (le service delete-self n'avait pas tout retiré)`)
  }
}

async function main() {
  console.log(`Inscription de bout en bout — ${endpoint} / ${projectId} (run ${runId})`)

  console.log('\n1. Filière avec cours publiés : ICT4D L3 (données provisoires)')
  const expectedCourses = await publishedCourses('ICT4D', 'L3')
  check(expectedCourses > 0, `ICT4D L3 a des cours en base (${expectedCourses})`)
  const ready = await registerLikeAClient('l3', { program: 'ICT4D', level: 'L3' })
  const first = await callService('/academic-registration', { action: 'provision', matricule: `24ICT${runId.slice(-4).toUpperCase()}` }, ready.headers)
  check(first.status === 200 && first.response.ok === true, 'le raccordement répond ok', JSON.stringify(first.response))
  check(first.response.coursesReady === true, 'coursesReady = true')
  check(first.response.directoryCreated === true, 'entrée d’annuaire créée')
  check(first.response.enrollmentsCreated === expectedCourses, `inscrit à ${expectedCourses} cours`, `reçu ${first.response.enrollmentsCreated}`)
  check(await count('academic_enrollments', 'studentId', ready.userId) === expectedCourses, 'les inscriptions sont en base')
  const again = await callService('/academic-registration', { action: 'provision' }, ready.headers)
  check(again.response.ok === true && again.response.enrollmentsCreated === 0 && again.response.directoryCreated === false, 'second appel idempotent (rien en double)', JSON.stringify(again.response))
  check(await count('academic_enrollments', 'studentId', ready.userId) === expectedCourses, 'toujours autant d’inscriptions après le second appel')

  console.log('\n2. Filière sans cours publiés : ICT4D M1 (niveau sans cours)')
  check(await publishedCourses('ICT4D', 'M1') === 0, 'ICT4D M1 n’a aucun cours en base')
  const pending = await registerLikeAClient('m1', { program: 'ICT4D', level: 'M1' })
  const second = await callService('/academic-registration', { action: 'provision' }, pending.headers)
  check(second.status === 200 && second.response.ok === true, 'le raccordement répond ok malgré l’absence de cours (avant : 409)', JSON.stringify(second.response))
  check(second.response.coursesReady === false, 'coursesReady = false, à rejouer plus tard')
  check(second.response.directoryCreated === true, 'entrée d’annuaire créée quand même')
  check(second.response.enrollmentsCreated === 0 && second.response.totalCourses === 0, 'aucune inscription')
  check(await count('academic_directory', 'userId', pending.userId) === 1, 'l’étudiant figure dans l’annuaire')

  console.log('\n3. Droit à l’effacement : chaque compte de test se supprime lui-même')
  for (const user of [ready, pending]) {
    const deletion = await callService('/account', { action: 'delete-self' }, user.headers)
    check(deletion.status === 200 && deletion.response.ok === true, `${user.userId} : delete-self ok`, JSON.stringify(deletion.response))
    const probe = await request(`/users/${user.userId}`, { headers: server, expectOk: false })
    check(probe.status === 404, `${user.userId} : compte Appwrite supprimé`)
    check(await count('academic_enrollments', 'studentId', user.userId) === 0, `${user.userId} : plus aucune inscription`)
    check(await count('academic_directory', 'userId', user.userId) === 0, `${user.userId} : plus dans l’annuaire`)
  }
}

try {
  await main()
} catch (error) {
  failures += 1
  console.error(`\n✖ ${error.message}`)
} finally {
  try { await cleanup() } catch (error) { console.error(`Nettoyage incomplet : ${error.message}`) }
}
console.log(failures === 0 ? '\nInscription de bout en bout : tout est bon.' : `\n${failures} vérification(s) en échec.`)
process.exit(failures === 0 ? 0 : 1)
