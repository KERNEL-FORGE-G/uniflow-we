import { readFile } from 'node:fs/promises'
import { apiKey, createClient, functionRuntime, projectId } from './appwrite-env.mjs'

const functionId = 'contact_messages'
const archivePath = process.env.UNIFLOW_FUNCTION_ARCHIVE || '/tmp/uniflow-contact-messages.tar.gz'

console.log(`Déploiement de la Function « ${functionId} » sur le projet ${projectId} (${functionRuntime}).`)

const request = createClient()

async function ensureFunction() {
  const definition = { functionId, name: 'UniFlow — Demandes de contact', runtime: functionRuntime, execute: ['any'], events: [], schedule: '', timeout: 30, enabled: true, logging: true, entrypoint: 'src/main.js', commands: 'npm install' }
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
