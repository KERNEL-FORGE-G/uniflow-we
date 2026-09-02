import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)
const endpoint = (process.env.APPWRITE_SELF_HOSTED_ENDPOINT || 'https://appwrite.kernelforge.codes/v1').replace(/\/+$/, '')
const projectId = process.env.APPWRITE_SELF_HOSTED_PROJECT_ID || '6a959096002a64d9d4e6'
const apiKey = process.env.APPWRITE_SELF_HOSTED_API_KEY
const password = process.env.UNIFLOW_TEST_PASSWORD

if (!apiKey || !password) throw new Error('Les droits Appwrite et le mot de passe de test sont requis.')

async function request(method, path, body) {
  const args = ['-sS', '--connect-timeout', '8', '--max-time', '20', '-X', method, '-H', `X-Appwrite-Project: ${projectId}`, '-H', `X-Appwrite-Key: ${apiKey}`]
  if (body !== undefined) args.push('-H', 'Content-Type: application/json', '-d', JSON.stringify(body))
  args.push('-w', '\n%{http_code}', `${endpoint}${path}`)
  const { stdout } = await execFileAsync('curl', args, { maxBuffer: 2 * 1024 * 1024 })
  const divider = stdout.lastIndexOf('\n')
  const text = divider >= 0 ? stdout.slice(0, divider) : stdout
  const status = Number(divider >= 0 ? stdout.slice(divider + 1).trim() : 0)
  const payload = text ? JSON.parse(text) : {}
  if (status < 200 || status >= 300) throw new Error(`${method} ${path} a échoué (${status}) : ${payload.message || text}`)
  return payload
}

const users = await request('GET', '/users?limit=100')
const allowedTestEmails = new Set([
  'qa.vps.20260821.1944@uniflow.test',
  'qa.certified.20260822@uniflow.test',
  'qa.registration.phase4@uniflow.test',
  'etudiant.ict4d.l1@uniflow.test',
  'delegue.ict4d.l1@uniflow.test',
  'enseignant.algorithmique@uniflow.test',
  'admin.uy1.ict4d@uniflow.test',
  'qa.etudiant.l1.20260823@uniflow.test',
  'qr-delegate-mt5t0z8o@test.uniflow.local',
  'qr-delegate-mt5t3b95@test.uniflow.local',
])
const targets = (users.users || []).filter((user) => allowedTestEmails.has(user.email))
if (!targets.length) throw new Error('Aucun compte de test UniFlow ne correspond à la liste blanche.')

for (const user of targets) await request('PATCH', `/users/${user.$id}/password`, { password })

console.log(JSON.stringify({ resetCount: targets.length, targetType: 'explicit UniFlow test allowlist only' }))
