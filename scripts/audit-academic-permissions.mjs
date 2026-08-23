const endpoint = (process.env.APPWRITE_SELF_HOSTED_ENDPOINT || 'https://appwrite.kernelforge.codes/v1').replace(/\/+$/, '')
const projectId = process.env.APPWRITE_SELF_HOSTED_PROJECT_ID || '6a885ccc000ddfbb3bb9'
const apiKey = process.env.APPWRITE_SELF_HOSTED_API_KEY

if (!apiKey) throw new Error('APPWRITE_SELF_HOSTED_API_KEY est requise.')

async function list(collectionId) {
  const response = await fetch(`${endpoint}/databases/uniflow/collections/${collectionId}/documents`, {
    headers: { 'X-Appwrite-Project': projectId, 'X-Appwrite-Key': apiKey },
  })
  const body = await response.json()
  if (!response.ok) throw new Error(`${collectionId}: ${body.message || response.status}`)
  return body.documents || []
}

const [courses, plans, statuses] = await Promise.all([
  list('academic_courses'), list('subscription_plans'), list('subscription_statuses'),
])

console.log(JSON.stringify({
  courses: courses.slice(0, 2).map(({ $id, code, teacherId, $permissions }) => ({ id: $id, code, teacherId, permissions: $permissions })),
  plans: plans.map(({ $id, code, $permissions }) => ({ id: $id, code, permissions: $permissions })),
  statuses: statuses.slice(0, 2).map(({ $id, userId, $permissions }) => ({ id: $id, userId, permissions: $permissions })),
}, null, 2))
