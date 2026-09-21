import {
  appwriteAccount,
  academicAppwriteApi,
  type AdminDirectoryEntry,
  executeAcademicGradesAction,
  executeAttendanceSecureAction,
  executeAdminDirectoryAction,
  executeMessagingAction,
  executeSubscriptionPaymentAction,
  type SubscriptionPaymentRecord,
  type SubscriptionPlanDocument,
  getCurrentAccount,
  listDocuments,
  listAppwriteNotifications,
  markAppwriteNotificationRead,
  deleteAppwriteNotification,
  personalAppwriteApi,
} from './appwrite'
import { type AcademicScope, filterByScope, isLearnerRole, isLearnerScopeComplete, matchesScope, mergeScope, scopeOf, teacherMatches } from './academicScope'
import { attendanceRate, formatSubmissionGrade, isPublishedStatement, learnerStatus, matchesAudience } from './assignmentModel'
import { fileKind, humanFileSize } from './teacherCourseModel'

/**
 * Adaptateur de compatibilité UniFlow.
 *
 * L’application ne communique plus avec les deux API NestJS historiques. Les
 * lectures et écritures personnelles passent directement par le SDK Appwrite,
 * configuré dans `appwrite.ts` vers Appwrite Cloud (région Francfort). Les
 * fonctionnalités dont la collection Appwrite n’est pas encore provisionnée
 * retournent un état explicite et n’émettent jamais de requête HTTP de repli.
 */
export const APPWRITE_VPS_ENDPOINT = 'https://fra.cloud.appwrite.io/v1'

// Alias de compatibilité : aucun de ces exports ne désigne un backend legacy.
export const UNIVERSITY_API_URL = APPWRITE_VPS_ENDPOINT
export const PERSONAL_API_URL = APPWRITE_VPS_ENDPOINT
export const BASE_URL = APPWRITE_VPS_ENDPOINT

export type AccountType = 'UNIVERSITY' | 'PERSONAL' | 'PLATFORM'

export function getAccountType(): AccountType {
  try {
    const stored = localStorage.getItem('uniflow_account_type')
    return stored === 'PERSONAL' || stored === 'PLATFORM' ? stored : 'UNIVERSITY'
  } catch {
    return 'UNIVERSITY'
  }
}

export function setAccountType(type: AccountType): void {
  try { localStorage.setItem('uniflow_account_type', type) } catch { /* stockage indisponible */ }
}

export function getActiveApiUrl(): string {
  return APPWRITE_VPS_ENDPOINT
}

// Jetons legacy conservés uniquement pour purger les anciennes sessions du navigateur.
export const getToken = () => {
  try { return localStorage.getItem('uniflow_access_token') } catch { return null }
}
export const getRefreshToken = () => {
  try { return localStorage.getItem('uniflow_refresh_token') } catch { return null }
}
export const setTokens = (accessToken: string, refreshToken: string) => {
  try {
    localStorage.setItem('uniflow_access_token', accessToken)
    localStorage.setItem('uniflow_refresh_token', refreshToken)
  } catch { /* stockage indisponible */ }
}
export const clearTokens = () => {
  try {
    localStorage.removeItem('uniflow_access_token')
    localStorage.removeItem('uniflow_refresh_token')
    localStorage.removeItem('uniflow_user')
  } catch { /* stockage indisponible */ }
}

export class ApiError extends Error {
  constructor(public status: number, message: string, public body?: unknown) {
    super(message)
    this.name = 'ApiError'
  }
}

export function dispatchNetworkErrorEvent(url: string, rawMessage?: string) {
  try {
    window.dispatchEvent(new CustomEvent('uniflow:network-error', {
      detail: {
        url,
        message: rawMessage || 'La requête Appwrite a échoué.',
        timestamp: Date.now(),
      },
    }))
  } catch { /* environnement sans DOM */ }
}

function unavailable<T>(feature: string): Promise<T> {
  return Promise.reject(new ApiError(
    501,
    `${feature} n’est pas encore provisionné dans Appwrite KERNEL FORGE. Aucune requête vers un backend alternatif n’a été effectuée.`,
  ))
}

/** Les helpers legacy restent des garde-fous sans transport HTTP. */
export async function executeAxiosRequest<T = unknown>(_config: unknown): Promise<T> {
  return unavailable<T>('Cette route historique')
}
export const axiosRequestWrapper = executeAxiosRequest
export const apiClient = { request: executeAxiosRequest }
export const axiosInstance = apiClient
export const api = {
  get: <T>(_path: string) => unavailable<T>('Cette route historique'),
  post: <T>(_path: string, _body?: unknown) => unavailable<T>('Cette route historique'),
  patch: <T>(_path: string, _body?: unknown) => unavailable<T>('Cette route historique'),
  put: <T>(_path: string, _body?: unknown) => unavailable<T>('Cette route historique'),
  delete: <T>(_path: string) => unavailable<T>('Cette route historique'),
}

export interface LoginDto {
  email: string
  password: string
  accountType?: AccountType
  universityCode?: string
}
export interface RegisterDto {
  email: string
  password: string
  firstName: string
  lastName: string
  role: 'ETUDIANT' | 'ENSEIGNANT' | 'DELEGUE' | 'ADMIN' | 'INDEPENDENT_STUDENT' | 'INDEPENDENT_TEACHER'
  accountType?: AccountType
  universityCode?: string
  matricule?: string
  countryCode?: string
  levelId?: string
  specialtyId?: string
}
export interface BackendUser {
  id: string
  email: string
  role: string
  firstName?: string
  lastName?: string
  fullName?: string
  accountType?: string
  accountCategory?: string
  countryCode?: string
  universityCode?: string
  subscriptionStatus?: string
  student?: StudentProfile
  teacher?: TeacherProfile
  /** Pseudo unique : référent de la messagerie. */
  username?: string
  /** Fichier de la photo de profil dans le bucket `uniflow_assets`. */
  avatarFileId?: string
  /** Labels Appwrite (preuve du rôle) ; absent si l'instantané hors ligne n'en avait pas. */
  labels?: string[]
  /** Administrateur de la plateforme (label `superadmin`). */
  isSuperAdmin?: boolean
  university?: string
  faculty?: string
  program?: string
  level?: string
}
export interface AuthResult { accessToken: string; refreshToken: string; user: BackendUser }
interface StudentProfile { firstName: string; lastName: string; matricule?: string; level?: string; specialty?: string }
interface TeacherProfile { firstName: string; lastName: string }

function toBackendUser(user: Awaited<ReturnType<typeof getCurrentAccount>>): BackendUser {
  if (!user) throw new ApiError(401, 'Session Appwrite absente.')
  const [firstName = '', ...lastName] = user.name.trim().split(/\s+/)
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    firstName,
    lastName: lastName.join(' '),
    fullName: user.name,
    accountType: user.accountType,
    accountCategory: user.accountType,
    countryCode: user.country === 'Cameroun' ? 'CM' : user.country,
    username: user.username,
    avatarFileId: user.avatarFileId,
    labels: user.labels,
    isSuperAdmin: user.isSuperAdmin,
    university: user.university,
    faculty: user.faculty,
    program: user.program,
    level: user.level,
  }
}

/**
 * Sélection explicite filière/niveau (sélecteur des pages administration et
 * enseignant). Vide = périmètre implicite du profil.
 */
export type ScopeSelection = Partial<Pick<AcademicScope, 'program' | 'level'>>

// Chaque liste (cours, séances, annuaire…) relit le compte pour connaître son
// périmètre ; sans ce court cache une page en déclenchait cinq ou six fois.
// Seuls les résultats non nuls sont retenus : une absence de session ne doit
// jamais masquer une connexion qui vient d'aboutir.
const CURRENT_ACCOUNT_TTL_MS = 5_000
let currentAccountCache: { user: NonNullable<Awaited<ReturnType<typeof getCurrentAccount>>>; expiresAt: number } | null = null
let currentAccountRequest: ReturnType<typeof getCurrentAccount> | null = null
if (typeof window !== 'undefined') {
  window.addEventListener('uniflow:logged-out', () => { currentAccountCache = null })
}

async function cachedUniversityAccount() {
  if (currentAccountCache && currentAccountCache.expiresAt > Date.now()) return currentAccountCache.user
  if (!currentAccountRequest) {
    currentAccountRequest = getCurrentAccount('UNIVERSITY')
      .then((user) => {
        if (user) currentAccountCache = { user, expiresAt: Date.now() + CURRENT_ACCOUNT_TTL_MS }
        return user
      })
      .finally(() => { currentAccountRequest = null })
  }
  return currentAccountRequest
}

async function currentScope(selection?: ScopeSelection) {
  const current = await cachedUniversityAccount()
  return { current, scope: mergeScope(scopeOf(current), selection) }
}

export interface AcademicLevel { id: string; name: string; programName: string }
export interface SpecialtyOption { id: string; name: string; levelId: string }
// Plus aucune liste codée en dur : niveaux et filières viennent du référentiel
// en base (`src/lib/referenceData.ts`). Ces deux tableaux vides ne subsistent
// que pour l'ancienne API `authApi.academicOptions`, qui n'a plus d'appelant.
const academicLevels: AcademicLevel[] = []
const academicSpecialties: SpecialtyOption[] = []

