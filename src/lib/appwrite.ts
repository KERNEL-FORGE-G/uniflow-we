import { Account, Client, Databases, Functions, ID, Models, Permission, Query, Role } from 'appwrite'
import { readSessionSnapshot } from './sessionPersistence'

// L’instance Appwrite UniFlow est servie par le domaine TLS certifié du VPS.
// Une valeur Vercel historique (IP brute ou xip.com) ne peut jamais remplacer
// le domaine certifié tant que les environnements n’ont pas été mis à jour.
const CERTIFIED_APPWRITE_ENDPOINT = 'https://appwrite.kernelforge.codes/v1'
const configuredEndpoint = String(import.meta.env.VITE_APPWRITE_ENDPOINT || '').replace(/\/+$/, '')
const endpoint = /185\.181\.10\.106|eu-fr-cloud-xip\.com/i.test(configuredEndpoint)
  ? CERTIFIED_APPWRITE_ENDPOINT
  : (configuredEndpoint || CERTIFIED_APPWRITE_ENDPOINT)
const projectId = String(import.meta.env.VITE_APPWRITE_PROJECT_ID || '6a885ccc000ddfbb3bb9')
export const APPWRITE_ENDPOINT = endpoint
export const APPWRITE_PROJECT_ID = projectId
export const APPWRITE_DATABASE_ID = String(import.meta.env.VITE_APPWRITE_DATABASE_ID || 'uniflow')
export const APPWRITE_BUCKET_ID = String(import.meta.env.VITE_APPWRITE_STORAGE_BUCKET_ID || 'uniflow_assets')
// Les Functions Appwrite auto-hébergées peuvent nécessiter un démarrage à
// froid supérieur à 12 secondes. Le délai client reste borné, mais couvre
// l’inscription académique et les appels sécurisés sans faux échec partiel.
const APPWRITE_TIMEOUT_MS = 35_000

export const appwriteClient = new Client().setEndpoint(endpoint).setProject(projectId)
export const appwriteAccount = new Account(appwriteClient)
export const appwriteDatabases = new Databases(appwriteClient)
export const appwriteFunctions = new Functions(appwriteClient)
export const APPWRITE_ATTENDANCE_FUNCTION_ID = String(import.meta.env.VITE_APPWRITE_ATTENDANCE_FUNCTION_ID || 'attendance_secure')

function normalizeAppwriteFailure(error: unknown, operation: string): Error {
  const message = error instanceof Error ? error.message : String(error || '')
  if (/failed to fetch|networkerror|err_cert_authority_invalid|certificate/i.test(message)) {
    return new Error(`La connexion sécurisée à Appwrite KERNEL FORGE a été refusée pendant ${operation}. Le certificat TLS du domaine Appwrite doit être reconnu par le navigateur avant de pouvoir lire ou enregistrer des données.`)
  }
  return error instanceof Error ? error : new Error(`Appwrite KERNEL FORGE a échoué pendant ${operation}.`)
}

async function awaitAppwrite<T>(promise: Promise<T>, operation: string): Promise<T> {
  let timeout: ReturnType<typeof setTimeout> | undefined
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timeout = setTimeout(() => reject(new Error(`Appwrite KERNEL FORGE ne répond pas pour ${operation}. Vérifiez l’endpoint configuré puis réessayez.`)), APPWRITE_TIMEOUT_MS)
      }),
    ])
  } catch (error) {
    throw normalizeAppwriteFailure(error, operation)
  } finally {
    if (timeout) clearTimeout(timeout)
  }
}

export type AttendanceSecureRequest = {
  action: 'issue' | 'revoke' | 'scan' | 'audit' | 'roll'
  sessionId?: string
  courseId?: string
  token?: string
  origin?: { latitude: number; longitude: number; accuracy: number }
  position?: { latitude: number; longitude: number; accuracy: number }
  radiusMeters?: number
  date?: string
  rows?: Array<{ studentId: string; status: 'PRESENT' | 'ABSENT' | 'RETARD' | 'JUSTIFIE' }>
}

export type AttendanceSecureResponse = {
  ok: boolean
  code?: string
  message?: string
  token?: string
  sessionId?: string
  courseId?: string
  date?: string
  expiresAt?: string
  radiusMeters?: number
  recordId?: string
  idempotent?: boolean
  distanceMeters?: number
  accuracyMeters?: number
  revoked?: boolean
  healthy?: boolean
  checkedAt?: string
  collections?: Record<string, number>
  duplicates?: Record<string, number>
  orphaned?: Record<string, number>
  invalidRecords?: number
  action?: string
  created?: number
  updated?: number
}

export async function executeAttendanceSecureAction(payload: AttendanceSecureRequest): Promise<AttendanceSecureResponse> {
  const execution = await awaitAppwrite(
    appwriteFunctions.createExecution(APPWRITE_ATTENDANCE_FUNCTION_ID, JSON.stringify(payload), false),
    'le contrôle sécurisé de présence',
  )
  let response: AttendanceSecureResponse
  try { response = JSON.parse(execution.responseBody || '{}') as AttendanceSecureResponse } catch {
    throw new Error('La Function Appwrite de présence a retourné une réponse invalide.')
  }
  if (execution.responseStatusCode >= 400 || !response.ok) {
    throw new Error(response.message || 'La Function Appwrite a refusé le contrôle de présence.')
  }
  return response
}

export type AdminDirectoryRequest = {
  action: 'create' | 'update' | 'delete' | 'list'
  userId?: string
  name?: string
  email?: string
  currentEmail?: string
  password?: string
  role?: UniFlowRole
  matricule?: string
  status?: string
}

export type AdminDirectoryEntry = {
  userId: string
  name: string
  role: UniFlowRole
  matricule: string
  status: string
  email: string
}

