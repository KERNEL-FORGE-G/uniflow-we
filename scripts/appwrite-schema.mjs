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

/**
 * Identifiant de la base. Les dix Functions le codent en dur (`DATABASE_ID`)
 * et les trois clients le lisent dans leur `.env` : il vaut « uniflow » partout,
 * y compris sur Appwrite Cloud. La base « uniflow-db » créée à la main dans la
 * console Cloud le 2026-09-19 n'est lue par personne.
 */
export const databaseId = 'uniflow'

/**
 * L'unique bucket du projet : supports de cours, rendus, photos de profil et
 * pièces jointes de discussion.
 *
 * Le plan gratuit d'Appwrite Cloud (`tier-0`) n'autorise qu'**un seul bucket**
 * — la création d'un second répond « The maximum number of buckets allowed for
 * the selected plan has reached ». Les trois buckets de l'ancien serveur
 * (`uniflow_assets`, `uniflow_chat_files`, avatars) sont donc fusionnés en un,
 * et la séparation des usages repose entièrement sur `fileSecurity` : chaque
 * fichier porte ses propres permissions. Un avatar est déposé avec
 * `read("any")` (c'est déjà ce que font les trois clients et `team-roster`),
 * une pièce jointe avec les deux participants seulement, un rendu de devoir
 * avec l'élève et l'enseignant. Le bucket lui-même n'accorde **aucune**
 * lecture : lui donner `read("any")` rendrait chaque pièce jointe publique.
 */
export const bucketId = 'uniflow_assets'

/** Alias conservés : tout pointe désormais sur le même bucket. */
export const avatarBucketId = bucketId
export const chatFilesBucketId = bucketId

/**
 * Taille maximale d'un fichier.
 *
 * 50 000 000 octets : c'est le plafond par fichier du plan gratuit d'Appwrite
 * Cloud (`fileSize: 50`). L'ancien serveur auto-hébergé refusait tout au-dessus
 * de 30 000 000 (`_APP_STORAGE_LIMIT`), d'où la valeur précédente. Le client
 * lit la limite réelle du bucket avant d'envoyer et refuse le fichier avec un
 * message explicite, donc cette constante n'a pas à être recopiée côté Flutter.
 */
export const chatFilesMaxBytes = 50_000_000

