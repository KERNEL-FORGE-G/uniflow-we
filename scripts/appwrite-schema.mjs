/**
 * Description déclarative du schéma Appwrite UniFlow.
 *
 * Ce module est la source unique : `provision-appwrite-selfhosted.mjs` s'en sert
 * pour créer ce qui manque, `verify-appwrite-schema.mjs` pour comparer l'état
 * réel du serveur à cette description. Les deux partageaient auparavant une
 * liste implicite, si bien qu'une divergence entre le schéma voulu et le schéma
 * vérifié ne pouvait pas être détectée.
 *
 * Aucune dépendance : les scripts de ce dossier doivent tourner même si
 * `node_modules` est absent ou incomplet.
 */

export const databaseId = 'uniflow'

/** Bucket historique : supports de cours, documents, médias. */
export const bucketId = 'uniflow_assets'

/**
 * Bucket dédié aux photos de profil. Lecture publique — un avatar doit
 * s'afficher dans les listes, les messages et les annuaires sans exiger de
 * session — mais écriture réservée aux comptes authentifiés. `fileSecurity`
 * fait que chaque fichier porte en plus ses propres permissions.
 *
 * L'identifiant est celui réellement présent sur le serveur
 * (`6aa81b840031e6a34dc3`) et non le nom « uniflow_avatars » : le bucket a été
 * créé depuis la console, qui attribue un identifiant aléatoire. Les
 * applications construisaient leurs URL avec le nom et recevaient un 404 à
 * chaque lecture de photo. Utiliser ici le nom ferait en plus créer un second
 * bucket, vide, que personne ne lit.
 */
export const avatarBucketId = '6aa81b840031e6a34dc3'

/**
 * Bucket des pièces jointes de discussion.
 *
 * Séparé de `uniflow_assets` : la messagerie accepte n'importe quel type de
 * fichier, alors que le bucket de supports est limité à 10 Mo et à une liste
 * fermée d'extensions — un `.zip`, un `.xlsx` ou une archive de projet y
 * étaient refusés. `fileSecurity` est actif : chaque fichier reçoit les
 * permissions de ses deux participants, et personne d'autre ne peut le lire.
 */
export const chatFilesBucketId = 'uniflow_chat_files'

/**
 * Taille maximale d'une pièce jointe de discussion.
 *
 * 30 Mo et non 50 : le serveur Appwrite refuse toute valeur supérieure à
 * `_APP_STORAGE_LIMIT`, qui vaut 30 000 000 octets par défaut — la création du
 * bucket échoue avec « Value must be a valid range between 1 and 30,000,000 ».
 * Pour autoriser 50 Mo, il faut relever cette limite dans le `.env` du serveur
 * (`_APP_STORAGE_LIMIT=52428800`) puis redémarrer Appwrite, et mettre cette
 * constante à 50 * 1024 * 1024. Le client, lui, lit la limite réelle du bucket
 * avant d'envoyer et refuse le fichier avec un message explicite.
 */
export const chatFilesMaxBytes = 30_000_000

export const bucketDefinitions = [
  {
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
  },
  {
    bucketId: chatFilesBucketId,
    name: 'UniFlow — fichiers de discussion',
    // `create("users")` est indispensable : les clients téléversent avec leur
    // propre session, pas avec une clé serveur. Sans cette permission, tout
    // envoi de pièce jointe échouerait en 401. La lecture, elle, reste régie
    // par les permissions de chaque fichier (`fileSecurity`).
    permissions: ['create("users")'],
    fileSecurity: true,
    enabled: true,
    maximumFileSize: chatFilesMaxBytes,
    // Liste vide = toutes les extensions. La limite de taille et les
    // permissions par fichier sont les seules contraintes.
    allowedFileExtensions: [],
    compression: 'none',
    encryption: false,
    antivirus: true,
  },
  {
    bucketId: avatarBucketId,
    name: 'UniFlow Avatars',
    permissions: ['read("any")', 'create("users")'],
    fileSecurity: true,
    enabled: true,
    maximumFileSize: 5 * 1024 * 1024,
    allowedFileExtensions: ['jpg', 'jpeg', 'png', 'webp'],
    compression: 'none',
    encryption: true,
    antivirus: false,
  },
]