export type AdminDirectoryResponse = {
  ok: boolean
  code?: string
  message?: string
  action?: string
  userId?: string
  directoryId?: string
  profileId?: string
  email?: string
  name?: string
  role?: UniFlowRole
  status?: string
  collection?: string
  entries?: AdminDirectoryEntry[]
}

export const APPWRITE_ADMIN_DIRECTORY_FUNCTION_ID = String(import.meta.env.VITE_APPWRITE_ADMIN_DIRECTORY_FUNCTION_ID || 'admin_directory')

export async function executeAdminDirectoryAction(payload: AdminDirectoryRequest): Promise<AdminDirectoryResponse> {
  const execution = await awaitAppwrite(
    appwriteFunctions.createExecution(APPWRITE_ADMIN_DIRECTORY_FUNCTION_ID, JSON.stringify(payload), false),
    'la gestion sécurisée des comptes',
  )
  let response: AdminDirectoryResponse
  try { response = JSON.parse(execution.responseBody || '{}') as AdminDirectoryResponse } catch {
    throw new Error('La Function Appwrite de gestion des comptes a retourné une réponse invalide.')
  }
  if (execution.responseStatusCode >= 400 || !response.ok) {
    throw new Error(response.message || 'La Function Appwrite a refusé la gestion du compte.')
  }
  return response
}

export type AcademicRegistrationResponse = {
  ok: boolean
  code?: string
  message?: string
  action?: 'provision'
  directoryCreated?: boolean
  enrollmentsCreated?: number
  totalCourses?: number
}

export const APPWRITE_ACADEMIC_REGISTRATION_FUNCTION_ID = String(import.meta.env.VITE_APPWRITE_ACADEMIC_REGISTRATION_FUNCTION_ID || 'academic_registration')

export async function provisionAcademicRegistration(matricule?: string): Promise<AcademicRegistrationResponse> {
  const execution = await awaitAppwrite(
    appwriteFunctions.createExecution(APPWRITE_ACADEMIC_REGISTRATION_FUNCTION_ID, JSON.stringify({ action: 'provision', matricule: matricule || '' }), false),
    'le raccordement académique de l’inscription',
  )
  let response: AcademicRegistrationResponse
  try { response = JSON.parse(execution.responseBody || '{}') as AcademicRegistrationResponse } catch {
    throw new Error('La Function Appwrite de raccordement académique a retourné une réponse invalide.')
  }
  if (execution.responseStatusCode >= 400 || !response.ok) {
    throw new Error(response.message || 'Le raccordement académique Appwrite a été refusé.')
  }
  return response
}

export type AcademicGradeMutation = {
  action: 'roster' | 'upsert' | 'delete'
  courseId: string
  studentId?: string
  gradeId?: string
  evaluationTitle?: string
  type?: string
  score?: number
  maxScore?: number
  coefficient?: number
}

export type AcademicGradeEntry = {
  id: string
  studentId: string
  courseId: string
  courseCode: string
  evaluationTitle: string
  type: string
  score: number
  maxScore: number
  coefficient: number
}

export type AcademicGradeRoster = {
  ok: boolean
  code?: string
  message?: string
  action?: 'roster' | 'upsert' | 'delete'
  course?: { id: string; code: string; name: string }
  students?: Array<{ userId: string; name: string; matricule: string; role: 'STUDENT' | 'DELEGATE' }>
  grades?: AcademicGradeEntry[]
  grade?: AcademicGradeEntry
  gradeId?: string
}

export const APPWRITE_ACADEMIC_GRADES_FUNCTION_ID = String(import.meta.env.VITE_APPWRITE_ACADEMIC_GRADES_FUNCTION_ID || 'academic_grades')

export async function executeAcademicGradesAction(payload: AcademicGradeMutation): Promise<AcademicGradeRoster> {
  const execution = await awaitAppwrite(
    appwriteFunctions.createExecution(APPWRITE_ACADEMIC_GRADES_FUNCTION_ID, JSON.stringify(payload), false),
    'la gestion sécurisée des notes',
  )
  let response: AcademicGradeRoster
  try { response = JSON.parse(execution.responseBody || '{}') as AcademicGradeRoster } catch {
    throw new Error('La Function Appwrite de notes a retourné une réponse invalide.')
  }
  if (execution.responseStatusCode >= 400 || !response.ok) {
    throw new Error(response.message || 'La Function Appwrite a refusé la gestion des notes.')
  }
  return response
}

export type MessagingRequest = {
  action: 'list' | 'open' | 'send' | 'read'
  email?: string
  conversationId?: string
  text?: string
}

export type MessagingConversation = {
  id: string
  name: string
  role: UniFlowRole
  email: string
  online: boolean
  time: string
  preview: string
  unread: number
  messages: Array<{ id: string; from: 'me' | 'them'; text: string; time: string; senderId: string }>
}

export type MessagingResponse = {
  ok: boolean
  code?: string
  message?: string
  action?: 'list' | 'open' | 'send' | 'read'
  conversations?: MessagingConversation[]
  conversation?: MessagingConversation
  conversationId?: string
  markedRead?: number
}

export const APPWRITE_MESSAGING_FUNCTION_ID = String(import.meta.env.VITE_APPWRITE_MESSAGING_FUNCTION_ID || 'messaging')

export async function executeMessagingAction(payload: MessagingRequest): Promise<MessagingResponse> {
  const execution = await awaitAppwrite(
    appwriteFunctions.createExecution(APPWRITE_MESSAGING_FUNCTION_ID, JSON.stringify(payload), false),
    'la messagerie sécurisée',
  )
  let response: MessagingResponse
  try { response = JSON.parse(execution.responseBody || '{}') as MessagingResponse } catch {
    throw new Error('La Function Appwrite de messagerie a retourné une réponse invalide.')
  }
  if (execution.responseStatusCode >= 400 || !response.ok) {
    throw new Error(response.message || 'La Function Appwrite a refusé la messagerie.')
  }
  return response
}

