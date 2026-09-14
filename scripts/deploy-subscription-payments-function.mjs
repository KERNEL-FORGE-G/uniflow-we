import { readFile } from 'node:fs/promises'
import { apiKey, createClient, functionRuntime, projectId } from './appwrite-env.mjs'

const functionId = 'subscription_payments'
const archivePath = process.env.UNIFLOW_FUNCTION_ARCHIVE || '/tmp/uniflow-subscription-payments.tar.gz'

console.log(`Déploiement de la Function « ${functionId} » sur le projet ${projectId} (${functionRuntime}).`)

const request = createClient()

async function ensureFunction() {
  const definition = {
    functionId,
    name: 'UniFlow — Paiements WhatsApp',
    runtime: functionRuntime,
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
