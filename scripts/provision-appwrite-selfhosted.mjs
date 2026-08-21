const endpoint = (process.env.APPWRITE_SELF_HOSTED_ENDPOINT || 'https://185.181.10.106/v1').replace(/\/+$/, '');
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
      enumeration('level', ['L1', 'L2', 'L3'], false),
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
    id: 'notifications',
    name: 'Notifications UniFlow',
    attributes: [
      string('ownerId', 36, true),
      string('type', 100, true),
      string('title', 255, true),
      string('message', 5000, true),
      boolean('isRead', false, false),
      datetime('createdAt', false),
    ],
    indexes: [{ key: 'owner_notifications', type: 'key', attributes: ['ownerId'] }],
  },
];

await ensureDatabase();
await ensureBucket();
for (const schema of schemas) await ensureCollection(schema);
console.log('Provisionnement Appwrite UniFlow terminé.');
