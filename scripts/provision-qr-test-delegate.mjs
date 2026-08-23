import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)
const endpoint = (process.env.APPWRITE_SELF_HOSTED_ENDPOINT || 'https://appwrite.kernelforge.codes/v1').replace(/\/+$/, '')
const projectId = process.env.APPWRITE_SELF_HOSTED_PROJECT_ID || '6a885ccc000ddfbb3bb9'
const apiKey = process.env.APPWRITE_SELF_HOSTED_API_KEY
const password = process.env.UNIFLOW_QR_TEST_PASSWORD
const databaseId = 'uniflow'

if (!apiKey || !password) throw new Error('Les droits Appwrite et le mot de passe temporaire de validation sont requis.')

const stamp = Date.now().toString(36)
const userId = `qrdelegate${stamp}`.slice(0, 36)
const email = `qr-delegate-${stamp}@test.uniflow.local`
const headers = { 'Content-Type': 'application/json', 'X-Appwrite-Project': projectId, 'X-Appwrite-Key': apiKey }

async function request(method, path, body) {
  const args = ['-sS', '--connect-timeout', '8', '--max-time', '20', '-X', method, '-H', `X-Appwrite-Project: ${projectId}`, '-H', `X-Appwrite-Key: ${apiKey}`]
  if (body !== undefined) args.push('-H', 'Content-Type: application/json', '-d', JSON.stringify(body))
  args.push('-w', '\n%{http_code}', `${endpoint}${path}`)
  const { stdout } = await execFileAsync('curl', args, { maxBuffer: 2 * 1024 * 1024 })
  const separator = stdout.lastIndexOf('\n')
  const text = separator >= 0 ? stdout.slice(0, separator) : stdout
  const status = Number(separator >= 0 ? stdout.slice(separator + 1).trim() : 0)
  const payload = text ? JSON.parse(text) : {}
  if (status < 200 || status >= 300) throw new Error(`${method} ${path} a échoué (${status}) : ${payload.message || text}`)
  return payload
}

async function requestAsDelegate(method, path, body, cookieJar) {
  const args = ['-sS', '--connect-timeout', '8', '--max-time', '20', '-X', method, '-H', `X-Appwrite-Project: ${projectId}`, '-c', cookieJar, '-b', cookieJar]
  if (body !== undefined) args.push('-H', 'Content-Type: application/json', '-d', JSON.stringify(body))
  args.push('-w', '\n%{http_code}', `${endpoint}${path}`)
  const { stdout } = await execFileAsync('curl', args, { maxBuffer: 2 * 1024 * 1024 })
  const separator = stdout.lastIndexOf('\n')
  const text = separator >= 0 ? stdout.slice(0, separator) : stdout
  const status = Number(separator >= 0 ? stdout.slice(separator + 1).trim() : 0)
  const payload = text ? JSON.parse(text) : {}
  if (status < 200 || status >= 300) throw new Error(`Délégué ${method} ${path} a échoué (${status}) : ${payload.message || text}`)
  return payload
}

const userPermissions = [`read("user:${userId}")`, `update("user:${userId}")`, `delete("user:${userId}")`]
const academicPermissions = ['read("users")', `update("user:${userId}")`, `delete("user:${userId}")`]

await request('POST', '/users', { userId, email, password, name: 'Délégué QR de validation' })
await request('POST', `/databases/${databaseId}/collections/users/documents`, {
  documentId: userId,
  data: { email, name: 'Délégué QR de validation', accountType: 'UNIVERSITY', role: 'DELEGATE', university: 'Université de Yaoundé I', program: 'ICT4D', level: 'L1', country: 'Cameroun' },
  permissions: userPermissions,
})
await request('POST', `/databases/${databaseId}/collections/academic_directory/documents`, {
  documentId: userId,
  data: { userId, name: 'Délégué QR de validation', role: 'DELEGATE', university: 'Université de Yaoundé I', program: 'ICT4D', level: 'L1', matricule: `QR-${stamp.toUpperCase()}`, status: 'ACTIVE' },
  permissions: academicPermissions,
})

const courses = await request('GET', `/databases/${databaseId}/collections/academic_courses/documents?limit=100`)
for (const [index, course] of (courses.documents || []).entries()) {
  await request('POST', `/databases/${databaseId}/collections/academic_enrollments/documents`, {
    documentId: `qrenr${stamp}${index}`.slice(0, 36),
    data: { studentId: userId, courseId: course.$id, status: 'ACTIVE' },
    permissions: academicPermissions,
  })
}

const courseId = courses.documents?.[0]?.$id
if (!courseId) throw new Error('Aucun cours Appwrite ne permet de valider le parcours QR.')
const cookieJar = `/tmp/uniflow-qr-${userId}.cookies`
await requestAsDelegate('POST', '/account/sessions/email', { email, password }, cookieJar)
const sessionId = `qrsess${stamp}`.slice(0, 36)
const token = `qrtoken${stamp}${Math.random().toString(36).slice(2, 8)}`.slice(0, 128)
const permissions = [`read("users")`, `update("user:${userId}")`, `delete("user:${userId}")`]
await requestAsDelegate('POST', `/databases/${databaseId}/collections/attendance_sessions/documents`, {
  documentId: sessionId,
  data: { courseId, date: new Date().toISOString(), createdBy: userId },
  permissions,
}, cookieJar)
await requestAsDelegate('POST', `/databases/${databaseId}/collections/attendance_qr_tokens/documents`, {
  documentId: `qr${stamp}`.slice(0, 36),
  data: { token, sessionId, courseId, createdBy: userId, expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), revoked: false },
  permissions,
}, cookieJar)
await requestAsDelegate('POST', `/databases/${databaseId}/collections/attendance_records/documents`, {
  documentId: `qrrecord${stamp}`.slice(0, 36),
  data: { sessionId, courseId, studentId: userId, status: 'PRESENT' },
  permissions,
}, cookieJar)

console.log(JSON.stringify({ email, role: 'DELEGATE', enrollmentCount: (courses.documents || []).length, delegateQrPermissionCheck: 'passed' }))