export const bucketDefinitions = [
  {
    bucketId,
    name: 'UniFlow — fichiers',
    // `create("users")` est indispensable : les clients téléversent avec leur
    // propre session, pas avec une clé serveur. Sans cette permission, tout
    // envoi échouerait en 401. La lecture, elle, reste régie par les
    // permissions de chaque fichier (`fileSecurity`).
    permissions: ['create("users")'],
    fileSecurity: true,
    enabled: true,
    maximumFileSize: chatFilesMaxBytes,
    // Liste vide = toutes les extensions : la messagerie accepte n'importe
    // quel type de fichier (`.zip`, `.xlsx`, archives de projet…).
    allowedFileExtensions: [],
    compression: 'none',
    // Appwrite ne chiffre pas les fichiers de plus de 20 Mo : laisser le
    // chiffrement actif produirait un bucket au comportement inégal.
    encryption: false,
    antivirus: true,
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
 * Niveaux d'études admis pour un compte universitaire.
 *
 * Limités à la Licence à l'origine (périmètre ICT4D), puis étendus au Master :
 * les emplois du temps 2026-2027 de la Faculté des Sciences chargés dans
 * `academic_courses` comportent des M1 (PHY, MAT, INF, GEO, CHM, MIB, BOA,
 * BOV, BCH), et un étudiant de M1 ne pouvait pas s'inscrire tant que
 * `users.level` refusait cette valeur.
 */
export const academicLevels = ['L1', 'L2', 'L3', 'M1', 'M2']

/** Les quatre rôles lus par les trois clients et vérifiés par les Functions. */
export const userRoles = ['STUDENT', 'DELEGATE', 'TEACHER', 'ADMIN']

/**
 * Types de compte.
 *
 * `PLATFORM` est réservé à l'administrateur de la plateforme (label
 * `superadmin`, `kernel@forge.codes`) : il n'appartient à aucune université,
 * faculté ni filière, contrairement à un compte `UNIVERSITY` qui porte toujours
 * un périmètre. Le compte était jusque-là déclaré `UNIVERSITY` / UY1 / ICT4D /
 * L1, ce qui restreignait ses écrans d'administration à cette seule filière.
 */
export const accountTypes = ['UNIVERSITY', 'PERSONAL', 'PLATFORM']

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
      // Périmètre recopié depuis le cours. Sans lui, afficher l'emploi du temps
      // d'une filière obligeait à lister ses cours puis à interroger les séances
      // par lot d'identifiants — et le web se rabattait sur « ICT4D / L1 » codé
      // en dur, ne montrant qu'une filière sur les douze chargées. Optionnels
      // pour que les séances déjà présentes restent valides ; le seed du
      // référentiel les rétro-remplit.
      string('university', 255, false, ''),
      string('program', 100, false, ''),
      string('level', 16, false, ''),
      string('courseName', 255, false, ''),
      string('teacherName', 255, false, ''),
      // « G1 », « G2 »… quand la séance ne concerne qu'un groupe de TD/TP.
      string('group', 32, false, ''),
      string('semester', 8, false, ''),
      string('academicYear', 16, false, ''),
    ],
    indexes: [
      { key: 'schedule_day', type: 'key', attributes: ['dayOfWeek', 'startTime'] },
      { key: 'schedule_program_level', type: 'key', attributes: ['program', 'level'] },
      { key: 'schedule_course', type: 'key', attributes: ['courseId'] },
    ],
  },
  {
    id: 'academic_directory',
    name: 'Annuaire académique',
    attributes: [
      string('userId', 36, true),
      string('name', 255, true),
      string('role', 32, true),
      string('university', 255, false, ''),
      string('faculty', 255, false, ''),
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
  {
    // Lue par cinq Functions (`academic-registration`, `academic-grades`,
    // `attendance-secure`, `admin-directory`, `notification-alerts`), par le
    // web et par le desktop — mais jamais provisionnée par ce module : elle
    // répondait 404 sur l'ancien serveur, et la Function d'inscription
    // échouait donc à rattacher un étudiant à ses cours.
    id: 'academic_enrollments',
    name: 'Inscriptions aux cours',
    attributes: [
      string('studentId', 36, true),
      string('courseId', 64, true),
      string('status', 32, false, 'ACTIVE'),
    ],
    indexes: [
      { key: 'enrollment_student', type: 'key', attributes: ['studentId'] },
      { key: 'enrollment_course', type: 'key', attributes: ['courseId'] },
      { key: 'enrollment_student_course', type: 'unique', attributes: ['studentId', 'courseId'] },
    ],
  },
  {
    // Deux modèles cohabitent dans cette collection : le web et le mobile
    // lisent un devoir « par étudiant » (`studentId`, `grade`, `submittedAt`…),
    // le desktop un énoncé publié une fois par l'enseignant (`teacherId`,
    // `type`, `quizJson`, `audience`…) dont les rendus vont dans
    // `academic_submissions`. Le schéma porte l'union des deux, tout en
    // facultatif hormis le titre et le cours, pour qu'aucun des trois clients
    // ne soit refusé à l'écriture.
    id: 'academic_assignments',
    name: 'Devoirs',
    attributes: [
      string('courseId', 64, true),
      string('courseCode', 64, false, ''),
      string('title', 255, true),
      string('description', 3000, false, ''),
      string('dueDate', 64, true),
      string('status', 32, false, 'À rendre'),
      // Modèle « par étudiant » (web, mobile).
      string('studentId', 36, false, ''),
      string('grade', 32, false, ''),
      string('feedback', 2000, false, ''),
      string('submittedAt', 64, false, ''),
      string('submittedFile', 255, false, ''),
      string('submissionNote', 1000, false, ''),
      // Modèle « énoncé publié » (desktop).
      string('teacherId', 36, false, ''),
      string('teacherName', 255, false, ''),
      string('type', 32, false, ''),
      string('publishedAt', 64, false, ''),
      float('maxScore', false, 20),
      boolean('allowLate', false, false),
      string('quizJson', 20000, false, ''),
      string('fileId', 64, false, ''),
      string('fileName', 255, false, ''),
      string('audience', 1000, false, ''),
    ],
    indexes: [
      { key: 'assignment_student', type: 'key', attributes: ['studentId'] },
      { key: 'assignment_course', type: 'key', attributes: ['courseId'] },
      { key: 'assignment_teacher', type: 'key', attributes: ['teacherId'] },
    ],
  },
  {
    // Rendus d'élèves, un document par élève et par devoir (desktop). Le
    // desktop la lit et l'écrit depuis `9b72a37`, elle n'existait nulle part.
    id: 'academic_submissions',
    name: 'Rendus de devoirs',
    attributes: [
      string('assignmentId', 36, true),
      string('studentId', 36, true),
      string('studentName', 255, false, ''),
      string('submittedAt', 64, true),
      string('answersJson', 20000, false, ''),
      string('fileId', 64, false, ''),
      string('fileName', 255, false, ''),
      float('score', false),
      string('feedback', 5000, false, ''),
      string('status', 32, false, 'SUBMITTED'),
      string('gradedAt', 64, false, ''),
    ],
    indexes: [
      { key: 'submission_assignment', type: 'key', attributes: ['assignmentId'] },
      { key: 'submission_student', type: 'key', attributes: ['studentId'] },
      { key: 'submission_unique', type: 'unique', attributes: ['assignmentId', 'studentId'] },
    ],
  },
  {
    // Séances d'appel, créées par la Function `attendance-secure` et lues par
    // le web et le desktop. Absente de ce module jusqu'ici.
    id: 'attendance_sessions',
    name: 'Séances de présence',
    attributes: [
      string('courseId', 64, true),
      datetime('date', true),
      string('createdBy', 36, false, ''),
    ],
    indexes: [{ key: 'attendance_session_course', type: 'key', attributes: ['courseId'] }],
  },
]

/**
 * Formules d'abonnement et état de souscription — lus par la page tarifaire
 * du web (sans session, d'où `read("any")` sur les formules) et écrits par la
 * Function `subscription-payments`. Ils étaient créés par un ancien script de
 * démonstration et jamais décrits ici : la sonde les signalait donc « lus mais
 * non provisionnés ».
 */
export const subscriptionSchemas = [
  {
    id: 'subscription_plans',
    name: 'Formules UniFlow',
    attributes: [
      string('code', 64, true),
      string('name', 255, true),
      enumeration('category', ['PERSONAL', 'TEACHER', 'INSTITUTION', 'ACADEMIC'], true),
      string('countryCode', 8, true),
      enumeration('currency', ['XAF', 'EUR', 'USD'], true),
      integer('priceMonthlyAmount', true),
      integer('priceAnnuallyAmount', true),
      string('period', 64, false, 'Accès académique'),
      string('badge', 100, false, ''),
      boolean('highlight', false, false),
      string('description', 5000, true),
      string('providers', 500, false, '[]'),
      // Avantages affichés sous le prix, en JSON (`["…", "…"]`) comme
      // `providers`. Ils vivaient en dur dans `PricingPage.tsx` et
      // `SubscriptionFlowPage.tsx` : la base servait le prix, le code servait le
      // reste, et une formule ajoutée en base s'affichait sans aucun avantage.
      string('features', 3000, false, '[]'),
      // Ordre d'affichage sur la page tarifaire (croissant). Sans lui, l'ordre
      // était celui de création des documents, qui change à chaque re-seed.
      integer('sortOrder', false, 0),
      string('status', 32, true),
    ],
    indexes: [
      { key: 'subscription_plan_code', type: 'unique', attributes: ['code'] },
      { key: 'subscription_plan_status', type: 'key', attributes: ['status'] },
    ],
    permissions: ['read("any")'],
  },
  {
    id: 'subscription_statuses',
    name: 'Statuts de souscription',
    attributes: [
      string('userId', 36, true),
      enumeration('status', ['NONE', 'ACTIVE'], true),
      string('planCode', 64, false, ''),
      string('countryCode', 8, false, 'CM'),
      enumeration('currency', ['XAF', 'EUR', 'USD'], false, 'XAF'),
      integer('monthlyAmount', false, 0),
      datetime('currentPeriodEnd', false),
      boolean('isAutoRenew', false, false),
    ],
    indexes: [{ key: 'subscription_status_user', type: 'unique', attributes: ['userId'] }],
  },
]

/**
 * Clés de couleur des pastilles de l'équipe.
 *
 * Ce sont des **clés** (« blue », « purple »…) et non des classes CSS ou des
 * codes hexadécimaux : le web les traduit en classes Tailwind, les deux clients
 * Flutter en couleurs. Stocker `bg-purple-100 text-purple-800` en base aurait
 * lié le schéma à Tailwind, et un code hexadécimal n'aurait pas su rendre le
 * fond, le texte et la bordure que la page utilise.
 */
export const teamAccents = ['blue', 'purple', 'emerald', 'amber', 'rose', 'cyan', 'indigo']

/**
 * Équipe KERNEL FORGE — les développeurs présentés sur la page publique
 * `/teams`.
 *
 * Cette liste vivait en dur dans `src/pages/TeamsPage.tsx`, et chaque client en
 * portait sa propre copie : **9 membres sur le web, 6 sur le mobile, 4 sur le
 * desktop**. Les trois pages affichaient donc trois équipes différentes, et
 * changer un membre demandait de redéployer trois applications. Elle est
 * désormais en base, lue par les trois, et modifiable depuis l'administration
 * du web.
 */
export const teamSchema = {
  id: 'team_members',
  name: 'Équipe KERNEL FORGE',
  attributes: [
    // Clé stable reprise des `id` de l'ancienne liste en dur : elle permet au
    // seed d'être idempotent sans dépendre de l'identifiant Appwrite.
    string('slug', 64, true),
    string('name', 255, true),
    string('github', 100, false, ''),
    string('email', 255, false, ''),
    enumeration('team', ['Leadership', 'Frontend', 'Backend'], true),
    string('subTeam', 255, false, ''),
    string('role', 255, true),
    string('badge', 64, false, ''),
    enumeration('accent', teamAccents, false, 'blue'),
    // Fichier du bucket des avatars. Vide tant que l'administration n'a pas
    // téléversé de photo : les trois clients affichent alors une silhouette
    // neutre, jamais une image portant des initiales.
    string('avatarFileId', 36, false, ''),
    integer('displayOrder', false, 0),
    // Demande du propriétaire (2026-09-20) : la page Équipe présente une bio
    // courte et des liens ; sans ces attributs, les cartes n'avaient que le poste.
    string('bio', 600, false, ''),
    string('linkedin', 255, false, ''),
    string('website', 255, false, ''),
  ],
  indexes: [
    { key: 'team_slug', type: 'unique', attributes: ['slug'] },
    { key: 'team_order', type: 'key', attributes: ['displayOrder'] },
  ],
  // La page `/teams` du web est publique, sans session : `read("any")` est la
  // seule permission dont les trois clients ont besoin. Aucune écriture n'est
  // ouverte au niveau collection — les documents sont créés, modifiés et
  // supprimés par la Function `team-roster`, qui vérifie que l'appelant est
  // ADMIN. Accorder `create("users")` ici laisserait n'importe quel étudiant
  // connecté effacer la page publique de l'équipe.
  permissions: ['read("any")'],
}

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
      enumeration('accountType', accountTypes, true),
      enumeration('role', userRoles, false, 'STUDENT'),
      string('university', 255, false, ''),
      // Une université a plusieurs facultés ; l'administration en gère une, et
      // l'inscription descend université → faculté → filière → niveau.
      string('faculty', 255, false, ''),
      string('program', 100, false, ''),
      // La filière ICT de l'UY1 va de la Licence 1 à la Licence 3 : le schéma
      // n'admettait que `L1`, si bien qu'un compte L2 ou L3 aurait été refusé
      // dès que l'énumération aurait été réellement appliquée par le serveur.
      enumeration('level', academicLevels, false),
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
      // Cœur du relevé — ces quatre attributs n'étaient déclarés que dans un
      // ancien script de démonstration ; ce module ne portait que les champs
      // de vérification ajoutés ensuite, et une base provisionnée depuis lui
      // seul aurait refusé tout enregistrement de présence.
      string('sessionId', 64, true),
      string('courseId', 64, true),
      string('studentId', 36, true),
      enumeration('status', ['PRESENT', 'ABSENT', 'RETARD', 'JUSTIFIE'], true),
      enumeration('verificationMethod', ['MANUAL', 'QR_GEOFENCE'], false, 'MANUAL'),
      enumeration('proximityStatus', ['NOT_REQUIRED', 'VERIFIED', 'DENIED', 'UNAVAILABLE'], false, 'NOT_REQUIRED'),
      integer('proximityDistanceMeters', false, -1),
      integer('locationAccuracyMeters', false, -1),
      datetime('verifiedAt', false),
    ],
    indexes: [
      { key: 'attendance_record_student', type: 'key', attributes: ['studentId'] },
      { key: 'attendance_record_session', type: 'key', attributes: ['sessionId'] },
      { key: 'attendance_verification', type: 'key', attributes: ['verificationMethod'] },
    ],
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
      // Université / faculté déclarée par le client. Le formulaire de
      // souscription la demandait déjà mais ne l'envoyait pas : l'administration
      // devait la redemander sur WhatsApp pour rattacher le paiement.
      string('institution', 255, false, ''),
      // Canal par lequel le client règle : la facturation passe par le
      // WhatsApp +237 657 635 644 (consigne du 2026-09-20), pas de paiement en ligne.
      string('channel', 32, false, 'WHATSAPP'),
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
 * Collections que les applications lisent mais que ce dépôt ne provisionne pas.
 *
 * Vide depuis le passage à Appwrite Cloud : `courses` et `enrollments`, qui y
 * figuraient, n'étaient lues par aucun client ni aucune Function (les noms
 * réels sont `academic_courses` et `academic_enrollments`), et leur absence
 * faisait échouer la sonde avant tout le reste. `subscription_plans` est
 * désormais décrite dans [subscriptionSchemas]. La liste est conservée pour que
 * la sonde continue de fonctionner si une dépendance externe réapparaît.
 */
