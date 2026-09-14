const endpoint = String(process.env.APPWRITE_SELF_HOSTED_ENDPOINT || 'https://appwrite.kernelforge.codes/v1').replace(/\/+$/, '')
const projectId = process.env.APPWRITE_SELF_HOSTED_PROJECT_ID || '6a959096002a64d9d4e6'
const apiKey = process.env.APPWRITE_SELF_HOSTED_API_KEY
const databaseId = 'uniflow'

if (!apiKey) throw new Error('APPWRITE_SELF_HOSTED_API_KEY est requise pour tester les Functions Forum et Contact.')

const runId = `${Date.now()}${Math.floor(Math.random() * 10000)}`
const userId = `qafc_${runId}`.slice(0, 36)
const email = `qafc-${runId}@example.invalid`
const password = `UniFlowQa-${runId}!`
let postId = ''
let reactionId = ''
let contactId = ''
let likerId = ''

async function responseOf(response) {
  const text = await response.text()
  let payload = {}
  try { payload = text ? JSON.parse(text) : {} } catch { payload = { raw: text } }
  if (!response.ok) throw new Error(`${response.status}:${payload.message || text || 'Appwrite error'}`)
  return { payload, cookie: response.headers.get('set-cookie') || '' }
}

async function fetchWithRetry(url, options) {
  let lastError
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await fetch(url, options)
    } catch (error) {
      lastError = error
      if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)))
    }
  }
  throw lastError
}

async function admin(method, path, body) {
  const response = await fetchWithRetry(`${endpoint}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', 'X-Appwrite-Project': projectId, 'X-Appwrite-Key': apiKey },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  return responseOf(response)
}

async function userSession() {
  const response = await fetchWithRetry(`${endpoint}/account/sessions/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Appwrite-Project': projectId },
    body: JSON.stringify({ email, password }),
  })
  const result = await responseOf(response)
  if (!result.cookie) throw new Error('SESSION_COOKIE_MISSING')
  return result.cookie.split(';')[0]
}

async function execute(functionId, body, cookie = '') {
  const response = await fetchWithRetry(`${endpoint}/functions/${functionId}/executions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Appwrite-Project': projectId,
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: JSON.stringify({ body: JSON.stringify(body), async: false, method: 'POST' }),
  })
  const { payload } = await responseOf(response)
  const bodyPayload = payload.responseBody ? JSON.parse(payload.responseBody) : {}
  if (payload.responseStatusCode >= 400 || !bodyPayload.ok) throw new Error(`FUNCTION_${functionId}:${bodyPayload.code || payload.responseStatusCode}`)
  return bodyPayload
}

async function cleanup() {
  const operations = []
  if (reactionId) operations.push(admin('DELETE', `/databases/${databaseId}/collections/forum_reactions/documents/${reactionId}`))
  if (postId) operations.push(admin('DELETE', `/databases/${databaseId}/collections/forum_posts/documents/${postId}`))
  if (contactId) operations.push(admin('DELETE', `/databases/${databaseId}/collections/contact_messages/documents/${contactId}`))
  if (likerId) operations.push(admin('DELETE', `/users/${likerId}`))
  operations.push(admin('DELETE', `/users/${userId}`))
  await Promise.allSettled(operations)
}

try {
  await admin('POST', '/users', { userId, email, password, name: 'QA Forum Contact' })
  const sessionCookie = await userSession()
  const post = await admin('POST', `/databases/${databaseId}/collections/forum_posts/documents`, {
    documentId: `post_${runId}`.slice(0, 36),
    data: {
      authorId: userId,
      authorName: 'QA Forum Contact',
      role: 'STUDENT',
      university: 'Université de Yaoundé I',
      title: 'Contrôle E2E Forum',
      content: 'Publication temporaire de contrôle, supprimée automatiquement.',
      category: 'Support',
      rating: 5,
      likes: 0,
      createdAt: new Date().toISOString(),
    },
    permissions: ['read("any")', `update("user:${userId}")`, `delete("user:${userId}")`],
  })
  postId = post.payload.$id

  let selfReactionDenied = false
  try {
    await execute('forum_reactions', { action: 'react', postId }, sessionCookie)
  } catch (error) {
    selfReactionDenied = String(error?.message || error).includes('SELF_REACTION_DENIED')
  }
  if (!selfReactionDenied) throw new Error('FORUM_SELF_REACTION_NOT_DENIED')

  likerId = `qafc_liker_${runId}`.slice(0, 36)
  const likerEmail = `qafc-liker-${runId}@example.invalid`
  await admin('POST', '/users', { userId: likerId, email: likerEmail, password, name: 'QA Forum Liker' })
  const likerSessionResponse = await fetchWithRetry(`${endpoint}/account/sessions/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Appwrite-Project': projectId },
    body: JSON.stringify({ email: likerEmail, password }),
  })
  const likerSession = await responseOf(likerSessionResponse)
  const likerCookie = likerSession.cookie.split(';')[0]
  if (!likerCookie) throw new Error('LIKER_SESSION_COOKIE_MISSING')

  const firstReaction = await execute('forum_reactions', { action: 'react', postId }, likerCookie)
  if (!firstReaction.liked || firstReaction.likes !== 1) throw new Error('FORUM_FIRST_REACTION_INVALID')
  const reactions = await execute('forum_reactions', { action: 'list' }, likerCookie)
  if (!reactions.reactedPostIds?.includes(postId)) throw new Error('FORUM_REACTION_LIST_INVALID')
  const secondReaction = await execute('forum_reactions', { action: 'react', postId }, likerCookie)
  if (secondReaction.liked || secondReaction.likes !== 0) throw new Error('FORUM_SECOND_REACTION_INVALID')

  const contact = await execute('contact_messages', {
    action: 'create',
    fullName: 'QA Forum Contact',
    email,
    subject: 'Contrôle E2E',
    message: 'Demande temporaire de contrôle, supprimée automatiquement.',
    consent: true,
  })
  contactId = contact.reference || ''
  if (!contactId) throw new Error('CONTACT_REFERENCE_MISSING')
  const contactDocument = await admin('GET', `/databases/${databaseId}/collections/contact_messages/documents/${contactId}`)
  if (contactDocument.payload.status !== 'NEW') throw new Error('CONTACT_PERSISTENCE_INVALID')

  console.log(JSON.stringify({ passed: true, forum: { toggled: true, listed: true }, contact: { persisted: true } }))
} finally {
  await cleanup()
}
