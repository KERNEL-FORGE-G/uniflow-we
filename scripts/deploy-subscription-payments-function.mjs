import { readFile } from 'node:fs/promises'

const endpoint = String(process.env.APPWRITE_SELF_HOSTED_ENDPOINT || 'https://appwrite.kernelforge.codes/v1').replace(/\/+$/, '')
const projectId = process.env.APPWRITE_SELF_HOSTED_PROJECT_ID || '6a959096002a64d9d4e6'
const apiKey = process.env.APPWRITE_SELF_HOSTED_API_KEY
const functionId = 'subscription_payments'
const archivePath = process.env.UNIFLOW_FUNCTION_ARCHIVE || '/tmp/uniflow-subscription-payments.tar.gz'

if (!apiKey) throw new Error('APPWRITE_SELF_HOSTED_API_KEY est requise pour déployer la Function de paiement.')

const headers = { 'X-Appwrite-Project': projectId, 'X-Appwrite-Key': apiKey }

async function request(method, path, body) {
  const response = await fetch(`${endpoint}${path}`, {
    method,
    headers: { ...headers, ...(body === undefined || body instanceof FormData ? {} : { 'Content-Type': 'application/json' }) },
    body: body === undefined ? undefined : body instanceof FormData ? body : JSON.stringify(body),
  })
  const text = await response.text()
  const payload = text ? JSON.parse(text) : {}
  if (!response.ok && response.status !== 409) throw new Error(`${method} ${path} a échoué (${response.status}) : ${payload.message || text}`)
  return { status: response.status, payload }
}

async function ensureFunction() {
  const definition = {
    functionId,
    name: 'UniFlow — Paiements WhatsApp',
    runtime: 'node-16.0',
    execute: ['users'],
    events: [],
    schedule: '',
    timeout: 45,
    enabled: true,
    logging: true,
    entrypoint: 'src/main.js',
    commands: 'npm install',
  }
  const created = await request('POST', '/functions', definition)
  if (created.status === 409) await request('PUT', `/functions/${functionId}`, definition)
  console.log(created.status === 201 ? 'Function subscription_payments créée.' : 'Function subscription_payments mise à jour.')
}

async function ensureVariable() {
  const definition = { key: 'APPWRITE_FUNCTION_API_KEY', value: apiKey, secret: true }
  const created = await request('POST', `/functions/${functionId}/variables`, definition)
  if (created.status === 409) {
    const variables = await request('GET', `/functions/${functionId}/variables`)
    const existing = (variables.payload.variables || []).find((variable) => variable.key === definition.key)
    if (!existing?.$id) throw new Error('La variable serveur existante est introuvable.')
    await request('PUT', `/functions/${functionId}/variables/${existing.$id}`, definition)
  }
  console.log(created.status === 201 ? 'Variable serveur protégée ajoutée.' : 'Variable serveur protégée mise à jour.')
}

async function deploy() {
  const archive = await readFile(archivePath)
  const form = new FormData()
  form.set('entrypoint', 'src/main.js')
  form.set('commands', 'npm install')
  form.set('activate', 'true')
  form.set('code', new Blob([archive], { type: 'application/gzip' }), 'subscription-payments.tar.gz')
  const result = await request('POST', `/functions/${functionId}/deployments`, form)
  if (![201, 202].includes(result.status)) throw new Error('Le déploiement de la Function de paiement n’a pas été créé.')
  const deploymentId = result.payload.$id
  for (let attempt = 0; attempt < 60; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    const current = await request('GET', `/functions/${functionId}/deployments/${deploymentId}`)
    const status = current.payload.status
    if (status === 'ready') {
      console.log(`Déploiement payment prêt : ${deploymentId}`)
      return
    }
    if (status === 'failed') throw new Error(`Le déploiement ${deploymentId} a échoué : ${current.payload.buildLogs || 'logs indisponibles'}`)
  }
  throw new Error('Le déploiement de paiement n’est pas devenu prêt dans le délai imparti.')
}

await ensureFunction()
await ensureVariable()
await deploy()
