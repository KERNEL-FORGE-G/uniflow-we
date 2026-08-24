const endpoint = (process.env.APPWRITE_SELF_HOSTED_ENDPOINT || 'https://appwrite.kernelforge.codes/v1').replace(/\/+$/, '');
const projectId = process.env.APPWRITE_SELF_HOSTED_PROJECT_ID || '6a885ccc000ddfbb3bb9';
const apiKey = process.env.APPWRITE_SELF_HOSTED_API_KEY;
const databaseId = 'uniflow';
const bucketId = 'uniflow_assets';

if (!apiKey) {
  throw new Error('APPWRITE_SELF_HOSTED_API_KEY est requise pour provisionner Appwrite.');
}

const headers = {
  'Content-Type': 'application/json',
  'X-Appwrite-Project': projectId,
  'X-Appwrite-Key': apiKey,
};

async function request(method, path, body) {
  const response = await fetch(`${endpoint}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  const payload = text ? JSON.parse(text) : {};

  if (!response.ok && response.status !== 409) {
    throw new Error(`${method} ${path} a échoué (${response.status}) : ${payload.message || text}`);
  }

  return { status: response.status, payload };
}

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

async function ensureBucket() {
  const result = await request('POST', '/storage/buckets', {
    bucketId,
    name: 'UniFlow Assets',
    permissions: [],
    fileSecurity: true,
    enabled: true,
    maximumFileSize: 10 * 1024 * 1024,
    allowedFileExtensions: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'pdf', 'doc', 'docx', 'mp4', 'webm', 'mp3', 'wav'],
    compression: 'none',
    encryption: false,
    antivirus: true,
  });
  console.log(result.status === 201 ? 'Bucket unique UniFlow créé.' : 'Bucket unique UniFlow déjà présent.');
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

const string = (key, size, required = false, defaultValue) => ({
  type: 'string',
  body: { key, size, required, ...(defaultValue === undefined ? {} : { default: defaultValue }), array: false, encrypt: false },
});
const integer = (key, required = false, defaultValue) => ({
  type: 'integer',
  body: { key, required, ...(defaultValue === undefined ? {} : { default: defaultValue }), array: false, min: undefined, max: undefined },
});
const boolean = (key, required = false, defaultValue) => ({
  type: 'boolean',
  body: { key, required, ...(defaultValue === undefined ? {} : { default: defaultValue }), array: false },
});
const datetime = (key, required = false, defaultValue) => ({
  type: 'datetime',
  body: { key, required, ...(defaultValue === undefined ? {} : { default: defaultValue }), array: false },
});
const enumeration = (key, elements, required = false, defaultValue) => ({
  type: 'enum',
  body: { key, elements, required, ...(defaultValue === undefined ? {} : { default: defaultValue }), array: false },
});

const schemas = [
  {
    id: 'users',
    name: 'Utilisateurs UniFlow',
    attributes: [
      string('email', 255, true),
      string('name', 255, true),
      enumeration('accountType', ['UNIVERSITY', 'PERSONAL'], true),
      enumeration('role', ['STUDENT', 'DELEGATE', 'TEACHER', 'ADMIN'], false, 'STUDENT'),
      string('university', 255, false, ''),
      string('program', 100, false, ''),
      enumeration('level', ['L1'], false),
      string('country', 100, false, 'Cameroun'),
    ],
    indexes: [
      { key: 'email_unique', type: 'unique', attributes: ['email'] },
      { key: 'account_type', type: 'key', attributes: ['accountType'] },
    ],
  },
  {
    id: 'personal_subjects',
    name: 'Matières personnelles',
    attributes: [
      string('ownerId', 36, true),
      string('name', 255, true),
      string('code', 100, false, ''),
      string('title', 255, false, ''),
      string('instructor', 255, false, ''),
      integer('credits', false, 0),
      string('colorHex', 20, false, '#0d9488'),
      string('classroom', 100, false, ''),
      string('description', 5000, false, ''),
    ],
    indexes: [{ key: 'owner_subjects', type: 'key', attributes: ['ownerId'] }],
  },
  {
    id: 'personal_schedules',
    name: 'Créneaux personnels',
    attributes: [
      string('ownerId', 36, true),
      string('title', 2000, true),
      datetime('startsAt', true),
      datetime('endsAt', false),
    ],
    indexes: [
      { key: 'owner_schedules', type: 'key', attributes: ['ownerId'] },
      { key: 'schedule_start', type: 'key', attributes: ['startsAt'] },
    ],
  },
  {
    id: 'personal_tasks',
    name: 'Tâches personnelles',
    attributes: [
      string('ownerId', 36, true),
      string('title', 255, true),
      string('courseId', 36, false, ''),
      string('dueDate', 64, false, ''),
      string('description', 5000, false, ''),
      integer('priority', false, 2),
      string('status', 32, false, 'TODO'),
    ],
    indexes: [{ key: 'owner_tasks', type: 'key', attributes: ['ownerId'] }],
  },
  {
    id: 'personal_grades',
    name: 'Notes personnelles',
    attributes: [
      string('ownerId', 36, true),
      string('subjectId', 36, false, ''),
      string('courseId', 36, false, ''),
      string('label', 255, false, ''),
      string('evaluationTitle', 255, false, ''),
      string('score', 32, true),
      string('maxScore', 32, false, '20'),
      string('coefficient', 32, false, '1'),
    ],
    indexes: [{ key: 'owner_grades', type: 'key', attributes: ['ownerId'] }],
  },
  {
    id: 'forum_posts',
    name: 'Publications du forum',
    attributes: [
      string('authorId', 36, true),
      string('authorName', 255, true),
      string('role', 32, true),
      string('university', 255, false, ''),
      string('title', 255, true),
      string('content', 5000, true),
      string('category', 100, true),
      integer('rating', false, 0),
      integer('likes', false, 0),
      datetime('createdAt', false),
    ],
    indexes: [{ key: 'forum_author', type: 'key', attributes: ['authorId'] }],
  },
  {
    id: 'forum_reactions',
    name: 'Réactions du forum',
    attributes: [
      string('postId', 36, true),
      string('userId', 36, true),
      datetime('createdAt', true),
    ],
    indexes: [
      { key: 'forum_reaction_unique', type: 'unique', attributes: ['postId', 'userId'] },
      { key: 'forum_reaction_user', type: 'key', attributes: ['userId'] },
    ],
  },
  {
    id: 'contact_messages',
    name: 'Demandes de contact',
    attributes: [
      string('requesterName', 255, true),
      string('requesterEmail', 255, true),
      string('requesterUserId', 36, false, ''),
      string('subject', 160, true),
      string('message', 5000, true),
      enumeration('status', ['NEW', 'IN_PROGRESS', 'CLOSED'], true),
      datetime('createdAt', true),
      datetime('consentAt', true),
    ],
    indexes: [
      { key: 'contact_email_created', type: 'key', attributes: ['requesterEmail', 'createdAt'] },
      { key: 'contact_status_created', type: 'key', attributes: ['status', 'createdAt'] },
    ],
  },
  {
    id: 'notifications',
    name: 'Notifications UniFlow',
    attributes: [
      string('ownerId', 36, true),
      string('type', 100, true),
      string('title', 255, true),
      string('message', 5000, true),
      boolean('isRead', false, false),
      datetime('createdAt', false),
      string('courseId', 36, false, ''),
      string('scheduleId', 36, false, ''),
      string('eventKey', 160, false, ''),
    ],
    indexes: [
      { key: 'owner_notifications', type: 'key', attributes: ['ownerId'] },
      { key: 'notification_event_key', type: 'key', attributes: ['eventKey'] },
    ],
  },
  {
    id: 'chat_conversations',
    name: 'Conversations UniFlow',
    attributes: [
      string('participantA', 36, true),
      string('participantB', 36, true),
      string('lastMessage', 5000, false, ''),
      datetime('lastMessageAt', false),
    ],
    indexes: [
      { key: 'chat_participant_a', type: 'key', attributes: ['participantA'] },
      { key: 'chat_participant_b', type: 'key', attributes: ['participantB'] },
      { key: 'chat_participant_pair', type: 'unique', attributes: ['participantA', 'participantB'] },
    ],
  },
  {
    id: 'chat_messages',
    name: 'Messages UniFlow',
    attributes: [
      string('conversationId', 36, true),
      string('senderId', 36, true),
      string('body', 5000, true),
      datetime('createdAt', true),
      boolean('readByA', false, false),
      boolean('readByB', false, false),
    ],
    indexes: [
      { key: 'chat_message_conversation', type: 'key', attributes: ['conversationId'] },
      { key: 'chat_message_sender', type: 'key', attributes: ['senderId'] },
      { key: 'chat_message_created', type: 'key', attributes: ['createdAt'] },
    ],
  },
  {
    id: 'attendance_qr_tokens',
    name: 'Jetons QR de présence',
    attributes: [
      string('token', 128, true),
      string('sessionId', 36, true),
      string('courseId', 36, true),
      string('createdBy', 36, true),
      datetime('expiresAt', true),
      boolean('revoked', false, false),
    ],
    indexes: [
      { key: 'attendance_qr_token_unique', type: 'unique', attributes: ['token'] },
      { key: 'attendance_qr_session', type: 'key', attributes: ['sessionId'] },
      { key: 'attendance_qr_expiry', type: 'key', attributes: ['expiresAt'] },
    ],
  },
  {
    id: 'attendance_session_locations',
    name: 'Géorepères de séance',
    attributes: [
      string('sessionId', 36, true),
      string('latitude', 32, true),
      string('longitude', 32, true),
      integer('radiusMeters', true),
      string('createdBy', 36, true),
      datetime('createdAt', true),
    ],
    indexes: [{ key: 'session_location', type: 'unique', attributes: ['sessionId'] }],
  },
  {
    id: 'attendance_records',
    name: 'Relevés de présence',
    attributes: [
      enumeration('verificationMethod', ['MANUAL', 'QR_GEOFENCE'], false, 'MANUAL'),
      enumeration('proximityStatus', ['NOT_REQUIRED', 'VERIFIED', 'DENIED', 'UNAVAILABLE'], false, 'NOT_REQUIRED'),
      integer('proximityDistanceMeters', false, -1),
      integer('locationAccuracyMeters', false, -1),
      datetime('verifiedAt', false),
    ],
    indexes: [{ key: 'attendance_verification', type: 'key', attributes: ['verificationMethod'] }],
  },
  {
    id: 'subscription_payment_requests',
    name: 'Demandes de paiement d’abonnement',
    attributes: [
      string('userId', 36, true),
      string('reference', 64, true),
      string('planCode', 64, true),
      string('planName', 255, true),
      enumeration('billingCycle', ['MONTHLY', 'ANNUALLY'], true),
      integer('amount', true),
      enumeration('currency', ['XAF', 'EUR', 'USD'], true),
      string('fullName', 255, true),
      string('email', 255, true),
      string('phoneNumber', 64, false, ''),
      enumeration('status', ['PENDING', 'CONFIRMED', 'REJECTED', 'CANCELLED'], true),
      datetime('requestedAt', true),
      datetime('processedAt', false),
      string('processedBy', 36, false, ''),
      string('adminNote', 1000, false, ''),
    ],
    indexes: [
      { key: 'payment_request_reference', type: 'unique', attributes: ['reference'] },
      { key: 'payment_request_user_status', type: 'key', attributes: ['userId', 'status'] },
      { key: 'payment_request_requested_at', type: 'key', attributes: ['requestedAt'] },
      { key: 'payment_request_status', type: 'key', attributes: ['status'] },
    ],
  },
];

await ensureDatabase();
await ensureBucket();
for (const schema of schemas) await ensureCollection(schema);
await ensureIndependentWhatsAppPlan();
await ensurePublicSubscriptionPlanRead();
console.log('Provisionnement Appwrite UniFlow terminé.');
