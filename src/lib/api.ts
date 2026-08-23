import {
  appwriteAccount,
  academicAppwriteApi,
  executeAttendanceSecureAction,
  executeAdminDirectoryAction,
  getCurrentAccount,
  listDocuments,
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
 * configuré dans `appwrite.ts` avec le seul domaine Appwrite certifié. Les
 * fonctionnalités dont la collection Appwrite n’est pas encore provisionnée
 * retournent un état explicite et n’émettent jamais de requête HTTP de repli.
 */
export const APPWRITE_VPS_ENDPOINT = 'https://appwrite.kernelforge.codes/v1'

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
const academicLevels: AcademicLevel[] = [{ id: 'L1', name: 'Licence 1', programName: 'ICT4D' }]
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

function asAcademicCourse(course: import('./appwrite').AcademicCourseDocument): Course {
  const [firstName = '', ...lastName] = (course.teacherName || '').trim().split(/\s+/)
  return {
    id: course.$id,
    code: course.code,
    name: course.name,
    description: course.description || '',
    type: (course.type || 'CM') as Course['type'],
    credits: course.credits || 0,
    hours: course.hours || 0,
    teacher: course.teacherName ? { id: course.teacherId || '', firstName, lastName: lastName.join(' ') } : undefined,
    classroom: course.classroom ? { id: '', name: course.classroom, building: '' } : undefined,
  }
}

async function universityCourses(): Promise<Course[]> {
  const current = await getCurrentAccount('UNIVERSITY')
  if (!current) return []
  const courses = await academicAppwriteApi.courses.list()
  return courses
    .filter((course) => current.role !== 'TEACHER' || course.teacherId === current.id)
    .map(asAcademicCourse)
}

async function visibleCourses(): Promise<Course[]> {
  return getAccountType() === 'PERSONAL' ? personalCourses() : universityCourses()
}

export const coursesApi = {
  list: visibleCourses,
  mine: visibleCourses,
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
async function universitySchedules(): Promise<Schedule[]> {
  const [schedules, courses] = await Promise.all([academicAppwriteApi.schedules.list(), universityCourses()])
  const byId = new Map(courses.map((course) => [course.id, course]))
  return schedules
    .filter((item) => byId.has(item.courseId))
    .map((item) => {
      const course = byId.get(item.courseId)!
      return {
        id: item.$id,
        dayOfWeek: item.dayOfWeek,
        startTime: item.startTime,
        endTime: item.endTime,
        semesterId: 'ICT4D-L1',
        course: {
          id: course.id,
          name: course.name,
          code: course.code,
          type: item.type || course.type,
          teacher: course.teacher || { firstName: '', lastName: '' },
          classroom: { name: item.classroom || course.classroom?.name || '', building: '' },
        },
      }
    })
}
async function visibleSchedules(): Promise<Schedule[]> {
  return getAccountType() === 'PERSONAL' ? personalSchedules() : universitySchedules()
}
export const schedulesApi = {
  list: visibleSchedules,
  mine: visibleSchedules,
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

async function academicDirectory() {
  const current = await getCurrentAccount('UNIVERSITY')
  if (!current) return []
  return (await academicAppwriteApi.directory.list())
    .filter((entry) => entry.university === 'Université de Yaoundé I' && entry.program === 'ICT4D' && entry.level === 'L1')
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

async function requireAdminDirectoryAccess() {
  const current = await getCurrentAccount('UNIVERSITY')
  if (!current) throw new ApiError(401, 'Session Appwrite absente.')
  if (current.role !== 'ADMIN') throw new ApiError(403, 'Seul un administrateur peut gérer les comptes universitaires.')
  return current
}

function fullName(firstName?: string, lastName?: string) {
  return [firstName, lastName].map((value) => String(value || '').trim()).filter(Boolean).join(' ')
}

async function refreshStudent(id: string) {
  const student = (await studentsApi.list()).find((entry) => entry.id === id)
  if (!student) throw new ApiError(404, 'Étudiant introuvable après la synchronisation Appwrite.')
  return student
}

async function refreshTeacher(id: string) {
  const teacher = (await teachersApi.list()).find((entry) => entry.id === id)
  if (!teacher) throw new ApiError(404, 'Enseignant introuvable après la synchronisation Appwrite.')
  return teacher
}

export const studentsApi = {
  list: async (): Promise<Student[]> => (await academicDirectory()).filter((entry) => entry.role === 'STUDENT' || entry.role === 'DELEGATE').map(asStudent),
  getOne: async (id: string) => refreshStudent(id),
  create: async (dto: Partial<Student> & { userId?: string; levelId?: string; specialtyId?: string; email?: string; password?: string; role?: 'STUDENT' | 'DELEGATE' }) => {
    await requireAdminDirectoryAccess()
    if (!dto.email) throw new ApiError(400, 'Une adresse email est requise pour créer le compte étudiant.')
    if (!dto.password) throw new ApiError(400, 'Un mot de passe initial est requis pour créer le compte étudiant.')
    const result = await executeAdminDirectoryAction({ action: 'create', name: fullName(dto.firstName, dto.lastName), email: dto.email, password: dto.password, role: dto.role || 'STUDENT', matricule: dto.matricule, status: dto.status || 'ACTIVE' })
    return refreshStudent(result.userId as string)
  },
  update: async (id: string, dto: Partial<Student> & { email?: string; role?: 'STUDENT' | 'DELEGATE' }) => {
    await requireAdminDirectoryAccess()
    const existing = await refreshStudent(id)
    const result = await executeAdminDirectoryAction({ action: 'update', userId: id, name: fullName(dto.firstName ?? existing.firstName, dto.lastName ?? existing.lastName), email: dto.email, role: dto.role || (existing.status === 'delegate' ? 'DELEGATE' : 'STUDENT'), matricule: dto.matricule ?? existing.matricule, status: dto.status || (existing.status === 'delegate' ? 'ACTIVE' : existing.status) })
    return refreshStudent(result.userId as string)
  },
  delete: async (id: string) => {
    await requireAdminDirectoryAccess()
    await executeAdminDirectoryAction({ action: 'delete', userId: id })
  },
}
export const teachersApi = {
  list: async (): Promise<Teacher[]> => {
    const [directory, courses] = await Promise.all([academicDirectory(), academicAppwriteApi.courses.list()])
    return directory
      .filter((entry) => entry.role === 'TEACHER')
      .map((entry) => ({ ...asTeacher(entry), courses: courses.filter((course) => course.teacherId === entry.userId).map(asAcademicCourse) }))
  },
  getOne: async (id: string) => refreshTeacher(id),
  create: async (dto: Partial<Teacher> & { userId?: string; email?: string; password?: string }) => {
    await requireAdminDirectoryAccess()
    if (!dto.email) throw new ApiError(400, 'Une adresse email est requise pour créer le compte enseignant.')
    if (!dto.password) throw new ApiError(400, 'Un mot de passe initial est requis pour créer le compte enseignant.')
    const result = await executeAdminDirectoryAction({ action: 'create', name: fullName(dto.firstName, dto.lastName), email: dto.email, password: dto.password, role: 'TEACHER', matricule: '' })
    return refreshTeacher(result.userId as string)
  },
  update: async (id: string, dto: Partial<Teacher> & { email?: string }) => {
    await requireAdminDirectoryAccess()
    const existing = await refreshTeacher(id)
    const result = await executeAdminDirectoryAction({ action: 'update', userId: id, name: fullName(dto.firstName ?? existing.firstName, dto.lastName ?? existing.lastName), email: dto.email, role: 'TEACHER' })
    return refreshTeacher(result.userId as string)
  },
  delete: async (id: string) => {
    await requireAdminDirectoryAccess()
    await executeAdminDirectoryAction({ action: 'delete', userId: id })
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

    const [courseRows, directoryRows] = await Promise.all([
      academicAppwriteApi.courses.list(),
      academicAppwriteApi.directory.list(),
    ])
    const courses = courseRows
      .filter((row) => row.university === 'Université de Yaoundé I' && row.program === 'ICT4D' && row.level === 'L1')
      .filter((row) => current.role !== 'TEACHER' || row.teacherId === current.id)
      .map(asAcademicCourse)
    const students = directoryRows
      .filter((row) => row.university === 'Université de Yaoundé I' && row.program === 'ICT4D' && row.level === 'L1')
      .filter((row) => row.role === 'STUDENT' || row.role === 'DELEGATE')
      .map(asStudent)
    return { courses, students }
  },
  listSessions: appwriteAttendanceSessions,
  createSession: async (dto: { courseId: string; date: string }) => {
    const current = await getCurrentAccount('UNIVERSITY')
    if (!current) throw new ApiError(401, 'Session Appwrite absente.')
    if (current.role === 'STUDENT') throw new ApiError(403, 'Seul un enseignant, un délégué ou un administrateur peut créer une séance de présence.')
    const course = (await universityCourses()).find((entry) => entry.id === dto.courseId)
    if (!course) throw new ApiError(403, 'Ce cours n’est pas disponible pour votre rôle Appwrite.')
    const dateKey = new Date(dto.date).toISOString().slice(0, 10)
    const existing = (await appwriteAttendanceSessions()).find((entry) => entry.courseId === dto.courseId && entry.date.slice(0, 10) === dateKey)
    if (existing) return existing
    const created = await academicAppwriteApi.attendance.createSession({ courseId: dto.courseId, date: new Date(dto.date).toISOString(), createdBy: current.id })
    return { id: created.$id, date: created.date, courseId: created.courseId, course: { name: course.name, code: course.code }, records: [] }
  },
  getSession: async (id: string) => {
    const session = (await appwriteAttendanceSessions()).find((entry) => entry.id === id)
    if (!session) throw new ApiError(404, 'Séance de présence introuvable dans Appwrite.')
    return session
  },
  byCourse: async (courseId: string): Promise<AttendanceSession[]> => (await appwriteAttendanceSessions()).filter((entry) => entry.courseId === courseId),
  mark: async (sessionId: string, dto: { studentId: string; status: string }) => {
    const current = await getCurrentAccount('UNIVERSITY')
    if (!current) throw new ApiError(401, 'Session Appwrite absente.')
    if (current.role === 'STUDENT') throw new ApiError(403, 'Seul un enseignant, un délégué ou un administrateur peut enregistrer une présence.')
    if (!['PRESENT', 'ABSENT', 'RETARD', 'JUSTIFIE'].includes(dto.status)) throw new ApiError(400, 'Statut de présence Appwrite invalide.')
    const session = await attendanceApi.getSession(sessionId)
    const student = await studentsApi.getOne(dto.studentId)
    const existing = session.records.find((record) => record.studentId === dto.studentId)
    if (existing) {
      if (existing.status === dto.status) return existing
      const updated = await academicAppwriteApi.attendance.updateRecord(existing.id, dto.status as AttendanceRecord['status'])
      return { ...existing, status: updated.status }
    }
    const created = await academicAppwriteApi.attendance.createRecord({ sessionId, courseId: session.courseId, studentId: dto.studentId, status: dto.status as AttendanceRecord['status'] }, current.id)
    return { id: created.$id, studentId: created.studentId, status: created.status, student: { firstName: student.firstName, lastName: student.lastName, matricule: student.matricule } }
  },
  saveRoll: async (session: Pick<AttendanceSession, 'id' | 'courseId'>, rows: Array<{ studentId: string; status: AttendanceRecord['status'] }>) => {
    const current = await getCurrentAccount('UNIVERSITY')
    if (!current) throw new ApiError(401, 'Session Appwrite absente.')
    if (current.role === 'STUDENT') throw new ApiError(403, 'Seul un enseignant, un délégué ou un administrateur peut enregistrer une présence.')

    const existingRecords = await academicAppwriteApi.attendance.records()
    const byStudentId = new Map(existingRecords
      .filter((record) => record.sessionId === session.id)
      .map((record) => [record.studentId, record]))

    return Promise.all(rows.map(async (row) => {
      const existing = byStudentId.get(row.studentId)
      if (existing?.status === row.status) return existing
      if (existing) return academicAppwriteApi.attendance.updateRecord(existing.$id, row.status)
      return academicAppwriteApi.attendance.createRecord({ sessionId: session.id, courseId: session.courseId, studentId: row.studentId, status: row.status }, current.id)
    }))
  },
  saveTodayRoll: async (dto: { courseId: string; date: string; rows: Array<{ studentId: string; status: AttendanceRecord['status'] }> }) => {
    const current = await getCurrentAccount('UNIVERSITY')
    if (!current) throw new ApiError(401, 'Session Appwrite absente.')
    if (current.role === 'STUDENT') throw new ApiError(403, 'Seul un enseignant, un délégué ou un administrateur peut enregistrer une présence.')

    const [courseRows, sessionRows, recordRows] = await Promise.all([
      academicAppwriteApi.courses.list(),
      academicAppwriteApi.attendance.sessions(),
      academicAppwriteApi.attendance.records(),
    ])
    const course = courseRows.find((row) => row.$id === dto.courseId)
    if (!course || (current.role === 'TEACHER' && course.teacherId !== current.id)) {
      throw new ApiError(403, 'Ce cours n’est pas disponible pour votre rôle Appwrite.')
    }

    const dateKey = new Date(dto.date).toISOString().slice(0, 10)
    let session = sessionRows.find((row) => row.courseId === dto.courseId && row.date.slice(0, 10) === dateKey)
    if (!session) {
      session = await academicAppwriteApi.attendance.createSession({ courseId: dto.courseId, date: new Date(dto.date).toISOString(), createdBy: current.id })
    }

    const byStudentId = new Map(recordRows
      .filter((record) => record.sessionId === session!.$id)
      .map((record) => [record.studentId, record]))
    await Promise.all(dto.rows.map(async (row) => {
      const existing = byStudentId.get(row.studentId)
      if (existing?.status === row.status) return existing
      if (existing) return academicAppwriteApi.attendance.updateRecord(existing.$id, row.status)
      return academicAppwriteApi.attendance.createRecord({ sessionId: session!.$id, courseId: dto.courseId, studentId: row.studentId, status: row.status }, current.id)
    }))

    return { id: session.$id, courseId: session.courseId, date: session.date }
  },
  openQrSession: async (dto: { courseId: string; date?: string; origin: { latitude: number; longitude: number; accuracy: number }; radiusMeters?: number }) => {
    const current = await getCurrentAccount('UNIVERSITY')
    if (!current) throw new ApiError(401, 'Session Appwrite absente.')
    if (current.role === 'STUDENT') throw new ApiError(403, 'Seul un enseignant, un délégué ou un administrateur peut générer un QR de présence.')

    const date = dto.date || new Date().toISOString()
    const session = await attendanceApi.createSession({ courseId: dto.courseId, date })
    const qr = await executeAttendanceSecureAction({ action: 'issue', sessionId: session.id, courseId: session.courseId, origin: dto.origin, radiusMeters: dto.radiusMeters })
    if (!qr.token || !qr.expiresAt) throw new ApiError(502, 'La Function Appwrite n’a pas retourné de jeton QR exploitable.')
    return {
      token: qr.token,
      sessionId: session.id,
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
  return rows
    .filter((item) => current.role === 'TEACHER' ? allowedCourseIds.has(item.courseId) : item.studentId === current.id)
    .map((item) => ({
      id: item.$id,
      title: item.title,
      code: item.courseId,
      due: item.dueDate,
      progress: item.status === 'Soumis' || item.status === 'Noté' ? 100 : 0,
      status: item.status === 'Soumis' || item.status === 'Noté' || item.status === 'En retard' ? item.status : 'À rendre',
      grade: item.grade || undefined,
      description: item.description || undefined,
      feedback: item.feedback || undefined,
      submittedAt: item.submittedAt || undefined,
      submittedFile: item.submittedFile || undefined,
      submissionNote: item.submissionNote || undefined,
    }))
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

export interface Grade { id: string; ue: string; code: string; title: string; type: string; coef: number; grade: number; classAvg: number; rank: number; maxRank: number }
async function personalGrades(): Promise<Grade[]> {
  if (getAccountType() !== 'PERSONAL') return []
  return (await personalAppwriteApi.grades.list()).map((item) => ({ id: item.id, ue: '', code: item.courseId, title: item.evaluationTitle, type: '', coef: item.coefficient, grade: item.score, classAvg: 0, rank: 0, maxRank: 0 }))
}
async function universityGrades(): Promise<Grade[]> {
  const current = await getCurrentAccount('UNIVERSITY')
  if (!current) return []
  const [rows, courses] = await Promise.all([academicAppwriteApi.grades.list(), universityCourses()])
  const allowedCourseIds = new Set(courses.map((course) => course.id))
  return rows
    .filter((item) => current.role === 'TEACHER' ? allowedCourseIds.has(item.courseId) : item.studentId === current.id)
    .map((item) => ({
      id: item.$id,
      ue: 'ICT4D L1',
      code: item.courseCode,
      title: item.evaluationTitle,
      type: item.type || 'CC',
      coef: item.coefficient || 1,
      grade: Number(item.score),
      classAvg: 0,
      rank: 0,
      maxRank: 0,
    }))
}
export const gradesApi = {
  mine: async () => getAccountType() === 'PERSONAL' ? personalGrades() : universityGrades(),
  create: async (dto: Partial<Grade>) => {
    if (getAccountType() !== 'PERSONAL') return unavailable<Grade>('Les notes universitaires')
    const created = await personalAppwriteApi.grades.create({ courseId: dto.code || '', evaluationTitle: dto.title || '', score: dto.grade || 0, maxScore: 20, coefficient: dto.coef || 1 })
    return { id: created.id, ue: '', code: created.courseId, title: created.evaluationTitle, type: '', coef: created.coefficient, grade: created.score, classAvg: 0, rank: 0, maxRank: 0 }
  },
}

export interface ChatMessage { id: string; from: 'me' | 'them'; text: string; time: string; file?: string }
export interface ChatConversation { id: string; name: string; role: string; email: string; online: boolean; time: string; preview: string; unread: number; messages: ChatMessage[] }
export const messagingApi = { conversations: async (): Promise<ChatConversation[]> => [], sendMessage: async (_convId: string, _text: string, _file?: string) => unavailable<ChatConversation>('La messagerie') }

export interface LibraryResource { id: string; courseId: string; title: string; course: string; type: string; size: string; date: string; category: string; duration?: string }
export const libraryApi = {
  list: async (): Promise<LibraryResource[]> => {
    if (getAccountType() === 'PERSONAL') return []
    const resources = await academicAppwriteApi.library.list()
    return resources.map((resource) => ({
      id: resource.$id,
      courseId: resource.courseId,
      title: resource.title,
      course: resource.course,
      type: resource.type,
      size: resource.size || '',
      date: resource.publishedAt,
      category: resource.category,
    }))
  },
  upload: async (_dto: Partial<LibraryResource>) => unavailable<LibraryResource>('La bibliothèque universitaire'),
}

export interface UE {
  id: string
  name: string
  code: string
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

async function academicTeachingUnits(): Promise<UE[]> {
  const current = await getCurrentAccount('UNIVERSITY')
  if (!current || current.role !== 'ADMIN') {
    throw new ApiError(403, 'La consultation du référentiel pédagogique Appwrite est réservée au rôle administrateur.')
  }

  const [courses, schedules, enrollments] = await Promise.all([
    academicAppwriteApi.courses.list(),
    academicAppwriteApi.schedules.list(),
    academicAppwriteApi.enrollments.list(),
  ])

  return courses
    .filter((course) => course.university === 'Université de Yaoundé I' && course.program === 'ICT4D' && course.level === 'L1')
    .map((course) => {
      const courseSchedules = schedules.filter((schedule) => schedule.courseId === course.$id)
      return {
        id: course.$id,
        name: course.name,
        code: course.code,
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
  list: academicTeachingUnits,
  byLevel: async (id: string): Promise<UE[]> => id === 'L1' ? academicTeachingUnits() : [],
  bySemester: async (_id: string): Promise<UE[]> => unavailable<UE[]>('Les semestres d’unités d’enseignement'),
  getOne: async (id: string) => {
    const unit = (await academicTeachingUnits()).find((item) => item.id === id)
    if (!unit) throw new ApiError(404, 'Cours introuvable dans le référentiel Appwrite ICT4D L1.')
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

export interface SubscriptionPlan { id: string; code: string; name: string; category: 'PERSONAL' | 'TEACHER' | 'INSTITUTION' | 'ACADEMIC'; countryCode?: string; currency?: string; priceMonthlyAmount: number; priceAnnuallyAmount: number; priceMonthly: string; priceAnnually: string; period: string; badge?: string; highlight?: boolean; description: string; btnText: string; btnVariant?: string; providers: string[]; features: string[]; status?: 'ACTIVE' | 'INACTIVE' }
export interface PricingInfo { countryCode: string; currency: 'XAF' | 'EUR' | 'USD'; amount: number; formattedPrice: string; billingInterval: string; providers: string[] }
export interface SubscriptionStatus { status: 'NONE' | 'PENDING' | 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'EXPIRED'; planCode?: string | null; countryCode?: string | null; currency?: string | null; monthlyAmount?: number | null; currentPeriodEnd?: string | null; isAutoRenew: boolean }
export interface CheckoutResult { transactionId?: string; paymentUrl?: string; status?: string; message?: string }
export type CheckoutPayload = { planId?: string; planCode: string; countryCode: string; paymentProvider?: string; phoneNumber?: string; billingInterval?: 'MONTHLY' | 'ANNUALLY'; billingCycle: 'monthly' | 'annually'; email?: string; fullName?: string }

function subscriptionProviders(value?: string): string[] {
  try {
    const parsed = value ? JSON.parse(value) : []
    return Array.isArray(parsed) ? parsed.filter((provider): provider is string => typeof provider === 'string') : []
  } catch {
    return []
  }
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
    btnText: row.priceMonthlyAmount === 0 ? 'Accès inclus' : 'Choisir cette formule',
    btnVariant: row.highlight ? 'primary' : 'secondary',
    providers: subscriptionProviders(row.providers),
    features: [],
    status: row.status,
  }))
}

async function appwriteSubscriptionStatus(): Promise<SubscriptionStatus> {
  const current = await getCurrentAccount()
  if (!current) throw new ApiError(401, 'Connectez-vous pour consulter votre statut de souscription.')
  const row = await academicAppwriteApi.subscriptions.getStatus(current.id)
  if (!row) return { status: 'NONE', isAutoRenew: false }
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
    throw new ApiError(501, 'Aucun prestataire de paiement n’est configuré dans Appwrite pour cette formule. Aucune transaction n’a été initiée.')
  },
}
export const personalSubscriptionApi = subscriptionApi
