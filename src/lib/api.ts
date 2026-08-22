import {
  appwriteAccount,
  getCurrentAccount,
  listAppwriteNotifications,
  markAppwriteNotificationRead,
  deleteAppwriteNotification,
  personalAppwriteApi,
} from './appwrite'

/**
 * Adaptateur de compatibilité UniFlow.
 *
 * L’application ne communique plus avec les deux API NestJS historiques. Les
 * lectures et écritures personnelles passent directement par le SDK Appwrite,
 * configuré dans `appwrite.ts` avec le seul endpoint autorisé du VPS. Les
 * fonctionnalités dont la collection Appwrite n’est pas encore provisionnée
 * retournent un état explicite et n’émettent jamais de requête HTTP de repli.
 */
export const APPWRITE_VPS_ENDPOINT = 'https://185.181.10.106/v1'

// Alias de compatibilité : aucun de ces exports ne désigne un backend legacy.
export const UNIVERSITY_API_URL = APPWRITE_VPS_ENDPOINT
export const PERSONAL_API_URL = APPWRITE_VPS_ENDPOINT
export const BASE_URL = APPWRITE_VPS_ENDPOINT

export type AccountType = 'UNIVERSITY' | 'PERSONAL'

export function getAccountType(): AccountType {
  try {
    return localStorage.getItem('uniflow_account_type') === 'PERSONAL' ? 'PERSONAL' : 'UNIVERSITY'
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
    universityCode: user.accountType === 'UNIVERSITY' ? 'UY1' : undefined,
  }
}

export interface AcademicLevel { id: string; name: string; programName: string }
export interface SpecialtyOption { id: string; name: string; levelId: string }
const academicLevels: AcademicLevel[] = ['L1', 'L2', 'L3'].map((name) => ({ id: name, name, programName: 'ICT4D' }))
const academicSpecialties: SpecialtyOption[] = academicLevels.map((level) => ({ id: `ICT4D-${level.id}`, name: 'ICT4D', levelId: level.id }))

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