export type SubscriptionPaymentRequest = {
  action: 'create' | 'list' | 'admin-list' | 'review'
  planCode?: string
  billingCycle?: 'MONTHLY' | 'ANNUALLY'
  fullName?: string
  email?: string
  phoneNumber?: string
  status?: 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED'
  requestId?: string
  decision?: 'CONFIRMED' | 'REJECTED'
  adminNote?: string
}

export type SubscriptionPaymentRecord = {
  id: string
  userId: string
  reference: string
  planCode: string
  planName: string
  billingCycle: 'MONTHLY' | 'ANNUALLY'
  amount: number
  currency: 'XAF' | 'EUR' | 'USD'
  fullName: string
  email: string
  phoneNumber: string
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED'
  requestedAt: string
  processedAt?: string | null
  processedBy?: string | null
  adminNote?: string
  whatsappUrl?: string
}

export type SubscriptionPaymentResponse = {
  ok: boolean
  code?: string
  message?: string
  action?: SubscriptionPaymentRequest['action']
  request?: SubscriptionPaymentRecord
  requests?: SubscriptionPaymentRecord[]
  idempotent?: boolean
  subscriptionStatusId?: string | null
}

export const APPWRITE_SUBSCRIPTION_PAYMENTS_FUNCTION_ID = String(import.meta.env.VITE_APPWRITE_SUBSCRIPTION_PAYMENTS_FUNCTION_ID || 'subscription_payments')

export async function executeSubscriptionPaymentAction(payload: SubscriptionPaymentRequest): Promise<SubscriptionPaymentResponse> {
  const execution = await awaitAppwrite(
    appwriteFunctions.createExecution(APPWRITE_SUBSCRIPTION_PAYMENTS_FUNCTION_ID, JSON.stringify(payload), false),
    'la demande de paiement WhatsApp',
  )
  let response: SubscriptionPaymentResponse
  try { response = JSON.parse(execution.responseBody || '{}') as SubscriptionPaymentResponse } catch {
    throw new Error('La Function Appwrite de paiement a retourné une réponse invalide.')
  }
  if (execution.responseStatusCode >= 400 || !response.ok) {
    throw new Error(response.message || 'La Function Appwrite a refusé la demande de paiement.')
  }
  return response
}

export type UniFlowAccountType = 'UNIVERSITY' | 'PERSONAL'
export type UniFlowRole = 'STUDENT' | 'DELEGATE' | 'TEACHER' | 'ADMIN'

export interface UniFlowUser {
  id: string
  email: string
  name: string
  accountType: UniFlowAccountType
  role: UniFlowRole
  university?: string
  program?: string
  level?: 'L1'
  country?: string
}

export type UniFlowProfileInput = {
  university?: string
  program?: string
  level?: 'L1'
  matricule?: string
  country?: string
}

type UniFlowProfileDocument = UniFlowProfileInput & {
  accountType?: UniFlowAccountType
  role?: UniFlowRole
}

export interface ForumPost {
  $id: string
  authorId: string
  authorName: string
  role: string
  university?: string
  title: string
  content: string
  category: string
  rating: number
  likes: number
  tags: string[]
  createdAt: string
}

export interface PersonalSubject {
  $id: string
  ownerId: string
  name: string
  description?: string
}

export interface PersonalTask {
  $id: string
  ownerId: string
  title: string
  description?: string
  status: string
  priority?: number
}

export interface PersonalSchedule {
  $id: string
  ownerId: string
  title: string
  startsAt: string
  endsAt?: string
}

export interface PersonalGrade {
  $id: string
  ownerId: string
  subjectId: string
  label: string
  score: string
}

type UniFlowPreferences = {
  uniflowAccountType?: unknown
  accountType?: unknown
}

function asAccountType(value: unknown): UniFlowAccountType | null {
  return value === 'PERSONAL' || value === 'UNIVERSITY' ? value : null
}

/**
 * Le type de compte ne doit pas dépendre uniquement de localStorage : une
 * ancienne session pouvait y conserver « UNIVERSITY » tandis que les données
 * personnelles étaient bien stockées dans Appwrite. Les préférences Appwrite
 * sont prioritaires, puis une présence de données personnelles sert de repli
 * sûr pour les comptes historiques.
 */
async function resolveAccountType(profile: Models.User<Models.Preferences>, hintedType?: UniFlowAccountType): Promise<UniFlowAccountType> {
  try {
    const document = await awaitAppwrite(appwriteDatabases.getDocument(APPWRITE_DATABASE_ID, 'users', profile.$id), 'la lecture du profil utilisateur') as unknown as UniFlowProfileDocument
    const documentType = asAccountType(document.accountType)
    if (documentType) return documentType
    if (document.university) return 'UNIVERSITY'
  } catch {
    // Un profil absent ne bloque pas l’identification par les préférences ou les données personnelles.
  }

  const preferences = profile.prefs as UniFlowPreferences
  const preferenceType = asAccountType(preferences.uniflowAccountType) ?? asAccountType(preferences.accountType)
  if (preferenceType) return preferenceType
  if (hintedType === 'PERSONAL') return 'PERSONAL'

  try {
    const [subjects, schedules] = await Promise.all([
      awaitAppwrite(appwriteDatabases.listDocuments(APPWRITE_DATABASE_ID, 'personal_subjects', [Query.equal('ownerId', profile.$id), Query.limit(1)]), 'la lecture des matières personnelles'),
      awaitAppwrite(appwriteDatabases.listDocuments(APPWRITE_DATABASE_ID, 'personal_schedules', [Query.equal('ownerId', profile.$id), Query.limit(1)]), 'la lecture des créneaux personnels'),
    ])
    if (subjects.total > 0 || schedules.total > 0) return 'PERSONAL'
  } catch {
    // Une collection temporairement indisponible ne bloque jamais la session.
  }

  return hintedType ?? 'UNIVERSITY'
}

