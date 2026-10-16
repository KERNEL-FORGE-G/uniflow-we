// Vérifie la chaîne complète d'une pièce jointe de messagerie.
//
// Le défaut rejoué ici : l'expéditeur téléverse avec ses seules permissions
// (Appwrite 1.6.1 refuse qu'un client en accorde à un autre), donc c'est la
// Function qui doit donner la lecture au destinataire au moment de l'envoi.
// Deux erreurs successives ont été commises sur ce point sans être vues :
//
//   1. la Function ne posait aucune permission, et la pièce jointe restait
//      lisible par son seul auteur ;
//   2. le correctif appelait `storage.updateFile(bucket, id, { permissions })`
//      alors que `node-appwrite` 12 attend `(bucket, id, name, permissions)` en
//      positionnels. L'objet partait comme `name`, Appwrite répondait
//      « Invalid `name` param », et *tout envoi de pièce jointe* échouait.
//
// Le script provisionne deux comptes jetables, exerce la chaîne entière, puis
// les supprime. Il échoue si le destinataire obtient la lecture *avant* l'envoi
// — sans cette contre-épreuve, un succès ne prouverait rien.
//
//   APPWRITE_SELF_HOSTED_API_KEY=… node scripts/test-messaging-attachment.mjs

const endpoint = String(process.env.APPWRITE_SELF_HOSTED_ENDPOINT || 'https://fra.cloud.appwrite.io/v1').replace(/\/+$/, '')
const projectId = process.env.APPWRITE_SELF_HOSTED_PROJECT_ID || 'uniflow'
const apiKey = process.env.APPWRITE_SELF_HOSTED_API_KEY
const databaseId = 'uniflow'
const bucketId = 'uniflow_assets'

if (!apiKey) throw new Error('APPWRITE_SELF_HOSTED_API_KEY est requise pour tester la messagerie.')

// PNG 1×1 : le plus petit fichier dont Appwrite déduit un type MIME `image/png`,
// ce qui exerce la branche « image » et non la branche « carte ».
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64')

const runId = `${Date.now()}${Math.floor(Math.random() * 10000)}`
const compteA = { userId: `qamsga${runId}`.slice(0, 36), email: `qamsg-a-${runId}@example.invalid`, password: `UniFlowQa-${runId}!`, username: `qamsga${runId}`.slice(0, 32) }
const compteB = { userId: `qamsgb${runId}`.slice(0, 36), email: `qamsg-b-${runId}@example.invalid`, password: `UniFlowQa-${runId}!`, username: `qamsgb${runId}`.slice(0, 32) }

let fileId = ''
let conversationId = ''

async function responseOf(response) {
  const text = await response.text()
  let payload = {}
  try { payload = text ? JSON.parse(text) : {} } catch { payload = { raw: text } }
  if (!response.ok) throw new Error(`${response.status}:${payload.message || text || 'Appwrite error'}`)
  return { payload, cookie: response.headers.get('set-cookie') || '' }
}

async function admin(method, path, body) {
  const response = await fetch(`${endpoint}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', 'X-Appwrite-Project': projectId, 'X-Appwrite-Key': apiKey },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  return responseOf(response)
}

async function adminQuiet(method, path) {
  try { await admin(method, path) } catch { /* nettoyage : un échec ne doit pas masquer le verdict */ }
}

async function sessionDe(compte) {
  const response = await fetch(`${endpoint}/account/sessions/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Appwrite-Project': projectId },
    body: JSON.stringify({ email: compte.email, password: compte.password }),
  })
  const { cookie } = await responseOf(response)
  if (!cookie) throw new Error('SESSION_COOKIE_MISSING')
  return cookie.split(';')[0]
}