export const coursesApi = {
  list: personalCourses,
  mine: personalCourses,
  getOne: async (id: string) => {
    const course = (await personalCourses()).find((item) => item.id === id)
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
export const schedulesApi = {
  list: personalSchedules,
  mine: personalSchedules,
  create: async (dto: Partial<Schedule>) => {
    if (getAccountType() !== 'PERSONAL') return unavailable<Schedule>('Les créneaux universitaires')
    const created = await personalAppwriteApi.schedules.create({ courseId: dto.course?.id || '', dayOfWeek: dto.dayOfWeek || 'LUNDI', startTime: dto.startTime || '00:00', endTime: dto.endTime || dto.startTime || '00:00', classroom: dto.course?.classroom?.name, type: dto.course?.type })
    return (await personalSchedules()).find((item) => item.id === created.id) as Schedule
  },
}

export interface Student { id: string; firstName: string; lastName: string; matricule: string; status: string; level?: { name: string; program?: { name: string } }; specialty?: { name: string }; user?: { email: string } }
export interface Teacher { id: string; firstName: string; lastName: string; user?: { email: string }; courses?: Course[] }
const universityCollectionUnavailable = <T>(feature: string) => unavailable<T>(feature)
export const studentsApi = {
  list: async (): Promise<Student[]> => [],
  getOne: async (_id: string) => universityCollectionUnavailable<Student>('Les étudiants'),
  create: async (_dto: Partial<Student> & { userId?: string; levelId?: string; specialtyId?: string; email?: string }) => universityCollectionUnavailable<Student>('Les étudiants'),
  update: async (_id: string, _dto: Partial<Student>) => universityCollectionUnavailable<Student>('Les étudiants'),
  delete: async (_id: string) => universityCollectionUnavailable<void>('Les étudiants'),
}
export const teachersApi = {
  list: async (): Promise<Teacher[]> => [],
  getOne: async (_id: string) => universityCollectionUnavailable<Teacher>('Les enseignants'),
  create: async (_dto: Partial<Teacher> & { userId?: string; email?: string }) => universityCollectionUnavailable<Teacher>('Les enseignants'),
  update: async (_id: string, _dto: Partial<Teacher>) => universityCollectionUnavailable<Teacher>('Les enseignants'),
  delete: async (_id: string) => universityCollectionUnavailable<void>('Les enseignants'),
}

export interface AttendanceSession { id: string; date: string; courseId: string; course?: { name: string; code: string }; records: AttendanceRecord[] }
export interface AttendanceRecord { id: string; status: 'PRESENT' | 'ABSENT' | 'RETARD' | 'JUSTIFIE'; studentId: string; student?: { firstName: string; lastName: string; matricule: string } }
export const attendanceApi = {
  listSessions: async (): Promise<AttendanceSession[]> => [],
  createSession: async (_dto: { courseId: string; date: string }) => unavailable<AttendanceSession>('Les présences'),
  getSession: async (_id: string) => unavailable<AttendanceSession>('Les présences'),
  byCourse: async (_courseId: string): Promise<AttendanceSession[]> => [],
  mark: async (_sessionId: string, _dto: { studentId: string; status: string }) => unavailable<AttendanceRecord>('Les présences'),
  scan: async (_dto: { qrCode: string }) => unavailable<AttendanceRecord>('Les présences'),
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
export const assignmentsApi = {
  list: personalAssignments,
  mine: personalAssignments,
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

export interface Grade { id: string; ue: string; code: string; title: string; type: string; coef: number; grade: number; classAvg: number; rank: number; maxRank: number }
async function personalGrades(): Promise<Grade[]> {
  if (getAccountType() !== 'PERSONAL') return []
  return (await personalAppwriteApi.grades.list()).map((item) => ({ id: item.id, ue: '', code: item.courseId, title: item.evaluationTitle, type: '', coef: item.coefficient, grade: item.score, classAvg: 0, rank: 0, maxRank: 0 }))
}
export const gradesApi = {
  mine: personalGrades,
  create: async (dto: Partial<Grade>) => {
    if (getAccountType() !== 'PERSONAL') return unavailable<Grade>('Les notes universitaires')
    const created = await personalAppwriteApi.grades.create({ courseId: dto.code || '', evaluationTitle: dto.title || '', score: dto.grade || 0, maxScore: 20, coefficient: dto.coef || 1 })
    return { id: created.id, ue: '', code: created.courseId, title: created.evaluationTitle, type: '', coef: created.coefficient, grade: created.score, classAvg: 0, rank: 0, maxRank: 0 }
  },
}

export interface ChatMessage { id: string; from: 'me' | 'them'; text: string; time: string; file?: string }
export interface ChatConversation { id: string; name: string; role: string; email: string; online: boolean; time: string; preview: string; unread: number; messages: ChatMessage[] }
export const messagingApi = { conversations: async (): Promise<ChatConversation[]> => [], sendMessage: async (_convId: string, _text: string, _file?: string) => unavailable<ChatConversation>('La messagerie') }

export interface LibraryResource { id: string; title: string; course: string; type: string; size: string; date: string; category: string; duration?: string }
export const libraryApi = { list: async (): Promise<LibraryResource[]> => [], upload: async (_dto: Partial<LibraryResource>) => unavailable<LibraryResource>('La bibliothèque') }

export interface UE { id: string; name: string; code: string; credits: number; courses?: Course[] }
export const ueApi = {
  list: async (): Promise<UE[]> => [],
  byLevel: async (_id: string): Promise<UE[]> => [],
  bySemester: async (_id: string): Promise<UE[]> => [],
  getOne: async (_id: string) => unavailable<UE>('Les unités d’enseignement'),
  create: async (_dto: Partial<UE> & { levelId?: string; semesterId?: string }) => unavailable<UE>('Les unités d’enseignement'),
  update: async (_id: string, _dto: Partial<UE>) => unavailable<UE>('Les unités d’enseignement'),
  delete: async (_id: string) => unavailable<void>('Les unités d’enseignement'),
}

export interface AuditLog { id: string; userId?: string; userRole?: string; action: string; resource: string; resourceId?: string; ipAddress?: string; userAgent?: string; statusCode?: number; details?: unknown; createdAt: string }
export const auditLogsApi = { list: async (_page = 1, _limit = 50, _resource?: string): Promise<AuditLog[]> => [], getOne: async (_id: string) => unavailable<AuditLog>('Le journal d’audit') }
export const usersApi = { listAll: async () => [] as Array<Student & { type: string } | Teacher & { type: string }> }

export interface OverviewStats { studentCount: number; teacherCount: number; courseCount: number; satisfactionRate: number; supportAvailability: string; assignmentCount?: number; gradeCount?: number; averageGrade?: number | null; attendanceRate?: number | null }
export const statsApi = {
  overview: async (): Promise<OverviewStats> => {
    if (getAccountType() !== 'PERSONAL') return { studentCount: 0, teacherCount: 0, courseCount: 0, satisfactionRate: 0, supportAvailability: 'Données universitaires non provisionnées dans Appwrite', assignmentCount: 0, gradeCount: 0, averageGrade: null, attendanceRate: null }
    const [courses, assignments, grades] = await Promise.all([personalAppwriteApi.courses.list(), personalAppwriteApi.assignments.list(), personalAppwriteApi.grades.list()])
    const averageGrade = grades.length ? grades.reduce((sum, item) => sum + (item.score / Math.max(item.maxScore, 1)) * 20, 0) / grades.length : null
    return { studentCount: 0, teacherCount: 0, courseCount: courses.length, satisfactionRate: 0, supportAvailability: 'Appwrite KERNEL FORGE', assignmentCount: assignments.length, gradeCount: grades.length, averageGrade, attendanceRate: null }
  },
}

export interface VideoRoom { roomName: string; token: string; serverUrl: string }
export const videoApi = { create: async (_dto: { courseId?: string; roomName?: string }) => unavailable<VideoRoom>('La visioconférence') }
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

export interface SubscriptionPlan { id: string; code: string; name: string; category: 'PERSONAL' | 'TEACHER' | 'INSTITUTION'; countryCode?: string; currency?: string; priceMonthlyAmount: number; priceAnnuallyAmount: number; priceMonthly: string; priceAnnually: string; period: string; badge?: string; highlight?: boolean; description: string; btnText: string; btnVariant?: string; providers: string[]; features: string[]; status?: 'ACTIVE' | 'INACTIVE' }
export interface PricingInfo { countryCode: string; currency: 'XAF' | 'EUR' | 'USD'; amount: number; formattedPrice: string; billingInterval: string; providers: string[] }
export interface SubscriptionStatus { status: 'NONE' | 'PENDING' | 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'EXPIRED'; planCode?: string | null; countryCode?: string | null; currency?: string | null; monthlyAmount?: number | null; currentPeriodEnd?: string | null; isAutoRenew: boolean }
export interface CheckoutResult { transactionId?: string; paymentUrl?: string; status?: string; message?: string }
export type CheckoutPayload = { planId?: string; planCode: string; countryCode: string; paymentProvider?: string; phoneNumber?: string; billingInterval?: 'MONTHLY' | 'ANNUALLY'; billingCycle: 'monthly' | 'annually'; email?: string; fullName?: string }
const subscriptionsUnavailable = <T>() => unavailable<T>('Les abonnements et paiements')
export const subscriptionApi = {
  getPlans: () => subscriptionsUnavailable<SubscriptionPlan[]>(), getPlanById: (_id: string) => subscriptionsUnavailable<SubscriptionPlan | null>(), getPricing: (_countryCode = 'CM') => subscriptionsUnavailable<PricingInfo>(), getStatus: () => subscriptionsUnavailable<SubscriptionStatus>(), createCheckout: (_payload: CheckoutPayload) => subscriptionsUnavailable<CheckoutResult>(),
}
export const personalSubscriptionApi = subscriptionApi
