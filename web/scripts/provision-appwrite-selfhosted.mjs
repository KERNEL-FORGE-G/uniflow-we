/**
 * Provisionnement idempotent du projet Appwrite UniFlow.
 *
 * Le nom du fichier date de l'époque du serveur auto-hébergé ; depuis le
 * 2026-09-20 il provisionne le projet Appwrite Cloud `uniflow` (région `fra`),
 * exactement de la même façon — l'API Databases « legacy » (collections et
 * documents), que les trois clients et les dix Functions utilisent, est celle
 * qu'Appwrite Cloud 2.x continue de servir. Le fichier n'est pas renommé pour
 * ne pas casser la documentation et les commandes déjà écrites.
 */
import { createClient, databaseId, endpoint, projectId, requireConfig } from './appwrite-env.mjs'
import { allSchemas, bucketDefinitions, membersExtraAttributes, usernameAttribute, usernameIndex } from './appwrite-schema.mjs'
import { subscriptionPlanCatalog, upsertSubscriptionPlan } from './subscription-plans-catalog.mjs'

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

/**
 * Existence d'une ressource, sans lever sur 404.
 *
 * Le schéma « créer, puis tenir le 409 pour un succès » ne suffit plus sur
 * Appwrite Cloud : quand le plan gratuit est à son plafond (1 base, 1 bucket),
 * la création d'une ressource **déjà existante** répond 403 « maximum number …
 * for the selected plan has reached » avant même de constater le doublon. On
 * interroge donc l'existant d'abord, et on ne crée que ce qui manque.
 */
async function exists(path) {
  try {
    const response = await request('GET', path);
    return response.status === 200;
  } catch (error) {
    if (/\(404\)/.test(error.message)) return false;
    throw error;
  }
}

async function ensureDatabase() {
  if (await exists(`/databases/${databaseId}`)) {
    console.log('Base UniFlow déjà présente.');
    return;
  }
  await request('POST', '/databases', { databaseId, name: 'UniFlow' });
  console.log('Base UniFlow créée.');
}

async function ensureBuckets() {
  for (const definition of bucketDefinitions) {
    if (!(await exists(`/storage/buckets/${definition.bucketId}`))) {
      await request('POST', '/storage/buckets', definition);
      console.log(`Bucket ${definition.bucketId} créé.`);
      continue;
    }
    // Le bucket existe : on réconcilie ses permissions au lieu de le croire
    // conforme. Le bucket d'avatars d'UniFlow a été créé à la main dans la
    // console, donc avec un identifiant généré et sans aucune permission —
    // aucun client ne pouvait lire une photo, alors que la définition, elle,
    // demande une lecture publique.
    const updated = await request('PUT', `/storage/buckets/${definition.bucketId}`, definition);
    console.log(updated.status === 200
      ? `Bucket ${definition.bucketId} déjà présent, permissions réconciliées.`
      : `Bucket ${definition.bucketId} déjà présent (inchangé).`);
  }
}

async function ensureMembersAttributes() {
  for (const attribute of membersExtraAttributes) {
    const result = await request('POST', `/databases/${databaseId}/collections/users/attributes/${attribute.type}`, attribute.body);
    if (result.status === 201) {
      await waitForAttribute('users', attribute.body.key);
      console.log(`Attribut users.${attribute.body.key} créé.`);
    } else {
      console.log(`Attribut users.${attribute.body.key} déjà présent.`);
    }
  }
}

/**
 * Une énumération déjà créée ne reçoit jamais ses nouvelles valeurs par le
 * `POST` ci-dessus (409 ignoré). Or le schéma en gagne avec le temps — `M1` et
 * `M2` dans `users.level` pour les étudiants de Master de la Faculté des
 * Sciences, `PLATFORM` dans `users.accountType` pour l'administrateur de la
 * plateforme — et le serveur refusait ces documents alors que le script
 * annonçait un schéma à jour. On complète donc l'énumération existante ; on ne
 * retire jamais une valeur, des documents pouvant encore la porter.
 */
async function reconcileEnumElements(collectionId, body) {
  const current = await request('GET', `/databases/${databaseId}/collections/${collectionId}/attributes/${body.key}`);
  const existing = current.payload.elements || [];
  const missing = body.elements.filter((element) => !existing.includes(element));
  if (missing.length === 0) return;
  await request('PATCH', `/databases/${databaseId}/collections/${collectionId}/attributes/enum/${body.key}`, {
    elements: [...existing, ...missing],
    required: current.payload.required ?? body.required,
    default: current.payload.default ?? null,
  });
  await waitForAttribute(collectionId, body.key);
  console.log(`Énumération ${collectionId}.${body.key} complétée : ${missing.join(', ')}.`);
}

async function ensureCollection(schema) {
  // Les collections académiques sont lues par les trois applications : sans
  // `read("users")`, un étudiant connecté reçoit une liste vide alors que les
  // documents existent. Les autres collections gardent le contrat historique
  // (`create("users")` seul), leurs permissions étant gérées par document.
  const permissions = schema.permissions || ['create("users")'];
  const collectionResult = await request('POST', `/databases/${databaseId}/collections`, {
    collectionId: schema.id,
    name: schema.name,
    permissions,
    documentSecurity: true,
    enabled: true,
  });
  if (collectionResult.status === 201) {
    console.log(`Collection ${schema.id} créée.`);
  } else {
    console.log(`Collection ${schema.id} déjà présente.`);
    // Le schéma déclare explicitement des permissions : elles sont alors
    // réconciliées, une collection existante pouvant avoir été créée à la main
    // sans aucune permission de lecture.
    if (schema.permissions) {
      await request('PUT', `/databases/${databaseId}/collections/${schema.id}`, {
        name: schema.name,
        permissions,
        documentSecurity: true,
        enabled: true,
      });
    }
  }

  for (const attribute of schema.attributes) {
    const result = await request('POST', `/databases/${databaseId}/collections/${schema.id}/attributes/${attribute.type}`, attribute.body);
    if (result.status === 201) await waitForAttribute(schema.id, attribute.body.key);
    else if (attribute.type === 'enum') await reconcileEnumElements(schema.id, attribute.body);
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

/**
 * Formule minimale garantie après provisionnement : la page tarifaire ne doit
 * jamais être vide. Le catalogue complet s'écrit avec
 * `node scripts/seed-subscription-plans.mjs` ; la définition vient du même
 * fichier pour qu'un provisionnement ne réécrive pas une version divergente.
 */
async function ensureIndependentWhatsAppPlan() {
  const plan = subscriptionPlanCatalog.find((entry) => entry.code === 'personal_cm')
  const outcome = await upsertSubscriptionPlan(request, databaseId, plan)
  console.log(outcome === 'created' ? 'Formule indépendante WhatsApp créée.' : 'Formule indépendante WhatsApp mise à jour.')
}

await ensureDatabase();
await ensureBuckets();
for (const schema of allSchemas) await ensureCollection(schema);
// Après les collections : `avatarFileId` est écrit par les écrans Paramètres.
await ensureMembersAttributes();
// Après ensureCollection : l'attribut et l'index portent sur la collection users.
await ensureUsernameIdentity();
await ensureIndependentWhatsAppPlan();
await ensurePublicSubscriptionPlanRead();
console.log('Provisionnement Appwrite UniFlow terminé.');
console.log('Vérifiez l’état réel du serveur avec : node scripts/verify-appwrite-schema.mjs');