async function persistAccountTypePreference(accountType: UniFlowAccountType) {
  try {
    const profile = await awaitAppwrite(appwriteAccount.get(), 'la lecture de session')
    await awaitAppwrite(appwriteAccount.updatePrefs({ ...profile.prefs, uniflowAccountType: accountType }), 'la mise à jour du profil')
  } catch {
    // La préférence optimise les sessions futures ; la connexion reste valide si sa mise à jour échoue.
  }
}

const userPermissions = (userId: string) => [
  Permission.read(Role.user(userId)),
  Permission.update(Role.user(userId)),
  Permission.delete(Role.user(userId)),
]

export async function createAccount(email: string, password: string, name: string, accountType: UniFlowAccountType, role: UniFlowRole, profileInput: UniFlowProfileInput = {}) {
  // Appwrite peut refuser la séquence Auth si le navigateur possède encore
  // une session active. La fermeture doit précéder account.create, pas suivre.
  try { await awaitAppwrite(appwriteAccount.deleteSession('current'), 'la fermeture de session précédente') } catch { /* aucune session précédente ou service temporairement indisponible */ }
  const account = await awaitAppwrite(appwriteAccount.create(ID.unique(), email.trim(), password, name.trim()), 'la création du compte')
  await awaitAppwrite(appwriteAccount.createEmailPasswordSession(email.trim(), password), 'l’ouverture de session')
  await persistAccountTypePreference(accountType)
  const profile = await awaitAppwrite(appwriteAccount.get(), 'la lecture du compte créé')
  const effectiveRole: UniFlowRole = accountType === 'UNIVERSITY' ? 'STUDENT' : role
  const userProfile: Required<Pick<UniFlowProfileDocument, 'accountType' | 'role'>> & UniFlowProfileInput & { email: string; name: string } = {
    email: profile.email,
    name: profile.name,
    accountType,
    role: effectiveRole,
    university: accountType === 'UNIVERSITY' ? (profileInput.university || 'Université de Yaoundé I') : '',
    program: accountType === 'UNIVERSITY' ? (profileInput.program || 'ICT4D') : '',
    ...(accountType === 'UNIVERSITY' && profileInput.level ? { level: profileInput.level } : {}),
    country: profileInput.country || 'Cameroun',
  }
  await awaitAppwrite(appwriteDatabases.createDocument(APPWRITE_DATABASE_ID, 'users', profile.$id, userProfile, userPermissions(profile.$id)), 'la création du profil UniFlow')
  if (accountType === 'UNIVERSITY') {
    try {
      await provisionAcademicRegistration(profileInput.matricule)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Le raccordement académique a échoué.'
      throw new Error(`Compte créé, mais ${message} Connectez-vous puis relancez l’inscription universitaire depuis cette session.`)
    }
  }
  return normalizeUser(profile, accountType, effectiveRole, userProfile)
}

export async function loginAccount(email: string, password: string, accountType: UniFlowAccountType) {
  // Un client Appwrite ne peut conserver qu’une session email active dans ce flux.
  // Fermer la session courante permet de changer de compte sans erreur 401/409.
  try { await awaitAppwrite(appwriteAccount.deleteSession('current'), 'la fermeture de session précédente') } catch { /* aucune session précédente ou service temporairement indisponible */ }
  await awaitAppwrite(appwriteAccount.createEmailPasswordSession(email.trim(), password), 'l’ouverture de session')
  const profile = await awaitAppwrite(appwriteAccount.get(), 'la lecture du compte')
  const resolvedAccountType = await resolveAccountType(profile, accountType)
  if (resolvedAccountType !== accountType) await persistAccountTypePreference(resolvedAccountType)
  let role: UniFlowRole = 'STUDENT'
  let userProfile: UniFlowProfileDocument | undefined
  try {
    const doc = await awaitAppwrite(appwriteDatabases.getDocument(APPWRITE_DATABASE_ID, 'users', profile.$id), 'la lecture du profil UniFlow') as unknown as UniFlowProfileDocument
    role = normalizeRole((doc as { role?: string }).role, resolvedAccountType)
    userProfile = doc
  } catch {
    // Le profil peut ne pas encore exister : l’interface reste authentifiée et affiche un état incomplet honnête.
  }
  return normalizeUser(profile, resolvedAccountType, role, userProfile)
}

export async function getCurrentAccount(accountType?: UniFlowAccountType): Promise<UniFlowUser | null> {
  try {
    const profile = await awaitAppwrite(appwriteAccount.get(), 'la restauration de session')
    const hintedType = accountType ?? (localStorage.getItem('uniflow_account_type') === 'PERSONAL' ? 'PERSONAL' : 'UNIVERSITY')
    const resolvedAccountType = await resolveAccountType(profile, hintedType)
    if (resolvedAccountType !== hintedType) await persistAccountTypePreference(resolvedAccountType)
    let role: UniFlowRole = 'STUDENT'
    let userProfile: UniFlowProfileDocument | undefined
    try {
      userProfile = await awaitAppwrite(appwriteDatabases.getDocument(APPWRITE_DATABASE_ID, 'users', profile.$id), 'la lecture du profil UniFlow') as unknown as UniFlowProfileDocument
      role = normalizeRole(userProfile.role, resolvedAccountType)
    } catch {
      // L’authentification Appwrite reste utilisable pendant la création ou la restauration du profil.
    }
    return normalizeUser(profile, resolvedAccountType, role, userProfile)
  } catch (error) {
    // Une absence explicite de session est différente d’un délai réseau ou d’un
    // démarrage Appwrite lent. Seul 401 invalide l’instantané IndexedDB.
    if (Number((error as { code?: unknown })?.code) === 401) return null
    throw error
  }
}

