/**
 * Publie (ou met à jour) le lien de téléchargement d'une application UniFlow
 * dans la collection `app_releases`, avec la clé serveur — sans passer par la
 * page Paramètres du site.
 *
 * L'APK Android est publié dans les releases GitHub du dépôt public
 * `KERNEL-FORGE-G/uniflow-apps` ; à chaque version, l'URL change. Ce script
 * écrit le document dont l'identifiant est la plateforme (`android`,
 * `windows`, `linux`, `macos`) : « update, sinon create », donc rejouable.
 * La validation est celle de la Function (`functions/uniflow-api/src/lib/
 * app-releases.js`) : la ligne de commande et l'interface refusent les mêmes
 * entrées.
 *
 * Usage :
 *   node scripts/set-app-release.mjs android --url <https://…/uniflow.apk> --version 1.0.0 \
 *     --file uniflow-1.0.0-arm64-v8a.apk --size 44355174 --sha256 <64 hex> [--notes "…"]
 *
 * Options :
 *   --url        URL directe du fichier (https:// obligatoire)      [requis]
 *   --version    version affichée sur le bouton (« 1.0.0 »)         [requis]
 *   --file       nom du fichier affiché sous le bouton
 *   --size       taille : octets (44355174) ou avec unité (« 42,3 Mo », « 35.4 MB »)
 *   --sha256     empreinte SHA-256 (64 hexadécimaux) ou rien
 *   --notes      notes de version
 *   --from       chemin d'un fichier local (l'APK) : renseigne --file, --size et
 *                --sha256 s'ils ne sont pas donnés
 *   --published-at  date ISO de publication (défaut : maintenant)
 *   --disable    enregistre sans publier (le site affiche « bientôt disponible »)
 *   --dry-run    affiche le document sans écrire
 */

import { createHash } from 'node:crypto'
import { basename } from 'node:path'
import { readFile, stat } from 'node:fs/promises'
import { createClient, databaseId, requireConfig } from './appwrite-env.mjs'
import { RELEASE_COLLECTION, RELEASE_PLATFORMS, ReleaseValidationError, normalizeRelease } from '../functions/uniflow-api/src/lib/app-releases.js'

const OPTIONS_WITH_VALUE = new Set(['url', 'version', 'file', 'size', 'sha256', 'notes', 'from', 'published-at'])
const FLAGS = new Set(['disable', 'dry-run', 'help'])

function usage(message) {
  if (message) console.error(`Erreur : ${message}\n`)
  console.error(`Usage : node scripts/set-app-release.mjs <${RELEASE_PLATFORMS.join('|')}> --url <https://…> --version <x.y.z> [--file …] [--size …] [--sha256 …] [--notes …] [--from <fichier local>] [--published-at <ISO>] [--disable] [--dry-run]`)
  process.exit(message ? 1 : 0)
}

function parseArgs(argv) {
  const positional = []
  const options = {}
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    if (!arg.startsWith('--')) { positional.push(arg); continue }
    const [rawName, inlineValue] = arg.slice(2).split(/=(.*)/s)
    if (FLAGS.has(rawName)) { options[rawName] = true; continue }
    if (!OPTIONS_WITH_VALUE.has(rawName)) usage(`option inconnue : --${rawName}`)
    const value = inlineValue !== undefined ? inlineValue : argv[index + 1]
    if (value === undefined || (value.startsWith('--') && inlineValue === undefined)) usage(`--${rawName} attend une valeur`)
    if (inlineValue === undefined) index += 1
    options[rawName] = value
  }
  return { positional, options }
}

/** « 42,3 Mo » / « 35.4 MB » / « 44355174 » → octets entiers (base 1024, comme le site). */
export function parseSize(value) {
  const raw = String(value ?? '').trim().replace(/(\d)[\s\u00a0\u202f](?=\d{3}\b)/g, '$1')
  if (!raw) return 0
  const match = /^(\d+(?:[.,]\d+)?)\s*([a-zA-Z]*)$/.exec(raw)
  if (!match) return null
  const factors = { '': 1, o: 1, b: 1, ko: 1024, kb: 1024, kio: 1024, mo: 1024 ** 2, mb: 1024 ** 2, mio: 1024 ** 2, go: 1024 ** 3, gb: 1024 ** 3, gio: 1024 ** 3 }
  const factor = factors[match[2].toLowerCase()]
  if (factor === undefined) return null
  return Math.round(Number(match[1].replace(',', '.')) * factor)
}

async function describeLocalFile(path) {
  const info = await stat(path)
  const content = await readFile(path)
  return { fileName: basename(path), sizeBytes: info.size, sha256: createHash('sha256').update(content).digest('hex') }
}

const { positional, options } = parseArgs(process.argv.slice(2))
if (options.help) usage()
const platform = String(positional[0] || '').toLowerCase()
if (!RELEASE_PLATFORMS.includes(platform)) usage(`plateforme attendue en premier argument : ${RELEASE_PLATFORMS.join(', ')}`)

let local = null
if (options.from) {
  try { local = await describeLocalFile(options.from) } catch (error) { usage(`--from : ${error.message}`) }
}

const sizeBytes = options.size !== undefined ? parseSize(options.size) : local?.sizeBytes ?? 0
if (sizeBytes === null) usage(`--size illisible : « ${options.size} » (octets, ou « 42,3 Mo »)`)

let release
try {
  release = normalizeRelease({
    platform,
    url: options.url,
    version: options.version,
    fileName: options.file ?? local?.fileName ?? '',
    sizeBytes,
    sha256: options.sha256 ?? local?.sha256 ?? '',
    notes: options.notes ?? '',
    publishedAt: options['published-at'] ?? null,
    enabled: !options.disable,
  })
} catch (error) {
  if (error instanceof ReleaseValidationError) usage(error.message)
  throw error
}

console.log(`Document app_releases/${release.platform} :`)
console.log(JSON.stringify(release, null, 2))

if (options['dry-run']) {
  console.log('\n--dry-run : rien n’a été écrit.')
  process.exit(0)
}

requireConfig()
const request = createClient()
const path = `/databases/${databaseId}/collections/${RELEASE_COLLECTION}/documents`
// Le document doit porter lui-même `read("any")` : la collection est en
// `documentSecurity`, et la landing publique le lit sans session.
const permissions = ['read("any")']

let outcome
try {
  await request('PATCH', `${path}/${release.platform}`, { data: release, permissions })
  outcome = 'mis à jour'
} catch (error) {
  // `createClient` formate ses erreurs « PATCH … a échoué (404) : … » ; seul
  // le document absent justifie une création.
  if (!/\(404\)/.test(error.message)) throw error
  await request('POST', path, { documentId: release.platform, data: release, permissions })
  outcome = 'créé'
}

const { payload } = await request('GET', `${path}/${release.platform}`)
console.log(`\nDocument ${outcome} — version ${payload.version}, ${payload.enabled ? 'publié' : 'NON publié'}, ${payload.$permissions.join(' ')}.`)
console.log(payload.enabled
  ? 'Le site affichera ce lien à sa prochaine visite (cache react-query : jusqu’à 10 minutes).'
  : 'Le site continue d’afficher « bientôt disponible » tant que le document n’est pas publié.')
