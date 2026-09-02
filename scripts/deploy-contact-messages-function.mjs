import { readFile } from 'node:fs/promises'

const endpoint = String(process.env.APPWRITE_SELF_HOSTED_ENDPOINT || 'https://appwrite.kernelforge.codes/v1').replace(/\/+$/, '')
const projectId = process.env.APPWRITE_SELF_HOSTED_PROJECT_ID || '6a959096002a64d9d4e6'
const apiKey = process.env.APPWRITE_SELF_HOSTED_API_KEY
const functionId = 'contact_messages'
const archivePath = process.env.UNIFLOW_FUNCTION_ARCHIVE || '/tmp/uniflow-contact-messages.tar.gz'

if (!apiKey) throw new Error('APPWRITE_SELF_HOSTED_API_KEY est requise pour déployer la Function des messages de contact.')

const headers = { 'X-Appwrite-Project': projectId, 'X-Appwrite-Key': apiKey }

async function request(method, path, body) {
  const response = await fetch(`${endpoint}${path}`, { method, headers: { ...headers, ...(body === undefined || body instanceof FormData ? {} : { 'Content-Type': 'application/json' }) }, body: body === undefined ? undefined : body instanceof FormData ? body : JSON.stringify(body) })
  const text = await response.text()
  const payload = text ? JSON.parse(text) : {}
  if (!response.ok && response.status !== 409) throw new Error(`${method} ${path} a échoué (${response.status}) : ${payload.message || text}`)
  return { status: response.status, payload }
}

async function ensureFunction() {
  const definition = { functionId, name: 'UniFlow — Demandes de contact', runtime: 'node-16.0', execute: ['any'], events: [], schedule: '', timeout: 30, enabled: true, logging: true, entrypoint: 'src/main.js', commands: 'npm install' }
  const created = await request('POST', '/functions', definition)
  if (created.status === 409) await request('PUT', `/functions/${functionId}`, definition)
}

async function ensureVariable() {
  const definition = { key: 'APPWRITE_FUNCTION_API_KEY', value: apiKey, secret: true }
  const created = await request('POST', `/functions/${functionId}/variables`, definition)
  if (created.status === 409) {
    const variables = await request('GET', `/functions/${functionId}/variables`)
    const existing = (variables.payload.variables || []).find((variable) => variable.key === definition.key)
    if (!existing?.$id) throw new Error('La variable serveur de la Function Contact est introuvable.')
    await request('PUT', `/functions/${functionId}/variables/${existing.$id}`, definition)
  }
}

async function deploy() {
  const archive = await readFile(archivePath)
  const form = new FormData()
  form.set('entrypoint', 'src/main.js')
  form.set('commands', 'npm install')
  form.set('activate', 'true')
  form.set('code', new Blob([archive], { type: 'application/gzip' }), 'uniflow-contact-messages.tar.gz')
  const created = await request('POST', `/functions/${functionId}/deployments`, form)
  const deploymentId = created.payload.$id
  for (let attempt = 0; attempt < 60; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    const current = await request('GET', `/functions/${functionId}/deployments/${deploymentId}`)
    if (current.payload.status === 'ready') return console.log(`Déploiement Contact prêt : ${deploymentId}`)
    if (current.payload.status === 'failed') throw new Error(`Le déploiement Contact a échoué : ${current.payload.buildLogs || 'logs indisponibles'}`)
  }
  throw new Error('Le déploiement Contact n’est pas devenu prêt dans le délai imparti.')
}

await ensureFunction()
await ensureVariable()
await deploy()