export const authApi = {
  login: async (_dto: LoginDto): Promise<AuthResult> => unavailable<AuthResult>('La connexion legacy'),
  register: async (_dto: RegisterDto): Promise<AuthResult> => unavailable<AuthResult>('L’inscription legacy'),
  me: async () => toBackendUser(await getCurrentAccount()),
  academicOptions: async () => ({ levels: academicLevels, specialties: academicSpecialties }),
  specialties: async (levelId?: string) => academicSpecialties.filter((item) => !levelId || item.levelId === levelId),
  logout: () => clearTokens(),
  updateProfile: async (dto: Partial<StudentProfile & TeacherProfile & { email: string; phone?: string; address?: string; firstName?: string; lastName?: string; countryCode?: string; preferredCurrency?: string }>) => {
    const current = await getCurrentAccount()
    if (!current) throw new ApiError(401, 'Session Appwrite absente.')
    const firstName = dto.firstName?.trim()
    const lastName = dto.lastName?.trim()
    if (firstName || lastName) await appwriteAccount.updateName([firstName || current.name.split(' ')[0] || '', lastName || current.name.split(' ').slice(1).join(' ')].filter(Boolean).join(' '))
    return toBackendUser(await getCurrentAccount(current.accountType))
  },
}

export interface Course {
  /** Filière et niveau du cours universitaire (absents pour un cours personnel). */
  program?: string
  level?: string
  id: string; name: string; code: string; description?: string
  type: 'CM' | 'TD' | 'TP'; credits: number; hours: number
  teachingUnit?: { id: string; name: string; code: string; credits: number }
  teacher?: { id: string; firstName: string; lastName: string }
  classroom?: { id: string; name: string; building: string }
}
export interface PersonalCourse { id: string; code: string; title: string; instructor?: string; credits?: number; colorHex?: string; classroom?: string; description?: string; createdAt?: string }
export interface PersonalSchedule { id: string; courseId: string; courseTitle?: string; courseCode?: string; dayOfWeek: string; startTime: string; endTime: string; classroom?: string; colorHex?: string; type?: string }
export interface PersonalAssignment { id: string; courseId: string; title: string; dueDate: string; description?: string; priority?: string; status?: string }
export interface PersonalGrade { id: string; courseId: string; evaluationTitle: string; score: number; maxScore: number; coefficient: number }

function asCourse(course: PersonalCourse): Course {
  const instructor = course.instructor?.trim()
  return {
    id: course.id,
    name: course.title,
    code: course.code,
    description: course.description,
    type: 'CM',
    credits: course.credits ?? 0,
    hours: 0,
    teacher: instructor ? { id: '', firstName: instructor, lastName: '' } : undefined,
    classroom: course.classroom ? { id: '', name: course.classroom, building: '' } : undefined,
  }
}
async function personalCourses(): Promise<Course[]> {
  if (getAccountType() !== 'PERSONAL') return []
  return (await personalAppwriteApi.courses.list()).map(asCourse)
}

function asAcademicCourse(course: import('./appwrite').AcademicCourseDocument): Course {
  const [firstName = '', ...lastName] = (course.teacherName || '').trim().split(/\s+/)
  return {
    id: course.$id,
    code: course.code,
    name: course.name,
    program: course.program,
    level: course.level,
    description: course.description || '',
    type: (course.type || 'CM') as Course['type'],
    credits: course.credits || 0,
    hours: course.hours || 0,
    teacher: course.teacherName ? { id: course.teacherId || '', firstName, lastName: lastName.join(' ') } : undefined,
    classroom: course.classroom ? { id: '', name: course.classroom, building: '' } : undefined,
  }
}

function courseBelongsToTeacher(course: { teacherId?: string; teacherName?: string }, current: { id: string; name: string }) {
  return course.teacherId === current.id || teacherMatches(course.teacherName, current.name)
}

async function universityCourseDocuments(selection?: ScopeSelection) {
  const { current, scope } = await currentScope(selection)
  if (!current) return { current: null, courses: [] as import('./appwrite').AcademicCourseDocument[] }
  // Même règle que l'emploi du temps : les UE d'un étudiant sont celles de sa
  // filière et de son niveau, ou rien tant que son profil est incomplet.
  if (isLearnerRole(current.role) && !isLearnerScopeComplete(scope)) return { current, courses: [] }
  const documents = filterByScope(await academicAppwriteApi.courses.list(scope), scope)
  // Un enseignant sans sélection explicite voit ses cours ; avec un sélecteur, la filière choisie.
  const courses = current.role === 'TEACHER' && !selection?.program
    ? documents.filter((course) => courseBelongsToTeacher(course, current))
    : documents
  return { current, courses }
}

async function universityCourses(selection?: ScopeSelection): Promise<Course[]> {
  return (await universityCourseDocuments(selection)).courses.map(asAcademicCourse)
}

async function visibleCourses(selection?: ScopeSelection): Promise<Course[]> {
  return getAccountType() === 'PERSONAL' ? personalCourses() : universityCourses(selection)
}

export const coursesApi = {
  list: () => visibleCourses(),
  mine: () => visibleCourses(),
  /** Cours d'une filière et d'un niveau choisis (administration, enseignant). */
  listScoped: (selection: ScopeSelection) => visibleCourses(selection),
  getOne: async (id: string) => {
    const course = (await visibleCourses()).find((item) => item.id === id)
    if (!course) throw new ApiError(404, 'Cours introuvable dans les données Appwrite disponibles.')
    return course
  },
  create: async (dto: Partial<Course> & { teachingUnitId?: string; teacherId?: string; classroomId?: string }) => {
    if (getAccountType() !== 'PERSONAL') return unavailable<Course>('Les cours universitaires')
    return asCourse(await personalAppwriteApi.courses.create({ code: dto.code || '', title: dto.name || '', description: dto.description, instructor: dto.teacher?.firstName, credits: dto.credits, classroom: dto.classroom?.name }))
  },
  update: async (id: string, dto: Partial<Course>) => {
    if (getAccountType() !== 'PERSONAL') return unavailable<Course>('Les cours universitaires')
    return asCourse(await personalAppwriteApi.courses.update(id, { code: dto.code, title: dto.name, description: dto.description, instructor: dto.teacher?.firstName, credits: dto.credits, classroom: dto.classroom?.name }))
  },
  delete: async (id: string) => {
    if (getAccountType() !== 'PERSONAL') return unavailable<void>('Les cours universitaires')
    return personalAppwriteApi.courses.delete(id)
  },
}

export const personalApi = personalAppwriteApi

export interface Schedule {
  id: string; dayOfWeek: string; startTime: string; endTime: string; semesterId: string
  /** Groupe de TD/TP quand la séance ne concerne qu'une partie de la promotion. */
  group?: string
  course: { id: string; name: string; code: string; type: string; teacher: { firstName: string; lastName: string }; classroom: { name: string; building: string } }
}
async function personalSchedules(): Promise<Schedule[]> {
  if (getAccountType() !== 'PERSONAL') return []
  const [schedules, courses] = await Promise.all([personalAppwriteApi.schedules.list(), personalAppwriteApi.courses.list()])
  const byId = new Map(courses.map((course) => [course.id, course]))
  return schedules.map((item) => {
    const course = byId.get(item.courseId)
    return {
      id: item.id,
      dayOfWeek: item.dayOfWeek,
      startTime: item.startTime,
      endTime: item.endTime,
      semesterId: '',
      course: { id: item.courseId, name: course?.title || item.courseTitle || '', code: course?.code || item.courseCode || '', type: item.type || '', teacher: { firstName: '', lastName: '' }, classroom: { name: item.classroom || '', building: '' } },
    }
  })
}
function splitName(name: string | undefined) {
  const [firstName = '', ...lastName] = (name || '').trim().split(/\s+/)
  return { firstName, lastName: lastName.join(' ') }
}

/**
 * Emploi du temps universitaire lu directement dans `academic_schedules`
 * (filtre serveur par filière + niveau). Le cours n'est consulté qu'en repli
 * pour les séances anciennes dépourvues de `courseName`.
 */