export async function logoutAccount() {
  try { await awaitAppwrite(appwriteAccount.deleteSession('current'), 'la fermeture de session') } catch { /* already logged out */ }
}

export async function listDocuments<T>(collectionId: string, queries: string[] = []) {
  const result = await awaitAppwrite(appwriteDatabases.listDocuments<Models.Document>(APPWRITE_DATABASE_ID, collectionId, queries), `la lecture de ${collectionId}`)
  return result.documents as unknown as T[]
}

export interface AcademicCourseDocument {
  $id: string
  code: string
  name: string
  description?: string
  university: string
  program: string
  level: 'L1'
  teacherId?: string
  teacherName?: string
  credits?: number
  hours?: number
  classroom?: string
  type?: string
}

export interface AcademicScheduleDocument {
  $id: string
  courseId: string
  courseCode: string
  dayOfWeek: string
  startTime: string
  endTime: string
  classroom: string
  type?: string
}

export interface AcademicLibraryDocument {
  $id: string
  title: string
  courseId: string
  course: string
  type: string
  category: string
  size?: string
  description?: string
  fileId?: string
  publishedAt: string
}

export interface AcademicAssignmentDocument {
  $id: string
  courseId: string
  courseCode: string
  studentId: string
  title: string
  description?: string
  dueDate: string
  status?: string
  grade?: string
  feedback?: string
  submittedAt?: string
  submittedFile?: string
  submissionNote?: string
}

export interface AcademicGradeDocument {
  $id: string
  studentId: string
  courseId: string
  courseCode: string
  evaluationTitle: string
  type?: string
  score: number
  maxScore?: number
  coefficient?: number
}

export interface AcademicAttendanceSessionDocument {
  $id: string
  $createdAt?: string
  courseId: string
  date: string
  createdBy?: string
}

export interface AcademicAttendanceRecordDocument {
  $id: string
  $createdAt?: string
  sessionId: string
  courseId: string
  studentId: string
  status: 'PRESENT' | 'ABSENT' | 'RETARD' | 'JUSTIFIE'
}

export interface AcademicAttendanceQrTokenDocument {
  $id: string
  token: string
  sessionId: string
  courseId: string
  createdBy: string
  expiresAt: string
  revoked?: boolean
}

export interface AcademicDirectoryDocument {
  $id: string
  userId: string
  name: string
  role: UniFlowRole
  university: string
  program: string
  level: 'L1'
  matricule?: string
  status?: string
}

export interface AcademicEnrollmentDocument {
  $id: string
  studentId: string
  courseId: string
  status?: string
}

export interface SubscriptionPlanDocument {
  $id: string
  code: string
  name: string
  category: 'PERSONAL' | 'TEACHER' | 'INSTITUTION' | 'ACADEMIC'
  countryCode: string
  currency: 'XAF' | 'EUR' | 'USD'
  priceMonthlyAmount: number
  priceAnnuallyAmount: number
  period?: string
  badge?: string
  highlight?: boolean
  description: string
  providers?: string
  status: 'ACTIVE' | 'INACTIVE'
}

export interface SubscriptionStatusDocument {
  $id: string
  userId: string
  status: 'NONE' | 'ACTIVE'
  planCode?: string
  countryCode?: string
  currency?: 'XAF' | 'EUR' | 'USD'
  monthlyAmount?: number
  currentPeriodEnd?: string
  isAutoRenew?: boolean
}

export const academicAppwriteApi = {
  courses: {
    list: () => listDocuments<AcademicCourseDocument>('academic_courses'),
  },
  schedules: {
    list: () => listDocuments<AcademicScheduleDocument>('academic_schedules'),
  },
  library: {
    list: () => listDocuments<AcademicLibraryDocument>('academic_library', [Query.limit(200)]),
  },
  assignments: {
    list: () => listDocuments<AcademicAssignmentDocument>('academic_assignments', [Query.limit(200)]),
  },
  grades: {
    list: () => listDocuments<AcademicGradeDocument>('academic_grades', [Query.limit(200)]),
  },
  attendance: {
    sessions: () => listDocuments<AcademicAttendanceSessionDocument>('attendance_sessions', [Query.limit(200)]),
    records: () => listDocuments<AcademicAttendanceRecordDocument>('attendance_records', [Query.limit(200)]),
    qrTokens: () => listDocuments<AcademicAttendanceQrTokenDocument>('attendance_qr_tokens', [Query.limit(200)]),
    createSession: async (data: { courseId: string; date: string; createdBy: string }) => {
      const document = await awaitAppwrite(
        appwriteDatabases.createDocument(
          APPWRITE_DATABASE_ID,
          'attendance_sessions',
          ID.unique(),
          data,
          [Permission.read(Role.users()), Permission.update(Role.user(data.createdBy)), Permission.delete(Role.user(data.createdBy))],
        ),
        'la création de la séance de présence',
      )
      return document as unknown as AcademicAttendanceSessionDocument
    },
    createRecord: async (data: Omit<AcademicAttendanceRecordDocument, '$id'>, actorId: string) => {
      const document = await awaitAppwrite(
        appwriteDatabases.createDocument(
          APPWRITE_DATABASE_ID,
          'attendance_records',
          ID.unique(),
          data,
          [Permission.read(Role.users()), Permission.update(Role.user(actorId)), Permission.delete(Role.user(actorId))],
        ),
        'l’enregistrement de la présence',
      )
      return document as unknown as AcademicAttendanceRecordDocument
    },
    updateRecord: async (recordId: string, status: AcademicAttendanceRecordDocument['status']) => {
      const document = await awaitAppwrite(
        appwriteDatabases.updateDocument(
          APPWRITE_DATABASE_ID,
          'attendance_records',
          recordId,
          { status },
        ),
        'la mise à jour de la présence',
      )
      return document as unknown as AcademicAttendanceRecordDocument
    },
    createQrToken: async (data: Omit<AcademicAttendanceQrTokenDocument, '$id'>, actorId: string) => {
      const document = await awaitAppwrite(
        appwriteDatabases.createDocument(
          APPWRITE_DATABASE_ID,
          'attendance_qr_tokens',
          ID.unique(),
          data,
          [Permission.read(Role.users()), Permission.update(Role.user(actorId)), Permission.delete(Role.user(actorId))],
        ),
        'la création du jeton QR de présence',
      )
      return document as unknown as AcademicAttendanceQrTokenDocument
    },
  },
  directory: {
    list: () => listDocuments<AcademicDirectoryDocument>('academic_directory', [Query.limit(200)]),
  },
  enrollments: {
    list: () => listDocuments<AcademicEnrollmentDocument>('academic_enrollments', [Query.limit(200)]),
  },
  subscriptions: {
    listPlans: async () => (await listDocuments<SubscriptionPlanDocument>('subscription_plans')).filter((plan) => plan.status === 'ACTIVE'),
    getStatus: async (userId: string) => {
      const rows = await listDocuments<SubscriptionStatusDocument>('subscription_statuses', [Query.equal('userId', userId)])
      return rows[0] || null
    },
  },
}

