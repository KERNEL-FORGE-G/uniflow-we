import { readFileSync } from 'node:fs'

/**
 * Configuration Appwrite partagée par les scripts de ce dossier.
 *
 * Historiquement chaque script embarquait son propre identifiant de projet par
 * défaut — `6a885ccc000ddfbb3bb9` — alors que toutes les applications UniFlow
 * (web, mobile, desktop, backend) pointent vers `6a959096002a64d9d4e6`. Lancé
 * sans variables d'environnement, un script provisionnait donc un projet que
 * personne ne lit, et l'échec était silencieux : le script se terminait
 * normalement en annonçant avoir créé les collections.
 *
 * On charge désormais `uniflow-backend/.env`, qui est la source de vérité, et on
 * refuse de démarrer plutôt que de deviner. Les variables d'environnement
 * gardent la priorité, pour ne pas casser les usages existants.
 */

function loadBackendEnv() {
  try {
    const text = readFileSync(new URL('../../uniflow-backend/.env', import.meta.url), 'utf8')
    const values = {}
    for (const line of text.split('\n')) {
      const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*)$/.exec(line)
      if (!match) continue
      values[match[1]] = match[2].trim().replace(/^["']|["']$/g, '')
    }
    return values
  } catch {
    return {}
  }
}

const backendEnv = loadBackendEnv()

export const endpoint = String(
  process.env.APPWRITE_SELF_HOSTED_ENDPOINT || backendEnv.APPWRITE_ENDPOINT || 'https://appwrite.kernelforge.codes/v1',
).replace(/\/+$/, '')

export const projectId = process.env.APPWRITE_SELF_HOSTED_PROJECT_ID || backendEnv.APPWRITE_PROJECT_ID || ''

export const apiKey = process.env.APPWRITE_SELF_HOSTED_API_KEY || backendEnv.APPWRITE_API_KEY || ''

export const databaseId = process.env.APPWRITE_DATABASE_ID || backendEnv.APPWRITE_DATABASE_ID || 'uniflow'

/**
 * Runtime des Functions déployées par les scripts `deploy-*`.
 *
 * Les quatre scripts déclaraient `node-16.0`, choisi à l'origine et jamais
 * revu : ce runtime est en fin de vie et n'est plus proposé par les serveurs
 * Appwrite récents, qui refusent alors la création de la Function. `node-18.0`
 * est disponible aussi bien sur la branche 1.4/1.5 que sur la 1.6, et
 * `node-appwrite` 12 comme `node-appwrite` 17 y fonctionnent.
 *
 * Ce choix reste une préférence, pas une certitude : le serveur auto-hébergé de
 * UniFlow n'expose QUE `node-16.0` — sa variable `_APP_FUNCTIONS_RUNTIMES` ne
 * liste que celui-là — et refuse donc `node-18.0` avec « Runtime not supported ».
 * Les scripts de déploiement appellent [resolveFunctionRuntime], qui interroge
 * le serveur et retombe sur ce qu'il accepte réellement.
 */
export const functionRuntime = process.env.UNIFLOW_FUNCTION_RUNTIME || 'node-18.0'

/**
 * Runtime Node réellement accepté par le serveur, du plus récent au plus ancien.
 *
 * Une version codée en dur finit toujours par être refusée : les serveurs
 * n'exposent pas tous les mêmes runtimes. On lit donc `/functions/runtimes`,
 * on garde les runtimes Node, et on prend le plus récent — sauf si
 * `UNIFLOW_FUNCTION_RUNTIME` impose une valeur, qui est alors renvoyée telle
 * quelle sans interroger le serveur.
 */
export async function resolveFunctionRuntime() {
  if (process.env.UNIFLOW_FUNCTION_RUNTIME) return process.env.UNIFLOW_FUNCTION_RUNTIME
  try {
    const request = createClient()
    const response = await request('GET', '/functions/runtimes')
    const available = (response.payload.runtimes || [])
      .map((runtime) => runtime.$id)
      .filter((id) => typeof id === 'string' && id.startsWith('node-'))
      .sort((a, b) => Number(b.split('-')[1]) - Number(a.split('-')[1]))
    if (available.length > 0) return available[0]
  } catch {
    // Serveur injoignable ou endpoint absent : on retombe sur la préférence.
  }
  return functionRuntime
}

/**
 * URL absolue d'un avatar stocké dans le bucket des photos de profil.
 *
 * Le second paramètre est l'**identifiant** du bucket, pas son nom : celui
 * d'UniFlow s'appelle « uniflow_avatars » mais a été créé depuis la console
 * sous `6aa81b840031e6a34dc3`, et Appwrite résout les URL par identifiant.
 * La valeur par défaut reprend donc cet identifiant, sinon chaque appel sans
 * argument explicite produisait un 404.
 */
export function avatarUrl(fileId, bucketId = '6aa81b840031e6a34dc3') {
  if (!fileId) return ''
  return `${endpoint}/storage/buckets/${bucketId}/files/${fileId}/view?project=${projectId}`
}

export function requireConfig() {
  if (!projectId) {
    throw new Error(
      'Identifiant de projet Appwrite introuvable. Renseigne APPWRITE_PROJECT_ID dans uniflow-backend/.env, '
      + 'ou exporte APPWRITE_SELF_HOSTED_PROJECT_ID.',
    )
  }
  if (!apiKey) {
    throw new Error(
      'Clé API Appwrite introuvable. Renseigne APPWRITE_API_KEY dans uniflow-backend/.env, '
      + 'ou exporte APPWRITE_SELF_HOSTED_API_KEY.',
    )
  }
  if (!/^[0-9a-f]{20}$/.test(projectId)) {
    throw new Error(`Identifiant de projet Appwrite invalide : « ${projectId} ».`)
  }
}

/** Client REST minimal : renvoie { status, payload } et ne lève que sur erreur réelle. */
export function createClient() {
  requireConfig()
  const headers = {
    'Content-Type': 'application/json',
    'X-Appwrite-Project': projectId,
    'X-Appwrite-Key': apiKey,
  }
  return async function request(method, path, body) {
    const response = await fetch(`${endpoint}${path}`, {
      method,
      headers: body instanceof FormData ? { 'X-Appwrite-Project': projectId, 'X-Appwrite-Key': apiKey } : headers,
      body: body === undefined ? undefined : body instanceof FormData ? body : JSON.stringify(body),
    })
    const text = await response.text()
    let payload = {}
    try {
      payload = text ? JSON.parse(text) : {}
    } catch {
      payload = { message: text }
    }
    // 409 = déjà présent : ce n'est pas un échec pour des scripts idempotents.
    if (!response.ok && response.status !== 409) {
      throw new Error(`${method} ${path} a échoué (${response.status}) : ${payload.message || text}`)
    }
    return { status: response.status, payload }
  }
}
