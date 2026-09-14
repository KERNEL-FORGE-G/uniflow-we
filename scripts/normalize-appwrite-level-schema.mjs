const endpoint = (process.env.APPWRITE_SELF_HOSTED_ENDPOINT || 'https://appwrite.kernelforge.codes/v1').replace(/\/+$/, '')
const projectId = process.env.APPWRITE_SELF_HOSTED_PROJECT_ID || '6a959096002a64d9d4e6'
const apiKey = process.env.APPWRITE_SELF_HOSTED_API_KEY
if (!apiKey) throw new Error('APPWRITE_SELF_HOSTED_API_KEY est requise pour normaliser le schéma.')

const response = await fetch(`${endpoint}/databases/uniflow/collections/users/attributes/enum/level`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json', 'X-Appwrite-Project': projectId, 'X-Appwrite-Key': apiKey },
  body: JSON.stringify({ elements: ['L1'], required: false, default: null }),
})
const text = await response.text()
const payload = text ? JSON.parse(text) : {}
if (!response.ok) throw new Error(`Normalisation users.level refusée (${response.status}) : ${payload.message || text}`)
console.log(JSON.stringify({ status: response.status, key: payload.key, elements: payload.elements, attributeStatus: payload.status }, null, 2))