export const referencedCollections = []

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
/**
 * Référentiel académique : universités, facultés, filières (avec leurs
 * niveaux) et salles.
 *
 * Demande du propriétaire (2026-09-20) : les listes des formulaires
 * d'inscription et des vues d'administration doivent **venir de la base**,
 * plus jamais d'un tableau codé en dur dans un client — les trois applications
 * lisaient chacune leur propre liste et ne proposaient que « Université de
 * Yaoundé I / ICT4D / L1 ». Ces collections sont lisibles **sans session**
 * (`read("any")`) : le formulaire d'inscription les consulte avant qu'un compte
 * existe. Elles ne s'écrivent qu'avec la clé serveur (seeds, Functions).
 */
export const referenceSchemas = [
  {
    id: 'universities',
    name: 'Universités',
    attributes: [
      string('code', 32, true),
      string('name', 255, true),
      string('shortName', 64, false, ''),
      string('city', 128, false, ''),
      string('country', 128, false, 'Cameroun'),
      string('website', 255, false, ''),
      boolean('active', false, true),
    ],
    indexes: [{ key: 'university_code', type: 'unique', attributes: ['code'] }],
    permissions: ['read("any")'],
  },
  {
    id: 'faculties',
    name: 'Facultés et établissements',
    attributes: [
      string('universityCode', 32, true),
      string('code', 32, true),
      string('name', 255, true),
      boolean('active', false, true),
    ],
    indexes: [
      { key: 'faculty_university', type: 'key', attributes: ['universityCode'] },
      { key: 'faculty_code', type: 'unique', attributes: ['universityCode', 'code'] },
    ],
    permissions: ['read("any")'],
  },
  {
    id: 'academic_programs',
    name: 'Filières',
    attributes: [
      string('universityCode', 32, true),
      string('facultyCode', 32, true),
      // Code court utilisé par `users.program`, `academic_courses.program`
      // et les emplois du temps (« ICT4D », « PHYS », « ENR »…).
      string('code', 32, true),
      string('name', 255, true),
      // Niveaux ouverts, séparés par des virgules (« L1,L2,L3 » ou « M1,M2 ») :
      // un attribut tableau compliquerait les requêtes des clients Flutter.
      string('levels', 64, true),
      string('description', 1000, false, ''),
      boolean('active', false, true),
    ],
    indexes: [
      { key: 'program_university', type: 'key', attributes: ['universityCode', 'facultyCode'] },
      { key: 'program_code', type: 'unique', attributes: ['universityCode', 'code'] },
    ],
    permissions: ['read("any")'],
  },
  {
    id: 'classrooms',
    name: 'Salles',
    attributes: [
      string('universityCode', 32, true),
      string('facultyCode', 32, false, ''),
      string('code', 32, true),
      string('name', 255, false, ''),
      // « AMPHI », « SALLE », « LABO », « TD »… libre, pour les filtres.
      string('kind', 32, false, 'SALLE'),
      integer('capacity', false, 0),
      string('building', 128, false, ''),
      boolean('active', false, true),
    ],
    indexes: [
      { key: 'classroom_university', type: 'key', attributes: ['universityCode'] },
      { key: 'classroom_code', type: 'unique', attributes: ['universityCode', 'code'] },
    ],
    permissions: ['read("any")'],
  },
]

