import { randomUUID } from 'node:crypto'

const endpoint = (process.env.APPWRITE_SELF_HOSTED_ENDPOINT || 'https://appwrite.kernelforge.codes/v1').replace(/\/+$/, '')
const projectId = process.env.APPWRITE_SELF_HOSTED_PROJECT_ID || '6a959096002a64d9d4e6'
const databaseId = 'uniflow'
const apiKey = process.env.APPWRITE_SELF_HOSTED_API_KEY
const runId = `load${Date.now().toString(36)}${randomUUID().slice(0, 5)}`.toLowerCase()
const password = `Load!${randomUUID().replaceAll('-', '')}`
const users = []
const documents = []
let baselineCounts = {}

if (!apiKey) throw new Error('APPWRITE_SELF_HOSTED_API_KEY est requis pour le test de charge.')

const query = (method, attribute, values) => JSON.stringify({ method, attribute, values: Array.isArray(values) ? values : [values] })
const queryString = (queries = []) => queries.map((item, index) => `queries%5B${index}%5D=${encodeURIComponent(item)}`).join('&')

async function fetchWithRetry(url, options) {
  let lastError
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await fetch(url, options)
    } catch (error) {
      lastError = error
      if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)))
    }
  }
  throw lastError
}

async function request(path, { method = 'GET', body, jwt, server = false, queries = [] } = {}) {
  const url = `${endpoint}${path}${queries.length ? `?${queryString(queries)}` : ''}`
  const response = await fetchWithRetry(url, {
    method,
    headers: {
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      'X-Appwrite-Project': projectId,
      ...(server ? { 'X-Appwrite-Key': apiKey } : {}),
      ...(jwt ? { 'X-Appwrite-JWT': jwt } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  })
  const text = await response.text()
  let data = {}
  try { data = text ? JSON.parse(text) : {} } catch { data = { message: text } }
  if (!response.ok) throw new Error(`${method} ${path} (${response.status}): ${data.message || 'réponse Appwrite invalide'}`)
  return data
}

async function countCollection(collection) {
  const data = await request(`/databases/${databaseId}/collections/${collection}/documents`, { server: true, queries: [query('limit', undefined, 1)] })
  return data.total
}

async function createUser(index) {
  const userId = `load_${runId}_${index}`.slice(0, 36)
  const email = `load.${runId}.${index}@e2e.invalid`
  const name = `Charge Forum ${index}`
  await request('/users', { method: 'POST', server: true, body: { userId, email, password, name } })
  users.push({ userId, email })
  await request(`/databases/${databaseId}/collections/users/documents`, {
    method: 'POST', server: true,
    body: {
      documentId: userId,
      data: { email, name, accountType: 'PERSONAL', role: 'STUDENT', university: '', program: 'ICT4D', level: 'L1', country: 'Cameroun' },
      permissions: [`read("user:${userId}")`, `update("user:${userId}")`, `delete("user:${userId}")`],
    },
  })
  documents.push({ collection: 'users', id: userId })
  return { userId, email }
}

async function createAccountsInBatches(count, batchSize = 5) {
  const accounts = []
  for (let start = 0; start < count; start += batchSize) {
    const batch = await Promise.all(Array.from({ length: Math.min(batchSize, count - start) }, (_, offset) => createUser(start + offset)))
    accounts.push(...batch)
  }
  return accounts
}

async function createSessionsInBatches(count, batchSize = 5) {
  const sessions = []
  for (let start = 0; start < count; start += batchSize) {
    const batch = await Promise.all(Array.from({ length: Math.min(batchSize, count - start) }, (_, offset) => createSession(start + offset)))
    sessions.push(...batch)
  }
  return sessions
}

async function createSession(index) {
  const user = users[index]
  const sessionResponse = await fetchWithRetry(`${endpoint}/account/sessions/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Appwrite-Project': projectId },
    body: JSON.stringify({ email: user.email, password }),
  })
  const setCookie = typeof sessionResponse.headers.getSetCookie === 'function'
    ? sessionResponse.headers.getSetCookie()
    : [sessionResponse.headers.get('set-cookie')].filter(Boolean)
  if (!sessionResponse.ok) throw new Error(`POST /account/sessions/email (${sessionResponse.status})`)
  const cookieHeader = setCookie.map((value) => value.split(';', 1)[0]).join('; ')
  const jwtResponse = await fetchWithRetry(`${endpoint}/account/jwt`, { method: 'POST', headers: { 'X-Appwrite-Project': projectId, Cookie: cookieHeader } })
  const jwt = await jwtResponse.json()
  if (!jwtResponse.ok) throw new Error(`POST /account/jwt (${jwtResponse.status})`)
  return { userId: user.userId, email: user.email, jwt: jwt.jwt }
}

async function executeFunction(functionId, payload, jwt) {
  const started = performance.now()
  const execution = await request(`/functions/${functionId}/executions`, { method: 'POST', jwt, body: { body: JSON.stringify(payload), async: true } })
  const deadline = Date.now() + 120_000
  let completed = execution
  while (!['completed', 'failed'].includes(completed.status)) {
    if (Date.now() > deadline) throw new Error(`${functionId} dépasse 120 secondes`)
    await new Promise((resolve) => setTimeout(resolve, 500))
    completed = await request(`/functions/${functionId}/executions/${execution.$id}`, { server: true })
  }
  let response = {}
  try { response = JSON.parse(completed.responseBody || '{}') } catch { response = {} }
  if (completed.responseStatusCode >= 400 || (Object.keys(response).length && response.ok !== true)) {
    throw new Error(`${functionId} refusée: ${response.message || completed.responseStatusCode}`)
  }
  return { durationMs: Number((performance.now() - started).toFixed(2)), functionSeconds: Number(completed.duration || 0), response }
}

function percentile(values, ratio) {
  const sorted = [...values].sort((a, b) => a - b)
  return Number(sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * ratio) - 1)].toFixed(2))
}

async function runForum(user, index) {
  const started = performance.now()
  const documentId = `load_forum_${runId}_${index}`.slice(0, 36)
  await request(`/databases/${databaseId}/collections/forum_posts/documents`, {
    method: 'POST', jwt: user.jwt,
    body: {
      documentId,
      data: {
        authorId: user.userId,
        authorName: `Charge Forum ${index}`,
        role: 'STUDENT',
        university: '',
        title: `Test charge Forum ${runId} #${index}`,
        content: `Publication éphémère de charge ${runId} #${index}`,
        category: 'QUESTION',
        rating: 4,
        likes: 0,
        createdAt: new Date().toISOString(),
      },
      permissions: [`read("any")`, `update("user:${user.userId}")`, `delete("user:${user.userId}")`],
    },
  })
  documents.push({ collection: 'forum_posts', id: documentId })
  await request(`/databases/${databaseId}/collections/forum_posts/documents`, { server: true, queries: [query('equal', 'authorId', user.userId)] })
  return Number((performance.now() - started).toFixed(2))
}