/** Exécute la Function et rend le corps applicatif, en refusant les échecs. */
async function executer(cookie, body) {
  const response = await fetch(`${endpoint}/functions/uniflow-api/executions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Appwrite-Project': projectId, Cookie: cookie },
    body: JSON.stringify({ body: JSON.stringify(body), async: false, method: 'POST', path: '/messaging' }),
  })
  const { payload } = await responseOf(response)
  const corps = payload.responseBody ? JSON.parse(payload.responseBody) : {}
  if (!corps.ok) throw new Error(`FUNCTION:${corps.code || payload.responseStatusCode}:${corps.message || ''}`)
  return corps
}

/** Téléverse un fichier avec la session de son auteur, permissions minimales. */
async function televerser(cookie, auteurId) {
  const form = new FormData()
  fileId = `qamsg${runId}`.slice(0, 36)
  form.set('fileId', fileId)
  form.set('file', new Blob([PNG], { type: 'image/png' }), 'qamsg.png')
  // Exactement ce que fait `uploadAttachment` : rien pour le destinataire, qui
  // ne peut pas être nommé depuis un client.
  form.append('permissions[]', `read("user:${auteurId}")`)
  form.append('permissions[]', `update("user:${auteurId}")`)
  form.append('permissions[]', `delete("user:${auteurId}")`)
  const response = await fetch(`${endpoint}/storage/buckets/${bucketId}/files`, {
    method: 'POST',
    // Surtout pas de `Content-Type` : le multipart porte le sien, et le forcer
    // fait répondre à Appwrite « Param "fileId" is not optional ».
    headers: { 'X-Appwrite-Project': projectId, Cookie: cookie },
    body: form,
  })
  const { payload } = await responseOf(response)
  return payload.$id
}

/** Télécharge avec la session du lecteur ; rend `null` si l'accès est refusé. */
async function telecharger(cookie) {
  const response = await fetch(`${endpoint}/storage/buckets/${bucketId}/files/${fileId}/download`, {
    headers: { 'X-Appwrite-Project': projectId, Cookie: cookie },
  })
  if (!response.ok) return null
  return Buffer.from(await response.arrayBuffer())
}

async function provisionner(compte) {
  await admin('POST', '/users', { userId: compte.userId, email: compte.email, password: compte.password, name: compte.username })
  // La collection `users` est identifiée par l'identifiant du document — il n'y
  // a pas d'attribut `userId`, contrairement à `academic_directory`. C'est
  // `username` qui permet à l'action `open` de retrouver le correspondant.
  await admin('POST', `/databases/${databaseId}/collections/users/documents`, {
    documentId: compte.userId,
    data: {
      email: compte.email,
      name: compte.username,
      username: compte.username,
      accountType: 'UNIVERSITY',
      role: 'STUDENT',
      university: 'Université de Yaoundé I',
      program: 'ICT4D',
      level: 'L1',
      country: 'Cameroun',
    },
    permissions: [`read("user:${compte.userId}")`, `update("user:${compte.userId}")`, `delete("user:${compte.userId}")`],
  })
  await admin('POST', `/databases/${databaseId}/collections/academic_directory/documents`, {
    documentId: compte.userId,
    data: { userId: compte.userId, name: compte.username, role: 'STUDENT', university: 'Université de Yaoundé I', program: 'ICT4D', level: 'L1', matricule: `QA-${runId}`.slice(0, 24), status: 'ACTIVE' },
    permissions: ['read("users")', `update("user:${compte.userId}")`, `delete("user:${compte.userId}")`],
  })
}

async function nettoyer() {
  if (fileId) await adminQuiet('DELETE', `/storage/buckets/${bucketId}/files/${fileId}`)
  if (conversationId) {
    try {
      const messages = await admin('GET', `/databases/${databaseId}/collections/chat_messages/documents?queries[]=${encodeURIComponent(`equal("conversationId", ["${conversationId}"])`)}&limit=100`)
      for (const message of messages.payload.documents || []) {
        await adminQuiet('DELETE', `/databases/${databaseId}/collections/chat_messages/documents/${message.$id}`)
      }
    } catch { /* collection illisible : on continue le nettoyage */ }
    await adminQuiet('DELETE', `/databases/${databaseId}/collections/chat_conversations/documents/${conversationId}`)
  }
  for (const compte of [compteA, compteB]) {
    await adminQuiet('DELETE', `/databases/${databaseId}/collections/academic_directory/documents/${compte.userId}`)
    await adminQuiet('DELETE', `/databases/${databaseId}/collections/users/documents/${compte.userId}`)
    await adminQuiet('DELETE', `/users/${compte.userId}`)
  }
}

const etapes = []
function verifier(intitule, condition, detail = '') {
  etapes.push({ intitule, ok: Boolean(condition), detail })
  console.log(`${condition ? '  ok  ' : ' ÉCHEC'} ${intitule}${detail ? ` — ${detail}` : ''}`)
}

try {
  await provisionner(compteA)
  await provisionner(compteB)
  const cookieA = await sessionDe(compteA)
  const cookieB = await sessionDe(compteB)

  const ouverture = await executer(cookieA, { action: 'open', username: compteB.username })
  conversationId = ouverture.conversation.id
  verifier('A ouvre la conversation avec B', Boolean(conversationId), conversationId)
  verifier('la conversation porte l’identifiant du correspondant', ouverture.conversation.userId === compteB.userId)

  await televerser(cookieA, compteA.userId)
  verifier('A téléverse une pièce jointe', Boolean(fileId), fileId)

  // Contre-épreuve : sans elle, un succès plus bas ne prouverait rien.
  verifier('B ne peut pas encore lire le fichier', (await telecharger(cookieB)) === null)

  await executer(cookieA, { action: 'send', conversationId, text: '', fileId })
  verifier('A envoie le message portant la pièce jointe', true)

  const meta = await admin('GET', `/storage/buckets/${bucketId}/files/${fileId}`)
  const permissions = meta.payload.$permissions || []
  verifier('le destinataire reçoit la lecture', permissions.includes(`read("user:${compteB.userId}")`), permissions.join(' '))
  // `updateFile` remplace la liste entière : si l'expéditeur perd `delete`, un
  // fichier envoyé par erreur devient indestructible.
  verifier('l’expéditeur garde le droit de retirer son fichier', permissions.includes(`delete("user:${compteA.userId}")`))

  const octets = await telecharger(cookieB)
  verifier('B télécharge le fichier de A', octets?.length === PNG.length, `${octets?.length ?? 0} octets`)

  const boite = await executer(cookieB, { action: 'list' })
  const fil = (boite.conversations || []).find((c) => c.id === conversationId)
  const piece = (fil?.messages || []).find((m) => m.fileId === fileId)
  verifier('la pièce jointe apparaît chez B', Boolean(piece))
  verifier('elle est reconnue comme image', piece?.kind === 'image', String(piece?.kind))
  verifier('sa taille est celle du fichier réel', piece?.fileSize === PNG.length, String(piece?.fileSize))
} finally {
  await nettoyer()
}

const echecs = etapes.filter((etape) => !etape.ok)
console.log(`\n${etapes.length - echecs.length}/${etapes.length} vérifications passées.`)
if (echecs.length) {
  console.error(`Échecs : ${echecs.map((etape) => etape.intitule).join(' | ')}`)
  process.exit(1)
}