async function universitySchedules(selection?: ScopeSelection): Promise<Schedule[]> {
  const { current, scope } = await currentScope(selection)
  if (!current) return []
  // Un étudiant ne voit que sa filière et son niveau — jamais « tout » parce
  // que l'un des deux manque à son profil.
  if (isLearnerRole(current.role) && !isLearnerScopeComplete(scope)) return []
  const rows = filterByScope(await academicAppwriteApi.schedules.list(scope), scope)
  const needsCourses = rows.some((row) => !row.courseName)
  const courses = needsCourses ? await academicAppwriteApi.courses.list(scope) : []
  const byId = new Map(courses.map((course) => [course.$id, course]))
  return rows
    .filter((row) => current.role !== 'TEACHER' || selection?.program || teacherMatches(row.teacherName || byId.get(row.courseId)?.teacherName, current.name))
    .map((row) => {
      const course = byId.get(row.courseId)
      const teacher = splitName(row.teacherName || course?.teacherName)
      return {
        id: row.$id,
        dayOfWeek: row.dayOfWeek,
        startTime: row.startTime,
        endTime: row.endTime,
        semesterId: [row.program || scope.program, row.level || scope.level, row.semester].filter(Boolean).join('-'),
        group: row.group || undefined,
        course: {
          id: row.courseId,
          name: row.courseName || course?.name || row.courseCode,
          code: row.courseCode || course?.code || '',
          type: row.type || course?.type || 'CM',
          teacher,
          classroom: { name: row.classroom || course?.classroom || '', building: '' },
        },
      }
    })
    .sort((a, b) => a.dayOfWeek.localeCompare(b.dayOfWeek) || a.startTime.localeCompare(b.startTime))
}
async function visibleSchedules(selection?: ScopeSelection): Promise<Schedule[]> {
  return getAccountType() === 'PERSONAL' ? personalSchedules() : universitySchedules(selection)
}
export const schedulesApi = {
  list: () => visibleSchedules(),
  mine: () => visibleSchedules(),
  /** Séances d'une filière et d'un niveau choisis (administration, enseignant). */
  listScoped: (selection: ScopeSelection) => visibleSchedules(selection),
  create: async (dto: Partial<Schedule>) => {
    if (getAccountType() !== 'PERSONAL') return unavailable<Schedule>('Les créneaux universitaires')
    const created = await personalAppwriteApi.schedules.create({ courseId: dto.course?.id || '', dayOfWeek: dto.dayOfWeek || 'LUNDI', startTime: dto.startTime || '00:00', endTime: dto.endTime || dto.startTime || '00:00', classroom: dto.course?.classroom?.name, type: dto.course?.type })
    return (await personalSchedules()).find((item) => item.id === created.id) as Schedule
  },
}

export interface Student { id: string; firstName: string; lastName: string; matricule: string; status: string; level?: { name: string; program?: { name: string } }; specialty?: { name: string }; user?: { email: string } }
export interface Teacher { id: string; firstName: string; lastName: string; user?: { email: string }; courses?: Course[] }

function directoryName(name: string) {
  const [firstName = '', ...lastName] = name.trim().split(/\s+/)
  return { firstName, lastName: lastName.join(' ') }
}

async function academicDirectory(selection?: ScopeSelection) {
  const { current, scope } = await currentScope(selection)
  if (!current) return []
  return filterByScope(await academicAppwriteApi.directory.list(), scope)
}

function asStudent(entry: import('./appwrite').AcademicDirectoryDocument): Student {
  const { firstName, lastName } = directoryName(entry.name)
  return {
    id: entry.userId,
    firstName,
    lastName,
    matricule: entry.matricule || 'Non renseigné',
    status: entry.role === 'DELEGATE' ? 'delegate' : (entry.status || 'ACTIVE'),
    level: { name: entry.level, program: { name: entry.program } },
    specialty: { name: entry.program },
  }
}

function asTeacher(entry: import('./appwrite').AcademicDirectoryDocument): Teacher {
  const { firstName, lastName } = directoryName(entry.name)
  return { id: entry.userId, firstName, lastName }
}

function asAdminStudent(entry: AdminDirectoryEntry): Student {
  const { firstName, lastName } = directoryName(entry.name)
  return {
    id: entry.userId,
    firstName,
    lastName,
    matricule: entry.matricule || 'Non renseigné',
    status: entry.role === 'DELEGATE' ? 'delegate' : entry.status,
    level: { name: entry.level || '', program: { name: entry.program || '' } },
    specialty: { name: entry.program || '' },
    user: { email: entry.email },
  }
}

function asAdminTeacher(entry: AdminDirectoryEntry): Teacher {
  const { firstName, lastName } = directoryName(entry.name)
  return { id: entry.userId, firstName, lastName, user: { email: entry.email } }
}

async function requireAdminDirectoryAccess() {
  const current = await getCurrentAccount('UNIVERSITY')
  if (!current) throw new ApiError(401, 'Session Appwrite absente.')
  if (current.role !== 'ADMIN') throw new ApiError(403, 'Seul un administrateur peut gérer les comptes universitaires.')
  return current
}

const ADMIN_DIRECTORY_CACHE_TTL_MS = 60_000
let adminDirectoryCache: { entries: AdminDirectoryEntry[]; expiresAt: number } | null = null
let adminDirectoryRequest: Promise<AdminDirectoryEntry[]> | null = null

function invalidateAdminDirectoryCache() {
  adminDirectoryCache = null
}

async function adminDirectoryEntries() {
  await requireAdminDirectoryAccess()
  if (adminDirectoryCache && adminDirectoryCache.expiresAt > Date.now()) return adminDirectoryCache.entries
  if (adminDirectoryRequest) return adminDirectoryRequest
  adminDirectoryRequest = executeAdminDirectoryAction({ action: 'list' })
    .then((result) => {
      const entries = result.entries || []
      adminDirectoryCache = { entries, expiresAt: Date.now() + ADMIN_DIRECTORY_CACHE_TTL_MS }
      return entries
    })
    .finally(() => { adminDirectoryRequest = null })
  return adminDirectoryRequest
}

function fullName(firstName?: string, lastName?: string) {
  return [firstName, lastName].map((value) => String(value || '').trim()).filter(Boolean).join(' ')
}

async function refreshStudent(id: string) {
  const student = (await studentsApi.list()).find((entry) => entry.id === id)
  if (!student) throw new ApiError(404, 'Étudiant introuvable après la synchronisation Appwrite.')
  return student
}

async function refreshStudentForAdmin(id: string) {
  const student = (await studentsApi.listForAdmin()).find((entry) => entry.id === id)
  if (!student) throw new ApiError(404, 'Étudiant introuvable après la synchronisation Appwrite.')
  return student
}

async function refreshTeacher(id: string) {
  const teacher = (await teachersApi.list()).find((entry) => entry.id === id)
  if (!teacher) throw new ApiError(404, 'Enseignant introuvable après la synchronisation Appwrite.')
  return teacher
}

async function refreshTeacherForAdmin(id: string) {
  const teacher = (await teachersApi.listForAdmin()).find((entry) => entry.id === id)
  if (!teacher) throw new ApiError(404, 'Enseignant introuvable après la synchronisation Appwrite.')
  return teacher
}

const isLearner = (entry: { role: string }) => entry.role === 'STUDENT' || entry.role === 'DELEGATE'