export async function listPersonalSubjects(ownerId: string) {
  return listPersonalCollection<PersonalSubject>('subjects', ownerId, 'personal_subjects', [Query.equal('ownerId', ownerId), Query.orderDesc('$createdAt')])
}

export async function listPersonalTasks(ownerId: string) {
  return listPersonalCollection<PersonalTask>('tasks', ownerId, 'personal_tasks', [Query.equal('ownerId', ownerId), Query.orderDesc('$createdAt')])
}

export async function listPersonalSchedules(ownerId: string) {
  return listPersonalCollection<PersonalSchedule>('schedules', ownerId, 'personal_schedules', [Query.equal('ownerId', ownerId), Query.orderAsc('startsAt')])
}

export async function listPersonalGrades(ownerId: string) {
  return listPersonalCollection<PersonalGrade>('grades', ownerId, 'personal_grades', [Query.equal('ownerId', ownerId), Query.orderDesc('$createdAt')])
}

type PersonalCacheKind = 'subjects' | 'tasks' | 'schedules' | 'grades'

function personalCacheKey(ownerId: string, kind: PersonalCacheKind) {
  return `uniflow:personal-cache:v1:${ownerId}:${kind}`
}

function readPersonalCache<T>(ownerId: string, kind: PersonalCacheKind): T[] | null {
  try {
    const raw = localStorage.getItem(personalCacheKey(ownerId, kind))
    const parsed = raw ? JSON.parse(raw) : null
    return Array.isArray(parsed) ? parsed as T[] : null
  } catch {
    return null
  }
}

function writePersonalCache<T>(ownerId: string, kind: PersonalCacheKind, values: T[]) {
  try { localStorage.setItem(personalCacheKey(ownerId, kind), JSON.stringify(values)) } catch { /* local storage unavailable */ }
}

async function listPersonalCollection<T>(kind: PersonalCacheKind, ownerId: string, collectionId: string, queries: string[]) {
  try {
    const documents = await listDocuments<T>(collectionId, queries)
    writePersonalCache(ownerId, kind, documents)
    return documents
  } catch (error) {
    const cached = readPersonalCache<T>(ownerId, kind)
    if (!navigator.onLine && cached) return cached
    throw error
  }
}

export async function createPersonalSubject(ownerId: string, data: Omit<PersonalSubject, '$id' | 'ownerId'>) {
  return awaitAppwrite(appwriteDatabases.createDocument(APPWRITE_DATABASE_ID, 'personal_subjects', ID.unique(), { ownerId, ...data }), 'la création de la matière personnelle')
}

export async function createPersonalTask(ownerId: string, data: Omit<PersonalTask, '$id' | 'ownerId'>) {
  return awaitAppwrite(appwriteDatabases.createDocument(APPWRITE_DATABASE_ID, 'personal_tasks', ID.unique(), { ownerId, ...data }), 'la création de la tâche personnelle')
}

export async function createPersonalSchedule(ownerId: string, data: Omit<PersonalSchedule, '$id' | 'ownerId'>) {
  return awaitAppwrite(appwriteDatabases.createDocument(APPWRITE_DATABASE_ID, 'personal_schedules', ID.unique(), { ownerId, ...data }), 'la création du créneau personnel')
}

export async function createPersonalGrade(ownerId: string, data: Omit<PersonalGrade, '$id' | 'ownerId'>) {
  return awaitAppwrite(appwriteDatabases.createDocument(APPWRITE_DATABASE_ID, 'personal_grades', ID.unique(), { ownerId, ...data }), 'la création de la note personnelle')
}

export async function listForumPosts() {
  return listDocuments<ForumPost>('forum_posts', [Query.orderDesc('$createdAt'), Query.limit(100)])
}

export async function createForumPost(user: UniFlowUser, data: Pick<ForumPost, 'title' | 'content' | 'category' | 'rating' | 'tags'>) {
  return appwriteDatabases.createDocument(
    APPWRITE_DATABASE_ID,
    'forum_posts',
    ID.unique(),
    { authorId: user.id, authorName: user.name || user.email, role: user.role, university: user.university || '', likes: 0, createdAt: new Date().toISOString(), ...data },
    [Permission.read(Role.any()), ...userPermissions(user.id)],
  )
}

export async function updateForumPostLikes(postId: string, likes: number) {
  return appwriteDatabases.updateDocument(APPWRITE_DATABASE_ID, 'forum_posts', postId, { likes })
}

export async function deleteForumPost(postId: string) {
  return appwriteDatabases.deleteDocument(APPWRITE_DATABASE_ID, 'forum_posts', postId)
}