/**
 * Mesure d'audience maison (demande du propriétaire du 2026-09-21 : « un
 * véritable système de métriques pour voir le nombre de visiteurs »), sans
 * service tiers — uniquement Appwrite.
 *
 * - `site_visits` : une ligne par session de visite (visiteur anonyme,
 *   plateforme, type d'appareil, première page, provenance). C'est ce que
 *   l'administration lit pour « qui visite depuis le mobile, le desktop… ».
 * - `site_metrics_daily` : un document par jour (`$id` = AAAA-MM-JJ) avec les
 *   compteurs cumulés. Appwrite plafonne `total` à 5 000 sur une liste : les
 *   totaux affichés sur la landing se calculent donc en sommant ces documents
 *   (au plus 365 par an), jamais en comptant les lignes brutes.
 *
 * Aucune permission client : seul le service `/metrics` de la Function écrit
 * et lit, avec la clé serveur. L'identifiant du visiteur est un UUID tiré par
 * le client et gardé en local ; il ne permet pas de retrouver une personne.
 */
export const visitPlatforms = ['web', 'mobile', 'desktop']
export const visitDevices = ['mobile', 'tablet', 'desktop', 'other']
export const metricsSchemas = [
  {
    id: 'site_visits',
    name: 'Audience — visites',
    attributes: [
      string('visitorId', 36, true),
      enumeration('platform', visitPlatforms, true),
      enumeration('device', visitDevices, true),
      string('day', 10, true),
      string('path', 255, false, '/'),
      string('referrer', 255, false, ''),
      string('browser', 64, false, ''),
      string('os', 64, false, ''),
      string('language', 16, false, ''),
      boolean('authenticated', false, false),
      integer('pageViews', false, 1),
    ],
    indexes: [
      { key: 'visit_day', type: 'key', attributes: ['day'] },
      { key: 'visit_visitor_day', type: 'key', attributes: ['visitorId', 'day'] },
      { key: 'visit_platform', type: 'key', attributes: ['platform'] },
      { key: 'visit_device', type: 'key', attributes: ['device'] },
    ],
    permissions: [],
  },
  {
    id: 'site_metrics_daily',
    name: 'Audience — compteurs journaliers',
    attributes: [
      string('day', 10, true),
      integer('visits', false, 0),
      integer('uniqueVisitors', false, 0),
      integer('pageViews', false, 0),
      integer('authenticated', false, 0),
      integer('deviceMobile', false, 0),
      integer('deviceTablet', false, 0),
      integer('deviceDesktop', false, 0),
      integer('deviceOther', false, 0),
      integer('platformWeb', false, 0),
      integer('platformMobile', false, 0),
      integer('platformDesktop', false, 0),
    ],
    indexes: [{ key: 'metrics_day', type: 'unique', attributes: ['day'] }],
    permissions: [],
  },
]

export const allSchemas = [
  ...schemas,
  ...academicSchemas.map((schema) => ({ ...schema, permissions: ['read("users")', 'create("users")'] })),
  ...subscriptionSchemas,
  ...referenceSchemas,
  ...metricsSchemas,
  teamSchema,
]

export const expectedCollections = [...new Set([...allSchemas.map((schema) => schema.id), ...referencedCollections])]