export const studentsApi = {
  list: async (): Promise<Student[]> => (await academicDirectory()).filter(isLearner).map(asStudent),
  listScoped: async (selection: ScopeSelection): Promise<Student[]> => (await academicDirectory(selection)).filter(isLearner).map(asStudent),
  /** Étudiants distincts inscrits à au moins un des cours de l'enseignant ou du délégué connecté. */
  countForMyCourses: async (): Promise<number> => {
    const current = await getCurrentAccount('UNIVERSITY')
    if (!current || current.role === 'STUDENT') return 0
    const [courses, enrollments] = await Promise.all([universityCourses(), academicAppwriteApi.enrollments.list()])
    const courseIds = new Set(courses.map((course) => course.id))
    return new Set(enrollments
      .filter((enrollment) => courseIds.has(enrollment.courseId) && enrollment.status !== 'INACTIVE')
      .map((enrollment) => enrollment.studentId)).size
  },
  listForCourse: async (courseId: string): Promise<Student[]> => {
    const [directory, enrollments] = await Promise.all([academicDirectory(), academicAppwriteApi.enrollments.list()])
    const enrolledStudentIds = new Set(enrollments
      .filter((enrollment) => enrollment.courseId === courseId && enrollment.status !== 'INACTIVE')
      .map((enrollment) => enrollment.studentId))
    return directory
      .filter((entry) => enrolledStudentIds.has(entry.userId))
      .filter((entry) => entry.role === 'STUDENT' || entry.role === 'DELEGATE')
      .map(asStudent)
  },
  listForAdmin: async (selection?: ScopeSelection): Promise<Student[]> => {
    const entries = (await adminDirectoryEntries()).filter(isLearner)
    const scoped = selection?.program || selection?.level ? entries.filter((entry) => matchesScope(entry, mergeScope({}, selection))) : entries
    return scoped.map(asAdminStudent)
  },
  getOne: async (id: string) => refreshStudent(id),
  create: async (dto: Partial<Student> & { userId?: string; levelId?: string; specialtyId?: string; email?: string; password?: string; role?: 'STUDENT' | 'DELEGATE' }) => {
    await requireAdminDirectoryAccess()
    if (!dto.email) throw new ApiError(400, 'Une adresse email est requise pour créer le compte étudiant.')
    if (!dto.password) throw new ApiError(400, 'Un mot de passe initial est requis pour créer le compte étudiant.')
    const result = await executeAdminDirectoryAction({ action: 'create', name: fullName(dto.firstName, dto.lastName), email: dto.email, password: dto.password, role: dto.role || 'STUDENT', matricule: dto.matricule, status: dto.status || 'ACTIVE' })
    invalidateAdminDirectoryCache()
    return refreshStudentForAdmin(result.userId as string)
  },
  update: async (id: string, dto: Partial<Student> & { email?: string; role?: 'STUDENT' | 'DELEGATE' }) => {
    await requireAdminDirectoryAccess()
    const existing = await refreshStudentForAdmin(id)
    const result = await executeAdminDirectoryAction({ action: 'update', userId: id, name: fullName(dto.firstName ?? existing.firstName, dto.lastName ?? existing.lastName), email: dto.email, role: dto.role || (existing.status === 'delegate' ? 'DELEGATE' : 'STUDENT'), matricule: dto.matricule ?? existing.matricule, status: dto.status || (existing.status === 'delegate' ? 'ACTIVE' : existing.status) })
    invalidateAdminDirectoryCache()
    return refreshStudentForAdmin(result.userId as string)
  },
  delete: async (id: string) => {
    await requireAdminDirectoryAccess()
    await executeAdminDirectoryAction({ action: 'delete', userId: id })
    invalidateAdminDirectoryCache()
  },
}
export const teachersApi = {
  list: async (): Promise<Teacher[]> => {
    const [directory, courses] = await Promise.all([academicDirectory(), academicAppwriteApi.courses.list()])
    return directory
      .filter((entry) => entry.role === 'TEACHER')
      .map((entry) => ({ ...asTeacher(entry), courses: courses.filter((course) => course.teacherId === entry.userId).map(asAcademicCourse) }))
  },
  listForAdmin: async (): Promise<Teacher[]> => {
    const [entries, courses] = await Promise.all([adminDirectoryEntries(), academicAppwriteApi.courses.list()])
    return entries
      .filter((entry) => entry.role === 'TEACHER')
      .map((entry) => ({ ...asAdminTeacher(entry), courses: courses.filter((course) => course.teacherId === entry.userId).map(asAcademicCourse) }))
  },
  getOne: async (id: string) => refreshTeacher(id),
  create: async (dto: Partial<Teacher> & { userId?: string; email?: string; password?: string }) => {
    await requireAdminDirectoryAccess()
    if (!dto.email) throw new ApiError(400, 'Une adresse email est requise pour créer le compte enseignant.')
    if (!dto.password) throw new ApiError(400, 'Un mot de passe initial est requis pour créer le compte enseignant.')
    const result = await executeAdminDirectoryAction({ action: 'create', name: fullName(dto.firstName, dto.lastName), email: dto.email, password: dto.password, role: 'TEACHER', matricule: '' })
    invalidateAdminDirectoryCache()
    return refreshTeacherForAdmin(result.userId as string)
  },
  update: async (id: string, dto: Partial<Teacher> & { email?: string }) => {
    await requireAdminDirectoryAccess()
    const existing = await refreshTeacherForAdmin(id)
    const result = await executeAdminDirectoryAction({ action: 'update', userId: id, name: fullName(dto.firstName ?? existing.firstName, dto.lastName ?? existing.lastName), email: dto.email, role: 'TEACHER' })
    invalidateAdminDirectoryCache()
    return refreshTeacherForAdmin(result.userId as string)
  },
  delete: async (id: string) => {
    await requireAdminDirectoryAccess()
    await executeAdminDirectoryAction({ action: 'delete', userId: id })
    invalidateAdminDirectoryCache()
  },
}

export interface AttendanceSession { id: string; date: string; createdAt?: string; createdBy?: string; courseId: string; course?: { name: string; code: string }; records: AttendanceRecord[] }
export interface AttendanceRecord { id: string; createdAt?: string; status: 'PRESENT' | 'ABSENT' | 'RETARD' | 'JUSTIFIE'; studentId: string; student?: { firstName: string; lastName: string; matricule: string } }

async function appwriteAttendanceSessions(): Promise<AttendanceSession[]> {
  const current = await getCurrentAccount('UNIVERSITY')
  if (!current) return []
  const [sessions, records, courses, directory] = await Promise.all([
    academicAppwriteApi.attendance.sessions(),
    academicAppwriteApi.attendance.records(),
    universityCourses(),
    academicDirectory(),
  ])
  const coursesById = new Map(courses.map((course) => [course.id, course]))
  const studentsById = new Map(directory.filter((entry) => entry.role === 'STUDENT' || entry.role === 'DELEGATE').map((entry) => [entry.userId, asStudent(entry)]))
  const isStudentView = current.role === 'STUDENT'

  return sessions
    .filter((session) => coursesById.has(session.courseId))
    .map((session) => {
      const course = coursesById.get(session.courseId)!
      const sessionRecords = records
        .filter((record) => record.sessionId === session.$id && (!isStudentView || record.studentId === current.id))
        .map((record) => {
          const student = studentsById.get(record.studentId)
          return {
            id: record.$id,
            createdAt: record.$createdAt,
            status: record.status,
            studentId: record.studentId,
            student: student ? { firstName: student.firstName, lastName: student.lastName, matricule: student.matricule } : undefined,
          }
        })
      return { id: session.$id, date: session.date, createdAt: session.$createdAt, createdBy: session.createdBy, courseId: session.courseId, course: { name: course.name, code: course.code }, records: sessionRecords }
    })
    .sort((a, b) => b.date.localeCompare(a.date))
}

export const attendanceApi = {
  bootstrap: async (): Promise<{ courses: Course[]; students: Student[] }> => {
    const current = await getCurrentAccount('UNIVERSITY')
    if (!current) throw new ApiError(401, 'Session Appwrite absente.')

    const courses = (await universityCourseDocuments()).courses.map(asAcademicCourse)
    return { courses, students: [] }
  },
  roster: async (courseId: string): Promise<Student[]> => {
    const { courses } = await attendanceApi.bootstrap()
    if (!courses.some((course) => course.id === courseId)) throw new ApiError(403, 'Ce cours n’est pas disponible pour votre rôle Appwrite.')
    return studentsApi.listForCourse(courseId)
  },
  listSessions: appwriteAttendanceSessions,
  byCourse: async (courseId: string): Promise<AttendanceSession[]> => (await appwriteAttendanceSessions()).filter((entry) => entry.courseId === courseId),
  /** Relevés de l'étudiant connecté, datés (heure de vérification, sinon création) — vide pour les autres rôles. */
  myRecords: async (): Promise<Array<{ status: AttendanceRecord['status']; at: string }>> => {
    const current = await getCurrentAccount('UNIVERSITY')
    if (!current || !isLearnerRole(current.role)) return []
    const records = await academicAppwriteApi.attendance.recordsByStudent(current.id)
    return records.map((record) => ({ status: record.status, at: record.verifiedAt || record.$createdAt || '' }))
  },
  /** Taux de présence de l'étudiant connecté (présents + retards), `null` sans relevé. */
  myRate: async (): Promise<number | null> => attendanceRate(await attendanceApi.myRecords()),
  /** Relevés de l'étudiant connecté avec le cours, pour le détail par cours du profil. */
  myRecordsByCourse: async (): Promise<Array<{ courseId: string; status: AttendanceRecord['status']; at: string }>> => {
    const current = await getCurrentAccount('UNIVERSITY')
    if (!current || !isLearnerRole(current.role)) return []
    const records = await academicAppwriteApi.attendance.recordsByStudent(current.id)
    return records.map((record) => ({ courseId: record.courseId || '', status: record.status, at: record.verifiedAt || record.$createdAt || '' }))
  },
  saveTodayRoll: async (dto: { courseId: string; date: string; rows: Array<{ studentId: string; status: AttendanceRecord['status'] }> }) => {
    const response = await executeAttendanceSecureAction({ action: 'roll', courseId: dto.courseId, date: dto.date, rows: dto.rows })
    if (!response.sessionId || !response.courseId || !response.date) throw new ApiError(502, 'La Function Appwrite n’a pas retourné la séance de présence.')
    return { id: response.sessionId, courseId: response.courseId, date: response.date }
  },
  openQrSession: async (dto: { courseId: string; date?: string; origin: { latitude: number; longitude: number; accuracy: number }; radiusMeters?: number }) => {
    const date = dto.date || new Date().toISOString()
    const session = await executeAttendanceSecureAction({ action: 'roll', courseId: dto.courseId, date, rows: [] })
    if (!session.sessionId || !session.courseId) throw new ApiError(502, 'La Function Appwrite n’a pas retourné la séance de présence.')
    const qr = await executeAttendanceSecureAction({ action: 'issue', sessionId: session.sessionId, courseId: session.courseId, origin: dto.origin, radiusMeters: dto.radiusMeters })
    if (!qr.token || !qr.expiresAt) throw new ApiError(502, 'La Function Appwrite n’a pas retourné de jeton QR exploitable.')
    return {
      token: qr.token,
      sessionId: session.sessionId,
      courseId: session.courseId,
      expiresAt: qr.expiresAt,
      payload: JSON.stringify({ type: 'uniflow-attendance', version: 1, token: qr.token }),
    }
  },
  scan: async (dto: { qrCode: string; position: { latitude: number; longitude: number; accuracy: number } }) => {
    let payload: { type?: string; version?: number; token?: string }
    try { payload = JSON.parse(dto.qrCode) as { type?: string; version?: number; token?: string } } catch {
      throw new ApiError(400, 'Ce code QR UniFlow est illisible.')
    }
    if (payload.type !== 'uniflow-attendance' || payload.version !== 1 || !payload.token) {
      throw new ApiError(400, 'Ce QR ne correspond pas à une séance UniFlow valide.')
    }

    const current = await getCurrentAccount('UNIVERSITY')
    if (!current) throw new ApiError(401, 'Session Appwrite absente.')
    if (current.role === 'TEACHER' || current.role === 'ADMIN') throw new ApiError(403, 'Utilisez un compte apprenant pour émarger avec ce QR.')

    const verified = await executeAttendanceSecureAction({ action: 'scan', token: payload.token, position: dto.position })
    if (!verified.recordId || !verified.sessionId || !verified.courseId) throw new ApiError(502, 'La Function Appwrite n’a pas retourné le relevé de présence.')
    return { id: verified.recordId, sessionId: verified.sessionId, courseId: verified.courseId, status: 'PRESENT' as const, alreadyRecorded: Boolean(verified.idempotent), distanceMeters: verified.distanceMeters, accuracyMeters: verified.accuracyMeters }
  },
}