function normalizeRole(value: string | undefined, accountType: UniFlowAccountType): UniFlowRole {
  if (value === 'ADMIN' || value === 'TEACHER' || value === 'DELEGATE' || value === 'STUDENT') return value
  return accountType === 'PERSONAL' ? 'STUDENT' : 'STUDENT'
}

function normalizeUser(profile: Models.User<Models.Preferences>, accountType: UniFlowAccountType, role: UniFlowRole, userProfile?: UniFlowProfileDocument): UniFlowUser {
  return {
    id: profile.$id,
    email: profile.email,
    name: profile.name,
    accountType,
    role,
    university: userProfile?.university || undefined,
    program: userProfile?.program || undefined,
    level: userProfile?.level,
    country: userProfile?.country || undefined,
  }
}

export type PersonalCourseRecord = {
  id: string
  code: string
  title: string
  instructor?: string
  credits?: number
  colorHex?: string
  classroom?: string
  description?: string
  createdAt?: string
}

export type PersonalScheduleRecord = {
  id: string
  courseId: string
  courseTitle?: string
  courseCode?: string
  dayOfWeek: string
  startTime: string
  endTime: string
  classroom?: string
  colorHex?: string
  type?: string
}

export type PersonalAssignmentRecord = {
  id: string
  courseId: string
  title: string
  dueDate: string
  description?: string
  priority?: string
  status?: string
}

export type PersonalGradeRecord = {
  id: string
  courseId: string
  evaluationTitle: string
  score: number
  maxScore: number
  coefficient: number
}

async function storedOwnerId() {
  const snapshot = await readSessionSnapshot()
  const current = await getCurrentAccount(snapshot?.user.accountType)
  if (current?.id) return current.id
  if (!navigator.onLine && snapshot?.user.id) return snapshot.user.id
  throw new Error('Session Appwrite absente. Connectez-vous avant de gérer vos données personnelles.')
}

function ownerPermissions(ownerId: string) {
  // Appwrite interdit Permission.create au niveau d’un document/row.
  // CREATE doit être accordé au niveau de la collection ; le document reste privé au propriétaire.
  return [Permission.read(Role.user(ownerId)), Permission.update(Role.user(ownerId)), Permission.delete(Role.user(ownerId))]
}

function subjectToCourse(doc: Record<string, any>): PersonalCourseRecord {
  return { id: doc.$id, code: doc.code || '', title: doc.title || doc.name || '', instructor: doc.instructor || '', credits: typeof doc.credits === 'number' ? doc.credits : undefined, colorHex: doc.colorHex || '#0d9488', classroom: doc.classroom || '', description: doc.description || '', createdAt: doc.$createdAt }
}
const SCHEDULE_META_PREFIX = '[UNIFLOW_SCHEDULE]'

type StoredScheduleMeta = { courseId: string; dayOfWeek: string; startTime: string; endTime: string; classroom: string; type: string }

function decodeScheduleMeta(title: string): StoredScheduleMeta | null {
  if (!title.startsWith(SCHEDULE_META_PREFIX)) return null
  try { return JSON.parse(title.slice(SCHEDULE_META_PREFIX.length).trim()) as StoredScheduleMeta } catch { return null }
}

function scheduleToUi(doc: Record<string, any>): PersonalScheduleRecord {
  const meta = decodeScheduleMeta(String(doc.title || ''))
  return {
    id: doc.$id,
    courseId: meta?.courseId || doc.courseId || '',
    dayOfWeek: meta?.dayOfWeek || doc.dayOfWeek || '',
    startTime: meta?.startTime || (doc.startsAt ? new Date(doc.startsAt).toTimeString().slice(0, 5) : ''),
    endTime: meta?.endTime || (doc.endsAt ? new Date(doc.endsAt).toTimeString().slice(0, 5) : ''),
    classroom: meta?.classroom || doc.classroom || '',
    type: meta?.type || doc.type || '',
  }
}
function taskToUi(doc: Record<string, any>): PersonalAssignmentRecord {
  const priorityMap: Record<string, string> = { '1': 'LOW', '2': 'MEDIUM', '3': 'HIGH', '4': 'URGENT' }
  const rawPriority = String(doc.priority ?? '')
  return { id: doc.$id, courseId: doc.courseId || '', title: doc.title || '', dueDate: doc.dueDate || '', description: doc.description || '', priority: priorityMap[rawPriority] || rawPriority, status: doc.status || '' }
}
function gradeToUi(doc: Record<string, any>): PersonalGradeRecord {
  return { id: doc.$id, courseId: doc.courseId || doc.subjectId || '', evaluationTitle: doc.evaluationTitle || doc.label || doc.title || '', score: Number(doc.score || 0), maxScore: Number(doc.maxScore || 20), coefficient: Number(doc.coefficient || 1) }
}

function taskPayload(ownerId: string, dto: Partial<PersonalAssignmentRecord>) {
  const priorityMap: Record<string, number> = { LOW: 1, MEDIUM: 2, HIGH: 3, URGENT: 4 }
  const rawPriority = String(dto.priority || 'MEDIUM')
  return { ownerId, title: String(dto.title || '').trim(), courseId: String(dto.courseId || ''), dueDate: dto.dueDate ? new Date(dto.dueDate).toISOString() : '', description: String(dto.description || ''), priority: priorityMap[rawPriority] || 2, status: String(dto.status || 'TODO') }
}

function gradePayload(ownerId: string, dto: Partial<PersonalGradeRecord>) {
  const evaluationTitle = String(dto.evaluationTitle || '').trim()
  return { ownerId, subjectId: String(dto.courseId || ''), courseId: String(dto.courseId || ''), label: evaluationTitle, evaluationTitle, score: String(dto.score ?? 0), maxScore: String(dto.maxScore ?? 20), coefficient: String(dto.coefficient ?? 1) }
}

