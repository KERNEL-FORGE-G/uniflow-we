const endpoint = (process.env.APPWRITE_SELF_HOSTED_ENDPOINT || 'https://appwrite.kernelforge.codes/v1').replace(/\/+$/, '')
const projectId = process.env.APPWRITE_SELF_HOSTED_PROJECT_ID || '6a959096002a64d9d4e6'
const databaseId = 'uniflow'
const apiKey = process.env.APPWRITE_SELF_HOSTED_API_KEY
if (!apiKey) throw new Error('APPWRITE_SELF_HOSTED_API_KEY est requis.')

const headers = { 'X-Appwrite-Project': projectId, 'X-Appwrite-Key': apiKey }
async function request(path, options = {}) {
  const response = await fetch(`${endpoint}${path}`, { ...options, headers: { ...headers, ...(options.body ? { 'Content-Type': 'application/json' } : {}) } })
  const text = await response.text()
  let data = {}
  try { data = text ? JSON.parse(text) : {} } catch {}
  if (!response.ok) throw new Error(`${options.method || 'GET'} ${path} (${response.status}): ${data.message || text}`)
  return data
}
const list = (collection) => request(`/databases/${databaseId}/collections/${collection}/documents?queries%5B0%5D=${encodeURIComponent(JSON.stringify({ method: 'limit', values: [100] }))}`)
const remove = (collection, id) => request(`/databases/${databaseId}/collections/${collection}/documents/${id}`, { method: 'DELETE' })
const users = (await list('users')).documents.filter((document) => String(document.email || '').startsWith('load.'))
const userIds = new Set(users.map((user) => user.$id))
const forum = (await list('forum_posts')).documents.filter((document) => String(document.title || '').startsWith('Test charge Forum load') || userIds.has(document.authorId))
const payments = (await list('subscription_payment_requests')).documents.filter((document) => userIds.has(document.userId) || String(document.email || '').startsWith('load.'))
const statuses = (await list('subscription_statuses')).documents.filter((document) => userIds.has(document.userId))
const deleted = { users: users.length, forum: forum.length, payments: payments.length, statuses: statuses.length, errors: [] }
for (const document of [...forum, ...payments, ...statuses]) {
  try { await remove(document.$collection?.split('/').at(-2) || (forum.includes(document) ? 'forum_posts' : payments.includes(document) ? 'subscription_payment_requests' : 'subscription_statuses'), document.$id) } catch (error) { deleted.errors.push(String(error)) }
}
for (const user of users) {
  try { await remove('users', user.$id) } catch (error) { deleted.errors.push(String(error)) }
  try { await request(`/users/${user.$id}`, { method: 'DELETE' }) } catch (error) { deleted.errors.push(String(error)) }
}
console.log(JSON.stringify(deleted, null, 2))
