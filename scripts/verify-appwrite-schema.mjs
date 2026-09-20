/**
 * Vérification de l'état réel de la base Appwrite UniFlow.
 *
 * Interroge le serveur auto-hébergé et compare ce qu'il contient à la
 * description déclarative de `appwrite-schema.mjs` : collections, attributs,
 * index, buckets, et remplissage du pseudo. Ne modifie RIEN — c'est un
 * diagnostic, utilisable sans risque sur la base de production.
 *
 * Usage :
 *   node scripts/verify-appwrite-schema.mjs
 *
 * Code de sortie 0 si tout est conforme, 1 sinon : utilisable en CI.
 */
import { createClient, databaseId, endpoint, projectId, requireConfig } from './appwrite-env.mjs'
import {
  allSchemas,
  bucketDefinitions,
  referencedCollections,
  usernameAttribute,
  usernameIndex,
} from './appwrite-schema.mjs'

requireConfig()
const request = createClient()

const problems = []
const notes = []

function fail(message) {
  problems.push(message)
  console.log(`  MANQUANT   ${message}`)
}

function ok(message) {
  console.log(`  OK         ${message}`)
}

// ---------------------------------------------------------------------------
// Le serveur répond-il, et dans quelle version ? Un décalage entre la version
// du serveur et celle des SDK clients explique une bonne part des échecs
// silencieux : node-appwrite 12 vise l'ère 1.5, le SDK web 17 l'ère 1.6.
// ---------------------------------------------------------------------------
async function checkServer() {
  console.log(`\n== Serveur ==\n${endpoint} — projet ${projectId}`)
  try {
    const response = await fetch(`${endpoint}/health/version`)
    if (response.ok) {
      const payload = await response.json()
      console.log(`  Version Appwrite : ${payload.version || 'inconnue'}`)
      notes.push(`Version serveur : ${payload.version || 'inconnue'}`)
    } else {
      console.log(`  Version Appwrite : indisponible (${response.status}) — l'endpoint /health/version exige peut-être une clé.`)
    }
  } catch (error) {
    // Le serveur peut être en pause ou le certificat non reconnu : on le
    // signale sans interrompre, car le reste du diagnostic reste instructif.
    fail(`Le serveur Appwrite est injoignable (${error.message}). Vérifiez le certificat TLS et que le conteneur répond.`)
  }
}

// ---------------------------------------------------------------------------
// Collections, attributs, index
// ---------------------------------------------------------------------------
/**
 * Type d'un attribut tel qu'Appwrite le renvoie, ramené au vocabulaire du
 * schéma : une énumération est un `string` de `format: "enum"`, un `float` est
 * renvoyé `double`. Sans cette traduction, la sonde signalait « string au lieu
 * de enum » sur neuf attributs parfaitement conformes — c'est l'origine de la
 * « divergence schéma / serveur » restée ouverte pendant plusieurs sessions.
 */
function liveType(attribute) {
  if (attribute.format === 'enum') return 'enum'
  if (attribute.type === 'double') return 'float'
  return attribute.type
}

function compareAttributes(collectionId, expected, live) {
  const byKey = new Map(live.map((attribute) => [attribute.key, attribute]))
  for (const attribute of expected) {
    const { key } = attribute.body
    const actual = byKey.get(key)
    if (!actual) {
      fail(`${collectionId}.${key} — attribut absent (type ${attribute.type})`)
      continue
    }
    if (liveType(actual) !== attribute.type) {
      fail(`${collectionId}.${key} — type ${liveType(actual)} au lieu de ${attribute.type}`)
      continue
    }
    if (attribute.type === 'enum') {
      const missing = attribute.body.elements.filter((element) => !(actual.elements || []).includes(element))
      if (missing.length) {
        fail(`${collectionId}.${key} — valeurs d'énumération absentes : ${missing.join(', ')}`)
        continue
      }
    }
    if (Boolean(actual.required) !== Boolean(attribute.body.required)) {
      fail(`${collectionId}.${key} — required=${Boolean(actual.required)} au lieu de ${Boolean(attribute.body.required)}`)
      continue
    }
    if (attribute.type === 'string' && Number(actual.size) !== Number(attribute.body.size)) {
      fail(`${collectionId}.${key} — taille ${actual.size} au lieu de ${attribute.body.size}`)
      continue
    }
    if (actual.status !== 'available') {
      // Un attribut encore en cours de création n'est pas une erreur, mais il
      // n'est pas encore interrogeable : les clients échoueront tant qu'il l'est.
      notes.push(`${collectionId}.${key} — état « ${actual.status} », pas encore interrogeable`)
      console.log(`  EN COURS   ${collectionId}.${key} (${actual.status})`)
    }
  }
}