export interface Classroom { id: string; name: string; building: string; floor?: number; capacity: number; type: string; isAvailable: boolean; equipment?: string[] }
export const classroomsApi = {
  list: async (): Promise<Classroom[]> => [],
  getOne: async (_id: string) => unavailable<Classroom>('Les salles'),
  create: async (_dto: Partial<Classroom>) => unavailable<Classroom>('Les salles'),
  update: async (_id: string, _dto: Partial<Classroom>) => unavailable<Classroom>('Les salles'),
  delete: async (_id: string) => unavailable<void>('Les salles'),
}

export interface Notification { id: string; title: string; message: string; type: string; isRead: boolean; createdAt: string }
async function appwriteNotifications(): Promise<Notification[]> {
  const current = await getCurrentAccount()
  if (!current) return []
  const rows = await listAppwriteNotifications(current.id)
  return rows.map((row) => ({ id: row.$id, title: row.title, message: row.message, type: row.type, isRead: row.isRead, createdAt: row.createdAt || '' }))
}
export interface SecurityAuditReport {
  ok: boolean
  healthy?: boolean
  checkedAt?: string
  collections?: Record<string, number>
  duplicates?: Record<string, number>
  orphaned?: Record<string, number>
  invalidRecords?: number
}

export const securityAuditApi = {
  run: async (): Promise<SecurityAuditReport> => executeAttendanceSecureAction({ action: 'audit' }),
}

export const notificationsApi = {
  list: appwriteNotifications,
  unreadCount: async () => (await appwriteNotifications()).filter((item) => !item.isRead).length,
  markRead: async (id: string) => {
    await markAppwriteNotificationRead(id)
    return (await appwriteNotifications()).find((item) => item.id === id) as Notification
  },
  delete: (id: string) => deleteAppwriteNotification(id),
}

export interface Assignment { id: string; title: string; code: string; due: string; progress: number; status: 'À rendre' | 'En retard' | 'Soumis' | 'Noté'; grade?: string; description?: string; feedback?: string; submittedAt?: string; submittedFile?: string; submissionNote?: string }
function asAssignment(item: PersonalAssignment): Assignment {
  const status = item.status === 'Soumis' || item.status === 'Noté' || item.status === 'En retard' ? item.status : 'À rendre'
  return { id: item.id, title: item.title, code: item.courseId, due: item.dueDate, progress: status === 'Soumis' || status === 'Noté' ? 100 : 0, status, description: item.description }
}
async function personalAssignments(): Promise<Assignment[]> {
  if (getAccountType() !== 'PERSONAL') return []
  return (await personalAppwriteApi.assignments.list()).map(asAssignment)
}
async function universityAssignments(): Promise<Assignment[]> {
  const current = await getCurrentAccount('UNIVERSITY')
  if (!current) return []
  const [rows, courses] = await Promise.all([academicAppwriteApi.assignments.list(), universityCourses()])
  const allowedCourseIds = new Set(courses.map((course) => course.id))
  const legacyStatus = (item: { status?: string }) => item.status === 'Soumis' || item.status === 'Noté' || item.status === 'En retard' ? item.status : 'À rendre'
  const asLegacy = (item: (typeof rows)[number]): Assignment => ({
    id: item.$id,
    title: item.title,
    code: item.courseId,
    due: item.dueDate,
    progress: item.status === 'Soumis' || item.status === 'Noté' ? 100 : 0,
    status: legacyStatus(item),
    grade: item.grade || undefined,
    description: item.description || undefined,
    feedback: item.feedback || undefined,
    submittedAt: item.submittedAt || undefined,
    submittedFile: item.submittedFile || undefined,
    submissionNote: item.submissionNote || undefined,
  })

  if (current.role === 'TEACHER') {
    return rows
      .filter((item) => item.teacherId === current.id || allowedCourseIds.has(item.courseId))
      .map(asLegacy)
  }

  // Étudiant ou délégué : ses devoirs « par étudiant » plus les énoncés publiés
  // qui visent sa filière et son niveau (ou tout un de ses cours), avec l'état
  // de son rendu. Le web n'affichait que les premiers : « Devoirs à rendre : 0 »
  // devant trois énoncés publiés pour ICT4D L1.
  const statements = rows.filter((item) => isPublishedStatement(item)
    && (allowedCourseIds.size === 0 || allowedCourseIds.has(item.courseId) || Boolean(item.audience))
    && matchesAudience(item.audience, { program: current.program, level: current.level }))
  const submissions = statements.length ? await academicAppwriteApi.submissions.byStudent(current.id).catch(() => []) : []
  const submissionByAssignment = new Map(submissions.map((submission) => [submission.assignmentId, submission]))
  const published = statements.map((item): Assignment => {
    const submission = submissionByAssignment.get(item.$id)
    const status = learnerStatus(submission, item.dueDate)
    return {
      id: item.$id,
      title: item.title,
      code: item.courseCode || item.courseId,
      due: item.dueDate,
      progress: status === 'Soumis' || status === 'Noté' ? 100 : 0,
      status,
      grade: formatSubmissionGrade(submission, item.maxScore) || undefined,
      description: item.description || undefined,
      feedback: submission?.feedback || undefined,
      submittedAt: submission?.submittedAt || undefined,
      submittedFile: submission?.fileName || undefined,
      submissionNote: undefined,
    }
  })
  const own = rows.filter((item) => item.studentId === current.id).map(asLegacy)
  return [...own, ...published].sort((a, b) => String(a.due).localeCompare(String(b.due)))
}
export const assignmentsApi = {
  list: async () => getAccountType() === 'PERSONAL' ? personalAssignments() : universityAssignments(),
  mine: async () => getAccountType() === 'PERSONAL' ? personalAssignments() : universityAssignments(),
  create: async (dto: Partial<Assignment>) => {
    if (getAccountType() !== 'PERSONAL') return unavailable<Assignment>('Les devoirs universitaires')
    return asAssignment(await personalAppwriteApi.assignments.create({ courseId: dto.code || '', title: dto.title || '', dueDate: dto.due || '', description: dto.description || '', priority: 'MEDIUM', status: dto.status || 'TODO' }))
  },
  update: async (id: string, dto: Partial<Assignment>) => {
    if (getAccountType() !== 'PERSONAL') return unavailable<Assignment>('Les devoirs universitaires')
    return asAssignment(await personalAppwriteApi.assignments.update(id, { ...(dto.code ? { courseId: dto.code } : {}), ...(dto.title ? { title: dto.title } : {}), ...(dto.due ? { dueDate: dto.due } : {}), ...(dto.description ? { description: dto.description } : {}), ...(dto.status ? { status: dto.status } : {}) }))
  },
  submit: async (id: string, _fileInfo?: string) => assignmentsApi.update(id, { status: 'Soumis' }),
  delete: async (id: string) => {
    if (getAccountType() !== 'PERSONAL') return unavailable<void>('Les devoirs universitaires')
    return personalAppwriteApi.assignments.delete(id)
  },
}

/** Énoncé publié par un enseignant, avec ses rendus (`academic_submissions`). */
export interface PublishedStatement {
  id: string
  courseId: string
  title: string
  description: string
  dueDate: string
  type: string
  maxScore: number
  allowLate: boolean
  publishedAt: string
  teacherId: string
  submissions: Array<{ id: string; studentId: string; studentName: string; submittedAt: string; score: number | null; status: string }>
}

export interface PublishStatementInput {
  courseId: string
  courseCode: string
  title: string
  description?: string
  /** ISO UTC. */
  dueDate: string
  type?: string
  maxScore?: number
  allowLate?: boolean
}