const string = (key, size, required = false, defaultValue) => ({
  type: 'string',
  body: { key, size, required, ...(defaultValue === undefined ? {} : { default: defaultValue }), array: false, encrypt: false },
})
const integer = (key, required = false, defaultValue) => ({
  type: 'integer',
  body: { key, required, ...(defaultValue === undefined ? {} : { default: defaultValue }), array: false, min: undefined, max: undefined },
})
const boolean = (key, required = false, defaultValue) => ({
  type: 'boolean',
  body: { key, required, ...(defaultValue === undefined ? {} : { default: defaultValue }), array: false },
})
const datetime = (key, required = false, defaultValue) => ({
  type: 'datetime',
  body: { key, required, ...(defaultValue === undefined ? {} : { default: defaultValue }), array: false },
})
const float = (key, required = false, defaultValue) => ({
  type: 'float',
  body: { key, required, ...(defaultValue === undefined ? {} : { default: defaultValue }), array: false, min: undefined, max: undefined },
})
const enumeration = (key, elements, required = false, defaultValue) => ({
  type: 'enum',
  body: { key, elements, required, ...(defaultValue === undefined ? {} : { default: defaultValue }), array: false },
})

/**
 * Collections académiques : cours, emploi du temps, annuaire, notes,
 * bibliothèque et inscriptions.
 *
 * Elles étaient absentes de ce module alors que les trois applications les
 * lisent : `academic_courses` existait sur le serveur avec **zéro attribut**, et
 * `academic_schedules`, `academic_grades`, `academic_library` et
 * `academic_directory` n'existaient pas du tout. Les écrans correspondants du
 * mobile et du desktop ne pouvaient donc rien afficher, quelle que soit la
 * session — c'est la cause du « la connexion marche mais il n'y a pas de
 * données ».
 *
 * Les attributs reprennent exactement les clés lues par les modèles Flutter
 * (`AcademicCourse.fromDocument` et consorts, dans
 * `uniflow-mobile/lib/models/appwrite_models.dart`) et par le web.
 */
export const academicSchemas = [
  {
    id: 'academic_courses',
    name: 'Cours universitaires',
    attributes: [
      string('code', 32, true),
      string('name', 255, true),
      string('description', 2000, false, ''),
      string('university', 255, true),
      string('program', 255, true),
      string('level', 16, true),
      string('teacherId', 36, false, ''),
      string('teacherName', 255, false, ''),
      integer('credits', false, 0),
      integer('hours', false, 0),
      string('classroom', 64, false, ''),
      string('type', 32, false, ''),
    ],
    indexes: [
      { key: 'course_program_level', type: 'key', attributes: ['program', 'level'] },
      { key: 'course_code', type: 'key', attributes: ['code'] },
    ],
  },
  {
    id: 'academic_schedules',
    name: 'Emploi du temps',
    attributes: [
      string('courseId', 36, true),
      string('courseCode', 32, false, ''),
      string('dayOfWeek', 16, true),
      string('startTime', 8, true),
      string('endTime', 8, true),
      string('classroom', 64, false, ''),
      string('type', 32, false, ''),
    ],
    indexes: [{ key: 'schedule_day', type: 'key', attributes: ['dayOfWeek', 'startTime'] }],
  },
  {
    id: 'academic_directory',
    name: 'Annuaire académique',
    attributes: [
      string('userId', 36, true),
      string('name', 255, true),
      string('role', 32, true),
      string('university', 255, false, ''),
      string('program', 255, false, ''),
      string('level', 16, false, ''),
      string('matricule', 64, false, ''),
      string('status', 32, false, ''),
    ],
    indexes: [
      { key: 'directory_user', type: 'unique', attributes: ['userId'] },
      { key: 'directory_role', type: 'key', attributes: ['role'] },
    ],
  },
  {
    id: 'academic_grades',
    name: 'Notes académiques',
    attributes: [
      string('studentId', 36, true),
      string('courseId', 36, false, ''),
      string('courseCode', 32, false, ''),
      string('evaluationTitle', 255, true),
      string('type', 32, false, ''),
      float('score', false, 0),
      float('maxScore', false, 20),
      float('coefficient', false, 1),
    ],
    indexes: [{ key: 'grade_student', type: 'key', attributes: ['studentId', 'courseId'] }],
  },
  {
    id: 'academic_library',
    name: 'Bibliothèque académique',
    attributes: [
      string('title', 255, true),
      string('courseId', 36, false, ''),
      string('course', 255, false, ''),
      string('type', 32, false, ''),
      string('category', 64, false, ''),
      string('size', 32, false, ''),
      string('description', 2000, false, ''),
      string('fileId', 64, false, ''),
      datetime('publishedAt', false),
    ],
    indexes: [{ key: 'library_course', type: 'key', attributes: ['courseId'] }],
  },
]

