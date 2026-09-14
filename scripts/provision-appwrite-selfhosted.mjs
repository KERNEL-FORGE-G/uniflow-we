import { createClient, databaseId, endpoint, projectId, requireConfig } from './appwrite-env.mjs'
import { avatarBucketId, bucketDefinitions, schemas, usernameAttribute, usernameIndex } from './appwrite-schema.mjs'

// La configuration (endpoint, projet, clé) vient de uniflow-backend/.env via le
// module partagé, qui refuse de démarrer si elle est absente : ce script a
// longtemps utilisé un identifiant de projet par défaut obsolète et
// provisionnait donc un projet que les applications ne lisent pas.
requireConfig()

console.log(`Provisionnement de ${endpoint} — projet ${projectId}`)

const request = createClient()

async function waitForAttribute(collectionId, key) {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const response = await request('GET', `/databases/${databaseId}/collections/${collectionId}/attributes/${key}`);
    if (response.status === 200 && response.payload.status === 'available') return;
    await new Promise((resolve) => setTimeout(resolve, 350));
  }
  throw new Error(`L’attribut ${collectionId}.${key} n’est pas devenu disponible.`);
}

async function ensureDatabase() {
  const result = await request('POST', '/databases', { databaseId, name: 'UniFlow' });
  console.log(result.status === 201 ? 'Base UniFlow créée.' : 'Base UniFlow déjà présente.');
}

async function ensureBuckets() {
  for (const definition of bucketDefinitions) {
    const result = await request('POST', '/storage/buckets', definition);
    console.log(result.status === 201
      ? `Bucket ${definition.bucketId} créé.`
      : `Bucket ${definition.bucketId} déjà présent.`);
  }
}

async function ensureCollection(schema) {
  const collectionResult = await request('POST', `/databases/${databaseId}/collections`, {
    collectionId: schema.id,
    name: schema.name,
    permissions: ['create("users")'],
    documentSecurity: true,
    enabled: true,
  });
  console.log(collectionResult.status === 201 ? `Collection ${schema.id} créée.` : `Collection ${schema.id} déjà présente.`);

  for (const attribute of schema.attributes) {
    const result = await request('POST', `/databases/${databaseId}/collections/${schema.id}/attributes/${attribute.type}`, attribute.body);
    if (result.status === 201) await waitForAttribute(schema.id, attribute.body.key);
  }

  for (const index of schema.indexes || []) {
    await request('POST', `/databases/${databaseId}/collections/${schema.id}/indexes`, index);
  }
}

// ---------------------------------------------------------------------------
// Pseudo (username) — la messagerie adresse les contacts par pseudo plutôt que
// par email. L'attribut est créé SANS index unique d'abord : ajouter un index
// unique sur un attribut vide ferait échouer la création, et un attribut
// `required` est refusé par Appwrite tant que des documents existants n'ont pas
// la valeur. On crée donc, on rétro-remplit, PUIS on indexe.
// ---------------------------------------------------------------------------

function slugifyUsername(email) {
  const local = String(email || '').split('@')[0].toLowerCase()
  const cleaned = local.replace(/[^a-z0-9._-]/g, '-').replace(/^-+|-+$/g, '')
  return (cleaned || 'utilisateur').slice(0, 32)
}

async function listAllUsers() {
  const documents = []
  for (let offset = 0; offset < 5000; offset += 100) {
    const queries = [
      JSON.stringify({ method: 'limit', values: [100] }),
      JSON.stringify({ method: 'offset', values: [offset] }),
    ].map((query, index) => `queries%5B${index}%5D=${encodeURIComponent(query)}`).join('&')
    const page = await request('GET', `/databases/${databaseId}/collections/users/documents?${queries}`)
    const batch = page.payload.documents || []
    documents.push(...batch)
    if (batch.length < 100) break
  }
  return documents
}

async function ensureUsernameIdentity() {
  const created = await request('POST', `/databases/${databaseId}/collections/users/attributes/string`, {
    key: usernameAttribute.key,
    size: usernameAttribute.size,
    required: usernameAttribute.required, // deviendra `true` une fois le backfill vérifié, sur décision explicite
    array: false,
    encrypt: false,
  })
  if (created.status === 201) await waitForAttribute('users', 'username')
  console.log(created.status === 201 ? 'Attribut users.username créé.' : 'Attribut users.username déjà présent.')

  const users = await listAllUsers()
  const taken = new Set(users.map((user) => user.username).filter(Boolean))
  let filled = 0
  let collided = 0

  for (const user of users) {
    if (user.username) continue
    const base = slugifyUsername(user.email)
    let candidate = base
    let suffix = 2
    while (taken.has(candidate)) {
      const tail = `-${suffix}`
      candidate = `${base.slice(0, usernameAttribute.size - tail.length)}${tail}`
      suffix += 1
      collided += 1
    }
    taken.add(candidate)
    await request('PATCH', `/databases/${databaseId}/collections/users/documents/${user.$id}`, { data: { username: candidate } })
    filled += 1
  }
  console.log(`Pseudo : ${filled} compte(s) rétro-rempli(s) sur ${users.length}, ${collided} collision(s) résolue(s).`)

  const index = await request('POST', `/databases/${databaseId}/collections/users/indexes`, usernameIndex)
  console.log(index.status === 201 ? 'Index unique users.username créé.' : 'Index unique users.username déjà présent.')

  const remaining = await listAllUsers()
  const missing = remaining.filter((user) => !user.username).length
  if (missing > 0) console.log(`ATTENTION : ${missing} compte(s) sans pseudo — l'index unique ne pourra pas être passé en « requis ».`)
}

async function ensurePublicSubscriptionPlanRead() {
  const response = await request('GET', `/databases/${databaseId}/collections/subscription_plans/documents`)
  for (const plan of response.payload.documents || []) {
    await request('PATCH', `/databases/${databaseId}/collections/subscription_plans/documents/${plan.$id}`, {
      data: {},
      permissions: ['read("any")'],
    })
  }
}

async function ensureIndependentWhatsAppPlan() {
  const data = {
    code: 'personal_cm',
    name: 'UniFlow Personnel',
    category: 'PERSONAL',
    countryCode: 'CM',
    currency: 'XAF',
    priceMonthlyAmount: 100,
    priceAnnuallyAmount: 1000,
    period: 'Abonnement personnel',
    badge: 'Paiement WhatsApp',
    highlight: false,
    description: 'Accès indépendant UniFlow au Cameroun. La demande est enregistrée dans Appwrite puis confirmée manuellement après réception de la preuve WhatsApp.',
    providers: '["WHATSAPP"]',
    status: 'ACTIVE',
  }
  const created = await request('POST', `/databases/${databaseId}/collections/subscription_plans/documents`, {
    documentId: 'personal_cm',
    data,
    permissions: ['read("any")'],
  })
  if (created.status === 409) {
    await request('PATCH', `/databases/${databaseId}/collections/subscription_plans/documents/personal_cm`, {
      data,
      permissions: ['read("any")'],
    })
  }
  console.log(created.status === 201 ? 'Formule indépendante WhatsApp créée.' : 'Formule indépendante WhatsApp mise à jour.')
}

await ensureDatabase();
await ensureBuckets();
for (const schema of schemas) await ensureCollection(schema);
// Après ensureCollection : l'attribut et l'index portent sur la collection users.
await ensureUsernameIdentity();
await ensureIndependentWhatsAppPlan();
await ensurePublicSubscriptionPlanRead();
console.log('Provisionnement Appwrite UniFlow terminé.');
console.log('Vérifiez l’état réel du serveur avec : node scripts/verify-appwrite-schema.mjs');
