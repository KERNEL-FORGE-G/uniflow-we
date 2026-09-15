import { readFile } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { apiKey, createClient, projectId, resolveFunctionRuntime } from './appwrite-env.mjs'

const functionId = 'team-roster'
const sourceDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'functions', functionId)
const archivePath = process.env.UNIFLOW_FUNCTION_ARCHIVE || '/tmp/uniflow-team-roster.tar.gz'

/**
 * Construit l'archive depuis les sources avant de déployer.
 *
 * Trois des scripts de ce dossier publient encore l'archive trouvée dans
 * `/tmp` sans jamais la reconstruire : ils annoncent « Déploiement prêt » avec
 * un nouvel identifiant de déploiement tout en exécutant l'ancien code. Une
 * correction de la messagerie a ainsi été annoncée déployée deux fois sans
 * l'être. Ici, l'archive est reconstruite à chaque exécution ;
 * `UNIFLOW_FUNCTION_ARCHIVE` ne sert qu'à publier une archive préparée
 * ailleurs — auquel cas c'est un choix explicite.
 */
function buildArchive() {
  if (process.env.UNIFLOW_FUNCTION_ARCHIVE) {
    console.log(`Archive fournie par UNIFLOW_FUNCTION_ARCHIVE : ${archivePath}`)
    return
  }
  execFileSync('tar', ['czf', archivePath, 'package.json', 'src'], { cwd: sourceDir, stdio: 'inherit' })
}

// Runtime effectivement exposé par le serveur : le serveur d'UniFlow n'expose
// que `node-16.0`, et un identifiant codé en dur serait refusé.
const functionRuntime = await resolveFunctionRuntime()

console.log(`Déploiement de la Function « ${functionId} » sur le projet ${projectId} (${functionRuntime}).`)

const request = createClient()

async function ensureFunction() {
  const definition = {
    functionId,
    name: 'UniFlow — Équipe KERNEL FORGE',
    runtime: functionRuntime,
    // `execute: ["users"]` : toutes les actions exigent une session, et le rôle
    // ADMIN est vérifié dans la Function. La page publique, elle, lit la
    // collection directement — inutile d'ouvrir l'exécution aux visiteurs.
    execute: ['users'],
    events: [],
    schedule: '',
    timeout: 15,
    enabled: true,
    logging: true,
    entrypoint: 'src/main.js',
    commands: 'npm install',
  }
  const created = await request('POST', '/functions', definition)
  if (created.status === 409) await request('PUT', `/functions/${functionId}`, definition)
}

async function ensureVariable() {
  const definition = { key: 'APPWRITE_FUNCTION_API_KEY', value: apiKey, secret: true }
  const created = await request('POST', `/functions/${functionId}/variables`, definition)
  if (created.status === 409) {
    const variables = await request('GET', `/functions/${functionId}/variables`)
    const existing = (variables.payload.variables || []).find((variable) => variable.key === definition.key)
    if (!existing?.$id) throw new Error('La variable serveur de l’équipe est introuvable.')
    await request('PUT', `/functions/${functionId}/variables/${existing.$id}`, definition)
  }
}

async function deploy() {
  const archive = await readFile(archivePath)
  const form = new FormData()
  form.set('entrypoint', 'src/main.js')
  form.set('commands', 'npm install')
  form.set('activate', 'true')
  form.set('code', new Blob([archive], { type: 'application/gzip' }), 'uniflow-team-roster.tar.gz')
  const result = await request('POST', `/functions/${functionId}/deployments`, form)
  if (![201, 202].includes(result.status)) throw new Error('Le déploiement de la Function d’équipe n’a pas été créé.')
  const deploymentId = result.payload.$id
  for (let attempt = 0; attempt < 60; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    const current = await request('GET', `/functions/${functionId}/deployments/${deploymentId}`)
    if (current.payload.status === 'ready') return console.log(`Déploiement de l’équipe prêt : ${deploymentId}`)
    if (current.payload.status === 'failed') throw new Error(`Le déploiement ${deploymentId} a échoué : ${current.payload.buildLogs || 'logs indisponibles'}`)
  }
  throw new Error('Le déploiement de la Function d’équipe n’est pas devenu prêt dans le délai imparti.')
}

await ensureFunction()
await ensureVariable()
buildArchive()
await deploy()