/**
 * Côté enseignant : les énoncés d'un cours et leurs rendus. Remplace la liste
 * codée en dur de l'onglet « Devoirs » de l'espace pédagogique (« 45
 * soumissions, 23 corrigés » affichés quel que soit le cours).
 */
export const teacherStatementsApi = {
  forCourse: async (courseId: string): Promise<PublishedStatement[]> => {
    const rows = (await academicAppwriteApi.assignments.byCourse(courseId)).filter(isPublishedStatement)
    const submissions = await academicAppwriteApi.submissions.byAssignments(rows.map((row) => row.$id))
    return rows
      .map((row) => ({
        id: row.$id,
        courseId: row.courseId,
        title: row.title,
        description: row.description || '',
        dueDate: row.dueDate,
        type: row.type || 'DEVOIR',
        maxScore: Number(row.maxScore ?? 20),
        allowLate: Boolean(row.allowLate),
        publishedAt: row.publishedAt || '',
        teacherId: row.teacherId || '',
        submissions: submissions
          .filter((submission) => submission.assignmentId === row.$id)
          .map((submission) => ({ id: submission.$id, studentId: submission.studentId, studentName: submission.studentName || '', submittedAt: submission.submittedAt, score: submission.score ?? null, status: submission.status || 'SUBMITTED' })),
      }))
      .sort((a, b) => b.dueDate.localeCompare(a.dueDate))
  },
  publish: async (input: PublishStatementInput): Promise<PublishedStatement> => {
    const current = await getCurrentAccount('UNIVERSITY')
    if (!current) throw new Error('Session expirée : reconnectez-vous pour publier un devoir.')
    if (current.role !== 'TEACHER' && current.role !== 'ADMIN') throw new Error('Seul un enseignant peut publier un devoir.')
    const created = await academicAppwriteApi.assignments.publish({
      courseId: input.courseId,
      courseCode: input.courseCode,
      title: input.title.trim(),
      description: (input.description || '').trim(),
      dueDate: input.dueDate,
      status: 'À rendre',
      teacherId: current.id,
      teacherName: current.name,
      type: input.type || 'DEVOIR',
      maxScore: input.maxScore ?? 20,
      allowLate: Boolean(input.allowLate),
      publishedAt: new Date().toISOString(),
    }, current.id)
    return { id: created.$id, courseId: created.courseId, title: created.title, description: created.description || '', dueDate: created.dueDate, type: created.type || 'DEVOIR', maxScore: Number(created.maxScore ?? 20), allowLate: Boolean(created.allowLate), publishedAt: created.publishedAt || '', teacherId: created.teacherId || '', submissions: [] }
  },
  remove: (id: string) => academicAppwriteApi.assignments.remove(id),
}

export interface Grade { id: string; studentId?: string; ue: string; code: string; title: string; type: string; coef: number; grade: number; maxScore: number; classAvg: number; rank: number; maxRank: number }
async function personalGrades(): Promise<Grade[]> {
  if (getAccountType() !== 'PERSONAL') return []
  return (await personalAppwriteApi.grades.list()).map((item) => ({ id: item.id, ue: '', code: item.courseId, title: item.evaluationTitle, type: '', coef: item.coefficient, grade: item.score, maxScore: item.maxScore, classAvg: 0, rank: 0, maxRank: 0 }))
}
async function universityGrades(): Promise<Grade[]> {
  const current = await getCurrentAccount('UNIVERSITY')
  if (!current) return []
  const [rows, { courses }] = await Promise.all([academicAppwriteApi.grades.list(), universityCourseDocuments()])
  const allowedCourseIds = new Set(courses.map((course) => course.$id))
  const unitOf = new Map(courses.map((course) => [course.$id, `${course.program} ${course.level}`]))
  return rows
    .filter((item) => current.role === 'TEACHER' ? allowedCourseIds.has(item.courseId) : item.studentId === current.id)
    .map((item) => ({
      id: item.$id,
      studentId: item.studentId,
      ue: unitOf.get(item.courseId) || [current.program, current.level].filter(Boolean).join(' '),
      code: item.courseCode,
      title: item.evaluationTitle,
      type: item.type || 'CC',
      coef: item.coefficient || 1,
      grade: Number(item.score),
      maxScore: Number(item.maxScore || 20),
      classAvg: 0,
      rank: 0,
      maxRank: 0,
    }))
}
export const gradesApi = {
  mine: async () => getAccountType() === 'PERSONAL' ? personalGrades() : universityGrades(),
  roster: async (courseId: string) => {
    if (getAccountType() !== 'UNIVERSITY') return unavailable<{ students: Array<{ id: string; name: string; matricule: string }>; grades: Grade[] }>('Les évaluations universitaires')
    const [response, { courses }] = await Promise.all([executeAcademicGradesAction({ action: 'roster', courseId }), universityCourseDocuments()])
    const course = courses.find((item) => item.$id === courseId)
    const ue = course ? `${course.program} ${course.level}` : ''
    return {
      students: (response.students || []).map((student) => ({ id: student.userId, name: student.name, matricule: student.matricule })),
      grades: (response.grades || []).map((item) => ({ id: item.id, studentId: item.studentId, ue, code: item.courseCode, title: item.evaluationTitle, type: item.type, coef: item.coefficient, grade: item.score, maxScore: item.maxScore, classAvg: 0, rank: 0, maxRank: 0 })),
    }
  },
  upsertUniversity: async (dto: { courseId: string; studentId: string; evaluationTitle: string; type: string; score: number; maxScore: number; coefficient: number }) => {
    const response = await executeAcademicGradesAction({ action: 'upsert', ...dto })
    const item = response.grade
    if (!item) throw new ApiError(502, 'La Function Appwrite n’a pas retourné la note enregistrée.')
    return { id: item.id, studentId: item.studentId, ue: '', code: item.courseCode, title: item.evaluationTitle, type: item.type, coef: item.coefficient, grade: item.score, maxScore: item.maxScore, classAvg: 0, rank: 0, maxRank: 0 } as Grade
  },
  deleteUniversity: async (dto: { courseId: string; studentId: string; gradeId: string }) => {
    await executeAcademicGradesAction({ action: 'delete', ...dto })
  },
  create: async (dto: Partial<Grade>) => {
    if (getAccountType() !== 'PERSONAL') return unavailable<Grade>('Les notes universitaires')
    const created = await personalAppwriteApi.grades.create({ courseId: dto.code || '', evaluationTitle: dto.title || '', score: dto.grade || 0, maxScore: 20, coefficient: dto.coef || 1 })
    return { id: created.id, ue: '', code: created.courseId, title: created.evaluationTitle, type: '', coef: created.coefficient, grade: created.score, maxScore: created.maxScore, classAvg: 0, rank: 0, maxRank: 0 }
  },
}

export interface ChatMessage { id: string; from: 'me' | 'them'; text: string; time: string; file?: string }
export interface ChatConversation {
  id: string
  name: string
  role: string
  email: string
  /** Pseudo du contact : le référent de la messagerie. */
  username?: string
  /** Photo de profil du contact, si elle a été téléversée. */
  avatarFileId?: string
  online: boolean
  time: string
  preview: string
  unread: number
  messages: ChatMessage[]
}
export interface ChatContact {
  userId: string
  name: string
  email: string
  username: string
  avatarFileId: string
  role: string
}
const asChatTime = (value: string) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}
const asChatConversation = (conversation: Awaited<ReturnType<typeof executeMessagingAction>>['conversation']): ChatConversation => {
  if (!conversation) throw new ApiError(500, 'La messagerie Appwrite a renvoyé une conversation incomplète.')
  return {
    ...conversation,
    time: asChatTime(conversation.time),
    messages: conversation.messages.map((message) => ({ ...message, time: asChatTime(message.time) })),
  }
}
export const messagingApi = {
  conversations: async (): Promise<ChatConversation[]> => {
    if (getAccountType() !== 'UNIVERSITY') return []
    const response = await executeMessagingAction({ action: 'list' })
    return (response.conversations || []).map((conversation) => asChatConversation(conversation))
  },
  openByEmail: async (email: string): Promise<ChatConversation> => asChatConversation((await executeMessagingAction({ action: 'open', email })).conversation),
  /** Ouvre (ou crée) la conversation avec le compte portant ce pseudo. */
  openByUsername: async (username: string): Promise<ChatConversation> => asChatConversation((await executeMessagingAction({ action: 'open', username })).conversation),
  /** Recherche des contacts par pseudo ou par nom, pour le sélecteur. */
  searchContacts: async (query: string): Promise<ChatContact[]> => {
    const response = await executeMessagingAction({ action: 'search', query })
    return (response.contacts || []) as ChatContact[]
  },
  sendMessage: async (convId: string, text: string): Promise<ChatConversation> => asChatConversation((await executeMessagingAction({ action: 'send', conversationId: convId, text })).conversation),
  markRead: async (convId: string): Promise<number> => (await executeMessagingAction({ action: 'read', conversationId: convId })).markedRead || 0,
}

