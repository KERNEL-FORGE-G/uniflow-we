import { execFile } from 'node:child_process'
import { rm } from 'node:fs/promises'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)
const endpoint = (process.env.APPWRITE_SELF_HOSTED_ENDPOINT || 'https://appwrite.kernelforge.codes/v1').replace(/\/+$/, '')
const projectId = process.env.APPWRITE_SELF_HOSTED_PROJECT_ID || '6a885ccc000ddfbb3bb9'
const email = process.env.UNIFLOW_TEST_EMAIL || 'qr-delegate-mt5t3b95@test.uniflow.local'
const password = process.env.UNIFLOW_TEST_PASSWORD
const action = process.env.UNIFLOW_TEST_ACTION || 'issue'
const token = process.env.UNIFLOW_TEST_TOKEN || ''
const latitude = Number(process.env.UNIFLOW_TEST_LATITUDE || '3.8667')
const longitude = Number(process.env.UNIFLOW_TEST_LONGITUDE || '11.5167')
const accuracy = Number(process.env.UNIFLOW_TEST_ACCURACY || '15')
const cookieJar = '/tmp/uniflow_function_test_cookies.txt'

if (!password) throw new Error('Le mot de passe temporaire du compte de validation est requis.')

await rm(cookieJar, { force: true })

async function request(method, path, body, extraHeaders = []) {
  const args = ['-sS', '--connect-timeout', '8', '--max-time', '25', '-X', method, '-c', cookieJar, '-b', cookieJar, '-H', `X-Appwrite-Project: ${projectId}`, ...extraHeaders]
  if (body !== undefined) args.push('-H', 'Content-Type: application/json', '-d', JSON.stringify(body))
  args.push('-w', '__UNIFLOW_HTTP_STATUS__%{http_code}', `${endpoint}${path}`)
  const { stdout } = await execFileAsync('curl', args, { maxBuffer: 2 * 1024 * 1024 })
  const marker = '__UNIFLOW_HTTP_STATUS__'
  const markerMatches = [...stdout.matchAll(new RegExp(`${marker}(\\d{3})`, 'g'))]
  const status = markerMatches.length ? Number(markerMatches.at(-1)?.[1]) : 0
  const text = stdout.replace(new RegExp(`${marker}\\d{3}`, 'g'), '').trim()
  const payload = text ? JSON.parse(text) : {}
  const effectiveStatus = status === 0 && payload.responseStatusCode ? Number(payload.responseStatusCode) : status
  if (effectiveStatus < 200 || effectiveStatus >= 300) throw new Error(`${method} ${path} a échoué (${effectiveStatus}) : ${payload.message || text}`)
  return payload
}

await request('POST', '/account/sessions/email', { email, password })
const jwt = await request('POST', '/account/jwt')
const payload = action === 'audit'
  ? { action }
  : action === 'issue'
    ? { action, sessionId: 'qrsessmt5t3b95', courseId: 'course_ict4d_l1_01', origin: { latitude: 3.8667, longitude: 11.5167, accuracy: 15 }, radiusMeters: 80 }
    : action === 'scan'
      ? { action, token, position: { latitude, longitude, accuracy } }
      : { action, token }
const execution = await request('POST', '/functions/attendance_secure/executions', {
  body: JSON.stringify(payload),
  async: false,
}, [`X-Appwrite-JWT: ${jwt.jwt}`])

const response = JSON.parse(execution.responseBody || '{}')
console.log(JSON.stringify({ functionStatus: execution.status, responseStatusCode: execution.responseStatusCode, action, ok: response.ok === true, code: response.code, message: response.message, idempotent: response.idempotent, distanceMeters: response.distanceMeters, issueCount: Object.values(response.duplicates || {}).reduce((sum, value) => sum + value, 0) + Object.values(response.orphaned || {}).reduce((sum, value) => sum + value, 0) + (response.invalidRecords || 0), expiresAtPresent: Boolean(response.expiresAt), tokenReturned: Boolean(response.token), ...(action === 'audit' ? { report: response } : {}), ...(action === 'issue' ? { token: response.token, expiresAt: response.expiresAt } : {}) }))
