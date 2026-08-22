const endpoint = (process.env.APPWRITE_SELF_HOSTED_ENDPOINT || 'https://appwrite.kernelforge.codes/v1').replace(/\/+$/, '')
const projectId = process.env.APPWRITE_SELF_HOSTED_PROJECT_ID || '6a885ccc000ddfbb3bb9'
const apiKey = process.env.APPWRITE_SELF_HOSTED_API_KEY
if (!apiKey) throw new Error('APPWRITE_SELF_HOSTED_API_KEY est requise pour vérifier le seed.')

const headers = { 'X-Appwrite-Project': projectId, 'X-Appwrite-Key': apiKey }
async function count(collectionId) {
  const response = await fetch(`${endpoint}/databases/uniflow/collections/${collectionId}/documents`, { headers })
  const payload = await response.json()
  if (!response.ok) throw new Error(`${collectionId}: ${payload.message || response.status}`)
  return payload.total
}

const [courses, schedules, enrollments, library, users] = await Promise.all([
  count('academic_courses'), count('academic_schedules'), count('academic_enrollments'), count('academic_library'), count('users'),
])

console.log(JSON.stringify({ endpoint, courses, schedules, enrollments, library, users }, null, 2))