export interface LibraryResource { id: string; courseId: string; title: string; course: string; type: string; size: string; date: string; category: string; duration?: string; fileId?: string; description?: string }
const asLibraryResource = (resource: Awaited<ReturnType<typeof academicAppwriteApi.library.list>>[number]): LibraryResource => ({
  id: resource.$id,
  courseId: resource.courseId,
  title: resource.title,
  course: resource.course,
  type: resource.type,
  size: resource.size || '',
  date: resource.publishedAt,
  category: resource.category,
  fileId: resource.fileId || undefined,
  description: resource.description || undefined,
})
export const libraryApi = {
  list: async (): Promise<LibraryResource[]> => {
    if (getAccountType() === 'PERSONAL') return []
    return (await academicAppwriteApi.library.list()).map(asLibraryResource)
  },
  forCourse: async (courseId: string): Promise<LibraryResource[]> =>
    (await academicAppwriteApi.library.byCourse(courseId)).map(asLibraryResource).sort((a, b) => (b.date || '').localeCompare(a.date || '')),
  /**
   * Publication d'un support par l'enseignant : le fichier part dans le bucket
   * et la fiche dans `academic_library`, comme sur le desktop. Le formulaire
   * web simulait jusqu'ici un téléversement (barre de progression sur minuterie)
   * sans rien enregistrer.
   */
  upload: async (file: File, course: Pick<Course, 'id' | 'code' | 'name'>, meta: { title: string; category: string; description?: string }): Promise<LibraryResource> => {
    const current = await getCurrentAccount('UNIVERSITY')
    if (!current) throw new Error('Session expirée : reconnectez-vous pour publier une ressource.')
    const created = await academicAppwriteApi.library.publish(file, {
      title: meta.title.trim() || file.name,
      courseId: course.id,
      course: `${course.code} · ${course.name}`,
      type: fileKind(file.name),
      category: meta.category,
      size: humanFileSize(file.size),
      description: (meta.description || '').trim(),
    }, current.id)
    return asLibraryResource(created)
  },
  remove: (resource: LibraryResource) => academicAppwriteApi.library.remove({ $id: resource.id, fileId: resource.fileId || '' }),
  downloadUrl: (resource: LibraryResource) => (resource.fileId ? academicAppwriteApi.library.downloadUrl(resource.fileId) : null),
}

export interface UE {
  id: string
  name: string
  code: string
  program?: string
  level?: string
  credits: number
  hours: number
  teacherName: string
  type: string
  classroom: string
  enrollmentCount: number
  scheduleCount: number
  scheduledHours: number
  courses?: Course[]
}

function scheduleHours(startTime: string, endTime: string) {
  const toMinutes = (value: string) => {
    const [hour = '0', minute = '0'] = value.split(':')
    return Number(hour) * 60 + Number(minute)
  }
  const duration = toMinutes(endTime) - toMinutes(startTime)
  return duration > 0 ? duration / 60 : 0
}

async function academicTeachingUnits(selection?: ScopeSelection): Promise<UE[]> {
  const { current, scope } = await currentScope(selection)
  if (!current || current.role !== 'ADMIN') {
    throw new ApiError(403, 'La consultation du référentiel pédagogique Appwrite est réservée au rôle administrateur.')
  }

  const [courses, schedules, enrollments] = await Promise.all([
    academicAppwriteApi.courses.list(scope),
    academicAppwriteApi.schedules.list(scope),
    academicAppwriteApi.enrollments.list(),
  ])

  return filterByScope(courses, scope)
    .map((course) => {
      const courseSchedules = schedules.filter((schedule) => schedule.courseId === course.$id)
      return {
        id: course.$id,
        name: course.name,
        code: course.code,
        program: course.program,
        level: course.level,
        credits: Number(course.credits || 0),
        hours: Number(course.hours || 0),
        teacherName: course.teacherName || 'Non renseigné',
        type: course.type || 'Non renseigné',
        classroom: course.classroom || 'Non renseignée',
        enrollmentCount: enrollments.filter((enrollment) => enrollment.courseId === course.$id).length,
        scheduleCount: courseSchedules.length,
        scheduledHours: courseSchedules.reduce((total, schedule) => total + scheduleHours(schedule.startTime, schedule.endTime), 0),
      }
    })
    .sort((left, right) => left.code.localeCompare(right.code))
}

export const ueApi = {
  list: () => academicTeachingUnits(),
  listScoped: (selection: ScopeSelection) => academicTeachingUnits(selection),
  byLevel: async (level: string): Promise<UE[]> => academicTeachingUnits({ level }),
  bySemester: async (_id: string): Promise<UE[]> => unavailable<UE[]>('Les semestres d’unités d’enseignement'),
  getOne: async (id: string) => {
    const unit = (await academicTeachingUnits()).find((item) => item.id === id)
    if (!unit) throw new ApiError(404, 'Unité d’enseignement introuvable dans le référentiel Appwrite.')
    return unit
  },
  create: async (_dto: Partial<UE> & { levelId?: string; semesterId?: string }) => unavailable<UE>('Les unités d’enseignement'),
  update: async (_id: string, _dto: Partial<UE>) => unavailable<UE>('Les unités d’enseignement'),
  delete: async (_id: string) => unavailable<void>('Les unités d’enseignement'),
}

export interface AuditLog { id: string; userId?: string; userRole?: string; action: string; resource: string; resourceId?: string; ipAddress?: string; userAgent?: string; statusCode?: number; details?: unknown; createdAt: string }
export const auditLogsApi = { list: async (_page = 1, _limit = 50, _resource?: string): Promise<AuditLog[]> => [], getOne: async (_id: string) => unavailable<AuditLog>('Le journal d’audit') }
export const usersApi = {
  listAll: async (): Promise<Array<Student & { type: 'student' } | Teacher & { type: 'teacher' }>> => {
    const current = await getCurrentAccount('UNIVERSITY')
    if (!current || current.role !== 'ADMIN') throw new ApiError(403, 'La consultation du répertoire complet est réservée au rôle administrateur Appwrite.')
    const [directory, profiles] = await Promise.all([
      academicDirectory(),
      listDocuments<{ $id: string; email?: string }>('users'),
    ])
    const emailById = new Map(profiles.map((profile) => [profile.$id, profile.email || '']))
    const users: Array<Student & { type: 'student' } | Teacher & { type: 'teacher' }> = []
    for (const entry of directory) {
      if (entry.role === 'ADMIN') continue
      if (entry.role === 'TEACHER') {
        users.push({ ...asTeacher(entry), user: { email: emailById.get(entry.userId) || '' }, type: 'teacher' })
      } else {
        users.push({ ...asStudent(entry), user: { email: emailById.get(entry.userId) || '' }, type: 'student' })
      }
    }
    return users
  },
}

export interface OverviewStats { studentCount: number; teacherCount: number; courseCount: number; satisfactionRate: number; supportAvailability: string; assignmentCount?: number; gradeCount?: number; averageGrade?: number | null; attendanceRate?: number | null }
export const statsApi = {
  overview: async (): Promise<OverviewStats> => {
    if (getAccountType() !== 'PERSONAL') {
      const [directory, courses, assignments, grades, records] = await Promise.all([
        academicDirectory(),
        academicAppwriteApi.courses.list(),
        academicAppwriteApi.assignments.list(),
        academicAppwriteApi.grades.list(),
        academicAppwriteApi.attendance.records(),
      ])
      const attendanceRate = records.length
        ? Math.round((records.filter((record) => record.status === 'PRESENT' || record.status === 'RETARD').length / records.length) * 100)
        : null
      const averageGrade = grades.length
        ? grades.reduce((sum, grade) => sum + (Number(grade.score) / Math.max(Number(grade.maxScore || 20), 1)) * 20, 0) / grades.length
        : null
      return {
        studentCount: directory.filter((entry) => entry.role === 'STUDENT' || entry.role === 'DELEGATE').length,
        teacherCount: directory.filter((entry) => entry.role === 'TEACHER').length,
        courseCount: courses.length,
        satisfactionRate: 0,
        supportAvailability: 'Appwrite KERNEL FORGE',
        assignmentCount: assignments.length,
        gradeCount: grades.length,
        averageGrade,
        attendanceRate,
      }
    }
    const [courses, assignments, grades] = await Promise.all([personalAppwriteApi.courses.list(), personalAppwriteApi.assignments.list(), personalAppwriteApi.grades.list()])
    const averageGrade = grades.length ? grades.reduce((sum, item) => sum + (item.score / Math.max(item.maxScore, 1)) * 20, 0) / grades.length : null
    return { studentCount: 0, teacherCount: 0, courseCount: courses.length, satisfactionRate: 0, supportAvailability: 'Appwrite KERNEL FORGE', assignmentCount: assignments.length, gradeCount: grades.length, averageGrade, attendanceRate: null }
  },
}