function compareIndexes(collectionId, expected, live) {
  const byKey = new Map(live.map((index) => [index.key, index]))
  for (const index of expected) {
    const actual = byKey.get(index.key)
    if (!actual) {
      fail(`${collectionId} — index « ${index.key} » (${index.type}) absent. Les requêtes filtrées sur ${index.attributes.join('+')} seront lentes ou refusées.`)
      continue
    }
    const missing = index.attributes.filter((attribute) => !(actual.attributes || []).includes(attribute))
    if (missing.length) {
      fail(`${collectionId} — index « ${index.key} » ne couvre pas ${missing.join(', ')}`)
      continue
    }
    if (actual.status !== 'available') {
      notes.push(`${collectionId} — index « ${index.key} » en état « ${actual.status} »`)
    }
  }
}

/**
 * `request()` lève sur tout statut non-OK, 404 compris : le garde
 * `if (response.status === 404)` qui suivait ne s'appliquait donc jamais, et
 * la première collection absente faisait mourir la sonde au lieu d'être
 * listée — le contrôle des buckets et de la messagerie n'était jamais atteint.
 */
async function getOrNull(path) {
  try {
    const response = await request('GET', path)
    return response.status === 200 ? response.payload : null
  } catch (error) {
    if (/\(404\)/.test(error.message)) return null
    throw error
  }
}

async function listCollection(collectionId) {
  return getOrNull(`/databases/${databaseId}/collections/${collectionId}`)
}

async function countDocuments(collectionId) {
  const payload = await getOrNull(`/databases/${databaseId}/collections/${collectionId}/documents?queries%5B0%5D=${encodeURIComponent(JSON.stringify({ method: 'limit', values: [1] }))}`)
  if (!payload) return null
  return Number(payload.total ?? (payload.documents || []).length)
}

async function checkCollections() {
  console.log('\n== Collections ==')
  const seen = new Set()
  // `allSchemas`, pas `schemas` : les collections académiques, d'abonnement et
  // d'équipe n'étaient jamais vérifiées, alors que le serveur en porte douze.
  for (const schema of allSchemas) {
    // `users` apparaît une fois : le pseudo est vérifié à part, plus bas.
    if (seen.has(schema.id)) continue
    seen.add(schema.id)

    const live = await listCollection(schema.id)
    if (!live) {
      fail(`collection « ${schema.id} » (${schema.name}) absente`)
      continue
    }
    const attributes = live.attributes || []
    const indexes = live.indexes || []
    compareAttributes(schema.id, schema.attributes, attributes)
    compareIndexes(schema.id, schema.indexes || [], indexes)
    const count = await countDocuments(schema.id)
    ok(`collection « ${schema.id} » — ${attributes.length} attribut(s), ${indexes.length} index, ${count ?? '?'} document(s)`)
  }

  if (referencedCollections.length) console.log('\n== Collections lues par les applications mais non provisionnées ici ==')
  for (const collectionId of referencedCollections) {
    const live = await listCollection(collectionId)
    if (!live) {
      fail(`collection « ${collectionId} » absente — une Function ou un écran qui la lit échouera`)
      continue
    }
    const count = await countDocuments(collectionId)
    if (count === 0) {
      notes.push(`collection « ${collectionId} » existe mais est vide`)
      console.log(`  VIDE       collection « ${collectionId} » existe mais ne contient aucun document`)
    } else {
      ok(`collection « ${collectionId} » — ${count} document(s)`)
    }
  }
}

// ---------------------------------------------------------------------------
// Buckets
// ---------------------------------------------------------------------------
async function checkBuckets() {
  console.log('\n== Buckets de stockage ==')
  for (const definition of bucketDefinitions) {
    const live = await getOrNull(`/storage/buckets/${definition.bucketId}`)
    if (!live) {
      fail(`bucket « ${definition.bucketId} » absent — les téléversements échoueront`)
      continue
    }
    if (Boolean(live.fileSecurity) !== Boolean(definition.fileSecurity)) {
      fail(`bucket « ${definition.bucketId} » — fileSecurity=${Boolean(live.fileSecurity)} au lieu de ${Boolean(definition.fileSecurity)}`)
    }
    if (!live.enabled) fail(`bucket « ${definition.bucketId} » est désactivé`)
    if (Number(live.maximumFileSize) < Number(definition.maximumFileSize)) {
      // Une limite plus basse que prévu rejette des images parfaitement valides.
      notes.push(`bucket « ${definition.bucketId} » — taille maximale ${live.maximumFileSize} octets, attendu ${definition.maximumFileSize}`)
    }
    const extensions = live.allowedFileExtensions || []
    const rejected = definition.allowedFileExtensions.filter((extension) => !extensions.includes(extension))
    if (extensions.length && rejected.length) {
      notes.push(`bucket « ${definition.bucketId} » — extensions refusées : ${rejected.join(', ')}`)
    }
    for (const permission of definition.permissions) {
      if (!(live.$permissions || []).includes(permission)) {
        fail(`bucket « ${definition.bucketId} » — permission « ${permission} » absente`)
      }
    }
    ok(`bucket « ${definition.bucketId} » — ${live.$permissions?.length ?? 0} permission(s), max ${live.maximumFileSize} octets`)
  }
}

