const endpoint = (process.env.APPWRITE_SELF_HOSTED_ENDPOINT || 'https://appwrite.kernelforge.codes/v1').replace(/\/+$/, '')
const projectId = process.env.APPWRITE_SELF_HOSTED_PROJECT_ID || '6a959096002a64d9d4e6'
const apiKey = process.env.APPWRITE_SELF_HOSTED_API_KEY

if (!apiKey) throw new Error('APPWRITE_SELF_HOSTED_API_KEY est requise pour auditer les profils.')

const headers = { 'X-Appwrite-Project': projectId, 'X-Appwrite-Key': apiKey }
async function request(path) {
  const response = await fetch(`${endpoint}${path}`, { headers })
  const text = await response.text()
  const payload = text ? JSON.parse(text) : {}
  if (!response.ok) throw new Error(`GET ${path} a échoué (${response.status}) : ${payload.message || text}`)
  return payload
}

const [profiles, accounts] = await Promise.all([
  request('/databases/uniflow/collections/users/documents'),
  request('/users'),
])

const normalizedProfiles = (profiles.documents || []).map((document) => ({
  id: document.$id,
  accountType: document.accountType || '',
  role: document.role || '',
  university: document.university || '',
  program: document.program || '',
  level: document.level || '',
}))

const universityProfiles = normalizedProfiles.filter((profile) => profile.accountType === 'UNIVERSITY')
const profileIds = new Set(normalizedProfiles.map((profile) => profile.id))
const orphanAccountCount = (accounts.users || []).filter((account) => !profileIds.has(account.$id)).length

console.log(JSON.stringify({
  endpoint,
  profileCount: normalizedProfiles.length,
  accountCount: accounts.total ?? (accounts.users || []).length,
  universityProfileCount: universityProfiles.length,
  personalProfileCount: normalizedProfiles.filter((profile) => profile.accountType === 'PERSONAL').length,
  orphanAccountCount,
  universityProfiles,
}, null, 2))
