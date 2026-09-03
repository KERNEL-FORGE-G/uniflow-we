import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { readFile, readdir } from 'node:fs/promises'
import { join, resolve } from 'node:path'

// ==================== CONFIGURATION À RENSEIGNER ====================
// Copier .env.example vers .env puis renseigner la clé administrateur.
const endpoint = String(process.env.APPWRITE_SELF_HOSTED_ENDPOINT || 'https://appwrite.kernelforge.codes/v1').replace(/\/+$/, '')
const projectId = process.env.APPWRITE_SELF_HOSTED_PROJECT_ID || '6a959096002a64d9d4e6'
const apiKey = process.env.APPWRITE_SELF_HOSTED_API_KEY
const functionsRoot = resolve(process.env.UNIFLOW_FUNCTIONS_ROOT || new URL('../functions', import.meta.url).pathname)
const runtime = process.env.APPWRITE_FUNCTION_RUNTIME || 'node-22.0'
const commands = process.env.APPWRITE_FUNCTION_COMMANDS || 'npm install'
const exec = promisify(execFile)

if (!apiKey) throw new Error('APPWRITE_SELF_HOSTED_API_KEY est obligatoire. Ne la commitez jamais.')

const definitions = [
  ['academic-grades', 'academic_grades', 'UniFlow — Notes académiques'],
  ['academic-registration', 'academic_registration', 'UniFlow — Inscription académique'],
  ['admin-directory', 'admin_directory', 'UniFlow — Annuaire administrateur'],
  ['attendance-secure', 'attendance_secure', 'UniFlow — Présences sécurisées'],
  ['contact-messages', 'contact_messages', 'UniFlow — Messages de contact'],
  ['forum-reactions', 'forum_reactions', 'UniFlow — Réactions du forum'],
  ['messaging', 'messaging', 'UniFlow — Messagerie sécurisée'],
  ['notification-alerts', 'notification_alerts', 'UniFlow — Alertes de notification'],
  ['subscription-payments', 'subscription_payments', 'UniFlow — Paiements d’abonnement'],
]

const headers = { 'X-Appwrite-Project': projectId, 'X-Appwrite-Key': apiKey }

async function request(method, path, body) {
  const response = await fetch(`${endpoint}${path}`, {
    method,
    headers: { ...headers, ...(body === undefined || body instanceof FormData ? {} : { 'Content-Type': 'application/json' }) },
    body: body === undefined ? undefined : body instanceof FormData ? body : JSON.stringify(body),
  })
  const text = await response.text()
  let payload = {}
  try { payload = text ? JSON.parse(text) : {} } catch { payload = { message: text } }
  if (!response.ok && response.status !== 409) throw new Error(`${method} ${path} (${response.status}) : ${payload.message || text}`)
  return { status: response.status, payload }
}

async function archiveFunction(sourceDir, functionId) {
  const archivePath = join('/tmp', `uniflow-function-${functionId}.tar.gz`)
  await exec('tar', ['-czf', archivePath, '-C', sourceDir, '.'])
  return archivePath
}

async function ensureFunction(functionId, name) {
  const definition = {
    functionId,
    name,
    runtime,
    execute: ['users'],
    events: [],
    schedule: '',
    timeout: 60,
    enabled: true,
    logging: true,
    entrypoint: 'src/main.js',
    commands,
  }
  const result = await request('POST', '/functions', definition)
  if (result.status === 409) await request('PUT', `/functions/${functionId}`, definition)
}

async function ensureServerVariable(functionId) {
  const definition = { key: 'APPWRITE_FUNCTION_API_KEY', value: apiKey, secret: true }
  const result = await request('POST', `/functions/${functionId}/variables`, definition)
  if (result.status === 409) {
    const variables = await request('GET', `/functions/${functionId}/variables`)
    const existing = (variables.payload.variables || []).find((variable) => variable.key === definition.key)
    if (existing?.$id) await request('PUT', `/functions/${functionId}/variables/${existing.$id}`, definition)
  }
}

async function deploy(functionId, archivePath) {
  const archive = await readFile(archivePath)
  const form = new FormData()
  form.set('entrypoint', 'src/main.js')
  form.set('commands', commands)
  form.set('activate', 'true')
  form.set('code', new Blob([archive], { type: 'application/gzip' }), `${functionId}.tar.gz`)
  const result = await request('POST', `/functions/${functionId}/deployments`, form)
  if (![201, 202].includes(result.status)) throw new Error(`Déploiement ${functionId} non créé.`)
  const deploymentId = result.payload.$id
  for (let attempt = 0; attempt < 90; attempt += 1) {
    await new Promise((resolveDelay) => setTimeout(resolveDelay, 1000))
    const current = await request('GET', `/functions/${functionId}/deployments/${deploymentId}`)
    if (current.payload.status === 'ready') return deploymentId
    if (current.payload.status === 'failed') throw new Error(`Déploiement ${functionId} échoué : ${current.payload.buildLogs || 'logs indisponibles'}`)
  }
  throw new Error(`Déploiement ${functionId} non prêt après 90 secondes.`)
}

const existing = new Set(await readdir(functionsRoot))
for (const [folder, functionId, name] of definitions) {
  const sourceDir = join(functionsRoot, folder)
  if (!existing.has(folder)) throw new Error(`Sources absentes pour ${functionId}: ${sourceDir}`)
  process.stdout.write(`Provisioning ${functionId}...\n`)
  await ensureFunction(functionId, name)
  await ensureServerVariable(functionId)
  const archivePath = await archiveFunction(sourceDir, functionId)
  const deploymentId = await deploy(functionId, archivePath)
  process.stdout.write(`OK ${functionId} (${deploymentId})\n`)
}

process.stdout.write('Toutes les Functions Appwrite UniFlow sont provisionnées et déployées.\n')