async function runSubscription(user, index) {
  const result = await executeFunction('subscription_payments', {
    action: 'create', planCode: 'personal_cm', billingCycle: 'MONTHLY',
    fullName: `Charge Abonnement ${index}`, email: user.email, phoneNumber: `+23765000${String(index).padStart(4, '0')}`,
  }, user.jwt)
  const requests = await request(`/databases/${databaseId}/collections/subscription_payment_requests/documents`, { server: true, queries: [query('equal', 'userId', user.userId)] })
  for (const document of requests.documents || []) documents.push({ collection: 'subscription_payment_requests', id: document.$id })
  const statuses = await request(`/databases/${databaseId}/collections/subscription_statuses/documents`, { server: true, queries: [query('equal', 'userId', user.userId)] })
  for (const document of statuses.documents || []) documents.push({ collection: 'subscription_statuses', id: document.$id })
  return result.durationMs
}

async function cleanup() {
  const errors = []
  for (const document of [...documents].reverse()) {
    try { await request(`/databases/${databaseId}/collections/${document.collection}/documents/${document.id}`, { method: 'DELETE', server: true }) } catch (error) { errors.push(String(error)) }
  }
  for (const user of [...users].reverse()) {
    try { await request(`/users/${user.userId}`, { method: 'DELETE', server: true }) } catch (error) { errors.push(String(error)) }
  }
  return errors
}

const startedAt = new Date().toISOString()
const concurrency = 50
let report
try {
  baselineCounts = Object.fromEntries(await Promise.all(['users', 'forum_posts', 'subscription_payment_requests', 'subscription_statuses'].map(async (collection) => [collection, await countCollection(collection)])))
  const accounts = await createAccountsInBatches(concurrency)
  const sessions = await createSessionsInBatches(concurrency)
  const [forumResults, subscriptionResults] = await Promise.all([
    Promise.allSettled(sessions.map((user, index) => runForum(user, index))),
    Promise.allSettled(sessions.map((user, index) => runSubscription(user, index))),
  ])
  const summarize = (results) => {
    const successful = results.filter((entry) => entry.status === 'fulfilled').map((entry) => entry.value)
    const errors = results.filter((entry) => entry.status === 'rejected').map((entry) => String(entry.reason))
    return { requests: results.length, successful: successful.length, failed: errors.length, p50Ms: successful.length ? percentile(successful, 0.5) : null, p95Ms: successful.length ? percentile(successful, 0.95) : null, maxMs: successful.length ? Math.max(...successful) : null, errors }
  }
  report = { runId, startedAt, concurrency, forum: summarize(forumResults), subscriptions: summarize(subscriptionResults) }
} finally {
  const errors = await cleanup()
  let afterCounts = {}
  try {
    afterCounts = Object.fromEntries(await Promise.all(['users', 'forum_posts', 'subscription_payment_requests', 'subscription_statuses'].map(async (collection) => [collection, await countCollection(collection)])))
  } catch (error) {
    errors.push(`integrity query: ${String(error)}`)
  }
  const integrityMatchesBaseline = Object.keys(baselineCounts).length === 4 && Object.entries(baselineCounts).every(([collection, count]) => afterCounts[collection] === count)
  report = { ...(report || { runId, startedAt, concurrency }), cleanup: { ok: errors.length === 0, errors }, integrity: { baselineCounts, afterCounts, matchesBaseline: integrityMatchesBaseline }, finishedAt: new Date().toISOString(), passed: Boolean(report && report.forum.failed === 0 && report.subscriptions.failed === 0 && errors.length === 0 && integrityMatchesBaseline) }
}
console.log(JSON.stringify(report, null, 2))
if (!report.passed) process.exitCode = 1