export interface Enrollment { id: string; status: string; teachingUnitId: string; teachingUnit?: { name: string; code: string; credits: number } }
export const enrollmentsApi = {
  mine: async (): Promise<Enrollment[]> => [], list: async (): Promise<Enrollment[]> => [], byStudent: async (_studentId: string): Promise<Enrollment[]> => [], byUe: async (_ueId: string): Promise<Enrollment[]> => [],
  create: async (_dto: { studentId: string; teachingUnitId: string }) => unavailable<Enrollment>('Les inscriptions pédagogiques'),
  updateStatus: async (_id: string, _status: string) => unavailable<Enrollment>('Les inscriptions pédagogiques'),
}
export const filesApi = { upload: async (_formData: FormData) => unavailable<unknown>('Le dépôt de fichiers') }

export interface UserSettings { notifications?: Record<string, boolean>; privacy?: Record<string, boolean>; advanced?: Record<string, boolean>; language?: string }
export const settingsApi = {
  get: async (): Promise<UserSettings> => {
    const profile = await appwriteAccount.get()
    return (profile.prefs?.uniflowSettings as UserSettings | undefined) || {}
  },
  update: async (settings: UserSettings): Promise<UserSettings> => {
    const profile = await appwriteAccount.get()
    await appwriteAccount.updatePrefs({ ...profile.prefs, uniflowSettings: settings })
    return settings
  },
}
export interface SupportTicket { id?: string; message: string; category?: string; status?: string }
export const supportApi = { faqs: async (): Promise<Array<{ q: string; a: string; cat: string }>> => [], sendTicket: async (_ticket: SupportTicket) => unavailable<SupportTicket>('Le support') }

export interface SubscriptionPlan { id: string; code: string; name: string; category: 'PERSONAL' | 'TEACHER' | 'INSTITUTION' | 'ACADEMIC'; countryCode?: string; currency?: string; priceMonthlyAmount: number; priceAnnuallyAmount: number; priceMonthly: string; priceAnnually: string; period: string; badge?: string; highlight?: boolean; description: string; btnText: string; btnVariant?: string; providers: string[]; features: string[]; status?: 'ACTIVE' | 'INACTIVE' }
export interface PricingInfo { countryCode: string; currency: 'XAF' | 'EUR' | 'USD'; amount: number; formattedPrice: string; billingInterval: string; providers: string[] }
export interface SubscriptionStatus { status: 'NONE' | 'PENDING' | 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'EXPIRED'; planCode?: string | null; countryCode?: string | null; currency?: string | null; monthlyAmount?: number | null; currentPeriodEnd?: string | null; isAutoRenew: boolean }
export interface CheckoutResult { transactionId?: string; paymentUrl?: string; status?: string; message?: string; requestedAt?: string }
export type CheckoutPayload = { planId?: string; planCode: string; countryCode: string; paymentProvider?: string; phoneNumber?: string; billingInterval?: 'MONTHLY' | 'ANNUALLY'; billingCycle: 'monthly' | 'annually'; email?: string; fullName?: string; institution?: string }
export type SubscriptionPaymentRequest = SubscriptionPaymentRecord
export interface AdminPaymentFilters { status?: SubscriptionPaymentRequest['status']; planCode?: string; from?: string; to?: string; search?: string }

/** `providers` et `features` sont des tableaux JSON sérialisés dans un attribut chaîne. */
function subscriptionProviders(value?: string): string[] {
  try {
    const parsed = value ? JSON.parse(value) : []
    return Array.isArray(parsed) ? parsed.filter((provider): provider is string => typeof provider === 'string') : []
  } catch {
    return []
  }
}

function subscriptionButtonText(row: SubscriptionPlanDocument): string {
  if (row.category === 'INSTITUTION') return 'Demander une étude'
  return row.priceMonthlyAmount === 0 ? 'Accès inclus' : 'Payer par WhatsApp'
}

function money(amount: number, currency: string) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: currency === 'EUR' || currency === 'USD' ? currency : 'XAF', maximumFractionDigits: 0 }).format(amount)
}

async function appwriteSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  const rows = await academicAppwriteApi.subscriptions.listPlans()
  return rows.map((row) => ({
    id: row.$id,
    code: row.code,
    name: row.name,
    category: row.category,
    countryCode: row.countryCode,
    currency: row.currency,
    priceMonthlyAmount: row.priceMonthlyAmount,
    priceAnnuallyAmount: row.priceAnnuallyAmount,
    priceMonthly: money(row.priceMonthlyAmount, row.currency),
    priceAnnually: money(row.priceAnnuallyAmount, row.currency),
    period: row.period || 'Accès académique',
    badge: row.badge || undefined,
    highlight: !!row.highlight,
    description: row.description,
    btnText: subscriptionButtonText(row),
    btnVariant: row.highlight ? 'primary' : 'secondary',
    providers: subscriptionProviders(row.providers),
    features: subscriptionProviders(row.features),
    status: row.status,
  }))
}

async function appwriteSubscriptionStatus(): Promise<SubscriptionStatus> {
  const current = await getCurrentAccount()
  if (!current) throw new ApiError(401, 'Connectez-vous pour consulter votre statut de souscription.')
  const row = await academicAppwriteApi.subscriptions.getStatus(current.id)
  if (!row) {
    const requests = await executeSubscriptionPaymentAction({ action: 'list' })
    const pending = requests.requests?.find((request) => request.status === 'PENDING')
    if (pending) return { status: 'PENDING', planCode: pending.planCode, countryCode: 'CM', currency: pending.currency, monthlyAmount: pending.amount, currentPeriodEnd: null, isAutoRenew: false }
    return { status: 'NONE', isAutoRenew: false }
  }
  return {
    status: row.status,
    planCode: row.planCode || null,
    countryCode: row.countryCode || null,
    currency: row.currency || null,
    monthlyAmount: row.monthlyAmount ?? null,
    currentPeriodEnd: row.currentPeriodEnd || null,
    isAutoRenew: !!row.isAutoRenew,
  }
}

export const subscriptionApi = {
  getPlans: appwriteSubscriptionPlans,
  getPlanById: async (id: string) => (await appwriteSubscriptionPlans()).find((plan) => plan.id === id || plan.code === id) || null,
  getPricing: async (countryCode = 'CM') => {
    const plan = (await appwriteSubscriptionPlans()).find((item) => item.countryCode === countryCode) || (await appwriteSubscriptionPlans())[0]
    if (!plan) throw new ApiError(404, 'Aucune formule active n’est enregistrée dans Appwrite.')
    return { countryCode: plan.countryCode || countryCode, currency: (plan.currency || 'XAF') as PricingInfo['currency'], amount: plan.priceMonthlyAmount, formattedPrice: plan.priceMonthly, billingInterval: 'MONTHLY', providers: plan.providers }
  },
  getStatus: appwriteSubscriptionStatus,
  createCheckout: async (payload: CheckoutPayload) => {
    const plan = await subscriptionApi.getPlanById(payload.planCode)
    if (!plan) throw new ApiError(404, 'La formule demandée n’existe pas dans Appwrite.')
    if (plan.priceMonthlyAmount === 0) return { status: 'ACTIVE', message: 'L’accès académique gratuit est déjà inclus dans cette formule Appwrite.' }
    const result = await executeSubscriptionPaymentAction({
      action: 'create',
      planCode: plan.code,
      billingCycle: payload.billingCycle === 'annually' ? 'ANNUALLY' : 'MONTHLY',
      fullName: payload.fullName || '',
      email: payload.email || '',
      phoneNumber: payload.phoneNumber || '',
      institution: payload.institution || '',
    })
    if (!result.request) throw new ApiError(502, 'Appwrite n’a pas retourné de référence de demande de paiement.')
    return { transactionId: result.request.reference, paymentUrl: result.request.whatsappUrl, status: result.request.status, message: result.idempotent ? 'Votre demande de paiement en attente a été retrouvée.' : 'Votre demande a été enregistrée. Envoyez la preuve de paiement sur WhatsApp avec cette référence.', requestedAt: result.request.requestedAt }
  },
  listPaymentRequests: async (): Promise<SubscriptionPaymentRequest[]> => (await executeSubscriptionPaymentAction({ action: 'list' })).requests || [],
  listPaymentRequestsForAdmin: async (filters: AdminPaymentFilters = {}): Promise<SubscriptionPaymentRequest[]> => (await executeSubscriptionPaymentAction({ action: 'admin-list', ...filters })).requests || [],
  /** Valide : passe la demande en CONFIRMED et active `subscription_statuses`. */
  validatePaymentRequest: async (requestId: string, adminNote = ''): Promise<SubscriptionPaymentRequest> => {
    const result = await executeSubscriptionPaymentAction({ action: 'validate', requestId, adminNote })
    if (!result.request) throw new ApiError(502, 'Appwrite n’a pas retourné la demande traitée.')
    return result.request
  },
  /** Rejette : le motif est obligatoire, la Function le refuse sinon (INVALID_ADMIN_NOTE). */
  rejectPaymentRequest: async (requestId: string, reason: string): Promise<SubscriptionPaymentRequest> => {
    const result = await executeSubscriptionPaymentAction({ action: 'reject', requestId, reason })
    if (!result.request) throw new ApiError(502, 'Appwrite n’a pas retourné la demande traitée.')
    return result.request
  },
}
export const personalSubscriptionApi = subscriptionApi