// ---------------------------------------------------------------------------
// Pseudo : c'est le référent de la messagerie, donc le point le plus critique.
// ---------------------------------------------------------------------------
async function listAllUsers() {
  const documents = []
  for (let offset = 0; offset < 5000; offset += 100) {
    const queries = [
      JSON.stringify({ method: 'limit', values: [100] }),
      JSON.stringify({ method: 'offset', values: [offset] }),
    ].map((query, index) => `queries%5B${index}%5D=${encodeURIComponent(query)}`).join('&')
    const page = await request('GET', `/databases/${databaseId}/collections/users/documents?${queries}`)
    if (page.status !== 200) return null
    const batch = page.payload.documents || []
    documents.push(...batch)
    if (batch.length < 100) break
  }
  return documents
}

async function checkIdentity() {
  console.log('\n== Identité : pseudo et photo de profil ==')
  const live = await listCollection('users')
  if (!live) return

  const attributes = live.attributes || []
  const hasUsername = attributes.some((attribute) => attribute.key === usernameAttribute.key)
  const hasAvatar = attributes.some((attribute) => attribute.key === 'avatarFileId')

  if (!hasUsername) fail('users.username absent — la messagerie par pseudo ne peut pas fonctionner')
  else {
    if (!attributes.some((attribute) => attribute.key === usernameAttribute.key && attribute.status === 'available')) {
      notes.push('users.username existe mais n’est pas encore disponible')
    }
    const indexes = (await request('GET', `/databases/${databaseId}/collections/users/indexes`)).payload.indexes || []
    const index = indexes.find((candidate) => candidate.key === usernameIndex.key)
    if (!index) fail(`index « ${usernameIndex.key} » absent — deux comptes pourraient partager le même pseudo`)
    else ok(`users.username présent, index unique « ${usernameIndex.key} » (${index.status})`)
  }
  if (!hasAvatar) fail('users.avatarFileId absent — la photo de profil ne pourra pas être enregistrée')

  const users = await listAllUsers()
  if (!users) {
    fail('la collection users n’a pas pu être parcourue — vérifiez les permissions de lecture')
    return
  }

  const withUsername = users.filter((user) => user.username)
  const withoutUsername = users.filter((user) => !user.username)
  const withAvatar = users.filter((user) => user.avatarFileId)
  console.log(`  ${users.length} profil(s) : ${withUsername.length} avec pseudo, ${withAvatar.length} avec photo de profil.`)
  if (withoutUsername.length) {
    fail(`${withoutUsername.length} compte(s) sans pseudo — injoignables par la messagerie tant que le rétro-remplissage n’a pas tourné`)
  }

  // Un doublon signalerait que l'index unique manque ou n'était pas encore
  // disponible au moment du remplissage.
  const seen = new Map()
  for (const user of withUsername) {
    const key = String(user.username).toLowerCase()
    if (seen.has(key)) fail(`pseudo « ${user.username} » partagé par ${seen.get(key)} et ${user.$id}`)
    else seen.set(key, user.$id)
  }
  if (seen.size) ok(`${seen.size} pseudo(s) unique(s)`)
}

// ---------------------------------------------------------------------------
// Messagerie : les deux collections doivent exister ET être vides ou non, mais
// surtout leurs index doivent être disponibles, sinon toute action échoue.
// ---------------------------------------------------------------------------
async function checkMessaging() {
  console.log('\n== Messagerie ==')
  for (const collectionId of ['chat_conversations', 'chat_messages']) {
    const live = await listCollection(collectionId)
    if (!live) {
      fail(`collection « ${collectionId} » absente — chaque action de messagerie renverra une erreur`)
      continue
    }
    const count = await countDocuments(collectionId)
    const unavailable = (live.indexes || []).filter((index) => index.status !== 'available')
    if (unavailable.length) fail(`${collectionId} — index non disponibles : ${unavailable.map((index) => index.key).join(', ')}`)
    else ok(`${collectionId} — ${count ?? '?'} document(s), index disponibles`)
  }
}

await checkServer()
await checkCollections()
await checkBuckets()
await checkIdentity()
await checkMessaging()

console.log('\n== Rapport ==')
if (notes.length) {
  console.log(`\n${notes.length} remarque(s) sans blocage :`)
  for (const note of notes) console.log(`  - ${note}`)
}
if (problems.length) {
  console.log(`\n${problems.length} problème(s) bloquant(s) :`)
  for (const problem of problems) console.log(`  - ${problem}`)
  console.log('\nCorrigez-les avec : node scripts/provision-appwrite-selfhosted.mjs')
  process.exit(1)
}
console.log('\nSchéma Appwrite conforme : les trois interfaces peuvent lire et écrire.')