function schedulePayload(ownerId: string, dto: Partial<PersonalScheduleRecord>) {
  const startTime = dto.startTime || '00:00'
  const endTime = dto.endTime || startTime
  const dayOfWeek = dto.dayOfWeek || 'LUNDI'
  const dayIndex = ['LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI', 'DIMANCHE'].indexOf(dayOfWeek)
  const now = new Date()
  const mondayOffset = (now.getDay() + 6) % 7
  const target = new Date(now)
  target.setDate(now.getDate() - mondayOffset + Math.max(dayIndex, 0))
  const date = target.toISOString().slice(0, 10)
  const meta: StoredScheduleMeta = { courseId: dto.courseId || '', dayOfWeek, startTime, endTime, classroom: dto.classroom || '', type: dto.type || '' }
  const toIso = (time: string) => new Date(`${date}T${time}:00`).toISOString()
  return { ownerId, title: `${SCHEDULE_META_PREFIX} ${JSON.stringify(meta)}`, startsAt: toIso(startTime), endsAt: toIso(endTime) }
}

export const personalAppwriteApi = {
  courses: {
    list: async () => (await listPersonalSubjects(await storedOwnerId())).map(subjectToCourse),
    create: async (dto: Omit<PersonalCourseRecord, 'id' | 'createdAt'>) => {
      const ownerId = await storedOwnerId()
      const doc = await appwriteDatabases.createDocument(APPWRITE_DATABASE_ID, 'personal_subjects', ID.unique(), { ownerId, name: dto.title, code: dto.code, title: dto.title, instructor: dto.instructor || '', credits: dto.credits || 0, colorHex: dto.colorHex || '#0d9488', classroom: dto.classroom || '', description: dto.description || '' })
      return subjectToCourse(doc as Record<string, any>)
    },
    update: async (id: string, dto: Partial<PersonalCourseRecord>) => {
      const doc = await appwriteDatabases.updateDocument(APPWRITE_DATABASE_ID, 'personal_subjects', id, { ...dto, ...(dto.title ? { name: dto.title } : {}) })
      return subjectToCourse(doc as Record<string, any>)
    },
    delete: async (id: string) => { await appwriteDatabases.deleteDocument(APPWRITE_DATABASE_ID, 'personal_subjects', id) },
  },
  schedules: {
    list: async () => (await listPersonalSchedules(await storedOwnerId())).map(scheduleToUi),
    create: async (dto: Omit<PersonalScheduleRecord, 'id' | 'courseTitle' | 'courseCode' | 'colorHex'>) => {
      const ownerId = await storedOwnerId()
      const doc = await appwriteDatabases.createDocument(APPWRITE_DATABASE_ID, 'personal_schedules', ID.unique(), schedulePayload(ownerId, dto))
      return scheduleToUi(doc as Record<string, any>)
    },
    update: async (id: string, dto: Partial<PersonalScheduleRecord>) => {
      const ownerId = await storedOwnerId()
      const doc = await appwriteDatabases.updateDocument(APPWRITE_DATABASE_ID, 'personal_schedules', id, schedulePayload(ownerId, dto))
      return scheduleToUi(doc as Record<string, any>)
    },
    delete: async (id: string) => { await appwriteDatabases.deleteDocument(APPWRITE_DATABASE_ID, 'personal_schedules', id) },
  },
  assignments: {
    list: async () => (await listPersonalTasks(await storedOwnerId())).map(taskToUi),
    create: async (dto: Omit<PersonalAssignmentRecord, 'id'>) => {
      const ownerId = await storedOwnerId()
      const doc = await appwriteDatabases.createDocument(APPWRITE_DATABASE_ID, 'personal_tasks', ID.unique(), taskPayload(ownerId, dto))
      return taskToUi(doc as Record<string, any>)
    },
    update: async (id: string, dto: Partial<PersonalAssignmentRecord>) => taskToUi(await appwriteDatabases.updateDocument(APPWRITE_DATABASE_ID, 'personal_tasks', id, taskPayload(await storedOwnerId(), dto)) as Record<string, any>),
    delete: async (id: string) => { await appwriteDatabases.deleteDocument(APPWRITE_DATABASE_ID, 'personal_tasks', id) },
  },
  grades: {
    list: async () => (await listPersonalGrades(await storedOwnerId())).map(gradeToUi),
    create: async (dto: Omit<PersonalGradeRecord, 'id'>) => {
      const ownerId = await storedOwnerId()
      const doc = await appwriteDatabases.createDocument(APPWRITE_DATABASE_ID, 'personal_grades', ID.unique(), gradePayload(ownerId, dto))
      return gradeToUi(doc as Record<string, any>)
    },
    update: async (id: string, dto: Partial<PersonalGradeRecord>) => gradeToUi(await appwriteDatabases.updateDocument(APPWRITE_DATABASE_ID, 'personal_grades', id, gradePayload(await storedOwnerId(), dto)) as Record<string, any>),
    delete: async (id: string) => { await appwriteDatabases.deleteDocument(APPWRITE_DATABASE_ID, 'personal_grades', id) },
  },
}

export type AppwriteNotification = {
  $id: string
  ownerId: string
  type: string
  title: string
  message: string
  isRead: boolean
  createdAt: string
}

export async function listAppwriteNotifications(ownerId: string) {
  try {
    return await listDocuments<AppwriteNotification>('notifications', [Query.equal('ownerId', ownerId), Query.orderDesc('$createdAt'), Query.limit(100)])
  } catch {
    return []
  }
}

export async function markAppwriteNotificationRead(id: string) {
  return appwriteDatabases.updateDocument(APPWRITE_DATABASE_ID, 'notifications', id, { isRead: true })
}

export async function deleteAppwriteNotification(id: string) {
  return appwriteDatabases.deleteDocument(APPWRITE_DATABASE_ID, 'notifications', id)
}