/**
 * Attributs de `users` que les applications écrivent et lisent mais que le
 * schéma ne déclarait pas.
 *
 * - `avatarFileId` : identifiant du fichier dans le bucket des avatars, écrit
 *   par l'écran Paramètres du mobile et du desktop. Sans lui, le téléversement
 *   échoue avec « Unknown attribute ».
 * - `username` : déjà déclaré à part (voir [usernameAttribute]) parce qu'il
 *   exige un rétro-remplissage avant l'index unique.
 */
export const membersExtraAttributes = [string('avatarFileId', 255, false, '')]

/**
 * L'attribut `username` est volontairement absent de cette liste : il exige un
 * rétro-remplissage AVANT la création de son index unique, et Appwrite refuse un
 * attribut `required` sur une collection qui contient déjà des documents. Il est
 * donc traité à part, par `ensureUsernameIdentity()`.
 */
export const schemas = [
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
      // Identifiant du fichier dans le bucket uniflow_avatars. Vide tant que
      // l'utilisateur n'a pas téléversé de photo : les clients retombent alors
      // sur les initiales.
      string('avatarFileId', 36, false, ''),
    ],
    indexes: [
      { key: 'email_unique', type: 'unique', attributes: ['email'] },
      { key: 'account_type', type: 'key', attributes: ['accountType'] },
    ],
  },
  // Traité séparément par ensureUsernameIdentity() : attribut + index unique.
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
      // Route interne à ouvrir au tap sur la notification (« /messages?conversation=… »).
      string('link', 255, false, ''),
    ],
    indexes: [
      { key: 'owner_notifications', type: 'key', attributes: ['ownerId'] },
      { key: 'notification_event_key', type: 'key', attributes: ['eventKey'] },
    ],
  },
  {
    // Exigée par functions/messaging/src/main.js — sans elle, toute action de
    // messagerie échoue, y compris la simple liste des conversations.
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
      // Toujours renseigné, y compris pour un message qui ne porte qu'une pièce
      // jointe : l'attribut est `required`, et Appwrite n'autorise pas à le
      // rendre facultatif après coup. La Function y met alors le nom du
      // fichier, ce qui donne au passage un aperçu lisible dans la liste des
      // conversations.
      string('body', 5000, true),
      datetime('createdAt', true),
      boolean('readByA', false, false),
      boolean('readByB', false, false),
      // Pièce jointe : identifiant du fichier dans le bucket des fichiers de
      // discussion, avec sa taille et son type pour que le client puisse
      // afficher l'aperçu sans télécharger le fichier.
      string('fileId', 64, false, ''),
      string('fileName', 255, false, ''),
      integer('fileSize', false, 0),
      string('fileType', 128, false, ''),
      // « IMAGE », « FILE » ou vide : évite au client de deviner d'après le
      // type MIME, qui peut être absent.
      string('kind', 16, false, ''),
      // Un message urgent déclenche une notification chez le destinataire.
      boolean('urgent', false, false),
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
]

/**
 * Pseudo : attribut et index unique sur `users`. Déclarés à part de `schemas`
 * parce qu'ils ne peuvent pas être créés dans le même passage que le reste —
 * l'index unique doit attendre la fin du rétro-remplissage, sans quoi sa
 * création échoue sur des documents dont `username` est encore vide.
 */
export const usernameAttribute = { key: 'username', size: 32, required: false }
export const usernameIndex = { key: 'username_unique', type: 'unique', attributes: ['username'], orders: ['asc'] }

/**
 * Collections que les applications lisent mais que ce dépôt ne provisionne pas,
 * parce qu'elles sont alimentées par les Functions ou par un seed externe.
 * Elles sont tout de même vérifiées : leur absence est la cause la plus probable
 * d'un « la messagerie ne marche pas ».
 */
export const referencedCollections = ['courses', 'enrollments', 'subscription_plans']

/**
 * Tout ce que le provisionnement doit créer : les collections des applications
 * et les collections académiques, qui partagent le même contrat de permissions.
 *
 * `read("users")` est ajouté aux collections académiques : elles sont lues par
 * les trois applications avec la session de l'utilisateur, pas avec une clé
 * d'administration. Sans cette permission, un étudiant connecté reçoit une
 * liste vide alors que les documents existent — c'est exactement le symptôme
 * « la connexion marche mais il n'y a pas de données ».
 */
export const allSchemas = [
  ...schemas,
  ...academicSchemas.map((schema) => ({ ...schema, permissions: ['read("users")', 'create("users")'] })),
]

export const expectedCollections = [...new Set([...allSchemas.map((schema) => schema.id), ...referencedCollections])]
