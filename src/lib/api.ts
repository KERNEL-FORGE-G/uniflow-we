import axios, { type AxiosInstance, type InternalAxiosRequestConfig, type AxiosError } from 'axios'
import { playSuccessSound, playErrorSound } from '../utils/sound'
import { personalAppwriteApi } from './appwrite'

/**
 * Client API UniFlow avec Axios, Moteur Réseau & Intercepteurs d'Authentification
 * Support Multi-Backend :
 *   • Backend 1 (Université) : VITE_UNIVERSITY_API_URL
 *   • Backend 2 (Personnel / SaaS Indépendant) : VITE_PERSONAL_API_URL
 */

const sanitizeUrl = (u?: string) => (u ? u.trim().replace(/\/+$/, '') : '')
const configuredTimeout = Number(import.meta.env.VITE_API_TIMEOUT_MS)
const API_REQUEST_TIMEOUT_MS = Number.isFinite(configuredTimeout) && configuredTimeout >= 1000
  ? configuredTimeout
  : 15000

export const UNIVERSITY_API_URL = sanitizeUrl(
  (import.meta.env.VITE_UNIVERSITY_API_URL as string) ??
  (import.meta.env.VITE_API_URL as string) ??
  'https://api-uniflow.kernelforge.codes'
)
export const PERSONAL_API_URL = sanitizeUrl(
  (import.meta.env.VITE_PERSONAL_API_URL as string) ?? ''
)

export function getAccountType(): 'UNIVERSITY' | 'PERSONAL' {
  try {
    const explicit = localStorage.getItem('uniflow_account_type')
    if (explicit === 'PERSONAL' || explicit === 'UNIVERSITY') {
      return explicit
    }
    const rawUser = localStorage.getItem('uniflow_user')
    if (rawUser) {
      const parsed = JSON.parse(rawUser)
      if (parsed.accountType === 'PERSONAL' || parsed.isIndependent) {
        return 'PERSONAL'
      }
    }
  } catch (e) {
    // default to UNIVERSITY
  }
  return 'UNIVERSITY'
}

export function setAccountType(type: 'UNIVERSITY' | 'PERSONAL'): void {
  localStorage.setItem('uniflow_account_type', type)
}

export function getActiveApiUrl(): string {
  const raw = getAccountType() === 'PERSONAL' ? PERSONAL_API_URL : UNIVERSITY_API_URL
  return sanitizeUrl(raw)
}

export const BASE_URL = getActiveApiUrl()

// ─── Tokens ──────────────────────────────────────────────────────────────────

export const getToken = () => localStorage.getItem('uniflow_access_token')
export const getRefreshToken = () => localStorage.getItem('uniflow_refresh_token')
export const setTokens = (a: string, r: string) => {
  localStorage.setItem('uniflow_access_token', a)
  localStorage.setItem('uniflow_refresh_token', r)
}
export const clearTokens = () => {
  localStorage.removeItem('uniflow_access_token')
  localStorage.removeItem('uniflow_refresh_token')
  localStorage.removeItem('uniflow_user')
}

// ─── Axios Instance Configuration & Interceptors ──────────────────────────────

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const axiosInstance = apiClient

const MONITORED_ENDPOINTS = ['/stats/overview', '/students', '/courses', '/teachers']

function isMonitoredPath(url?: string): boolean {
  if (!url) return false
  return MONITORED_ENDPOINTS.some((ep) => url.includes(ep))
}

// Intercepteur de requête : Ajout automatique du jeton d'authentification s'il existe + Journalisation
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    config.baseURL = getActiveApiUrl()
    const token = getToken()
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    const fullUrl = `${config.baseURL ?? ''}${config.url ?? ''}`
    const hasToken = Boolean(token)

    if (isMonitoredPath(config.url)) {
      console.info(`[Axios Diagnostic Request] ${config.method?.toUpperCase()} ${fullUrl} | Token Attached: ${hasToken}`)
    } else {
      console.debug(`[Axios Request] ${config.method?.toUpperCase()} ${fullUrl}`)
    }

    return config
  },
  (error) => {
    console.error('[Axios Request Error]', error)
    return Promise.reject(error)
  }
)

const RECENT_NETWORK_ERRORS = new Map<string, number>()

export function dispatchNetworkErrorEvent(url: string, rawMessage?: string) {
  const now = Date.now()
  const cleanUrl = url || 'API'
  const lastTime = RECENT_NETWORK_ERRORS.get(cleanUrl) || 0

  // Ne pas spammer d'événements pour la même URL sous 5 secondes
  if (now - lastTime < 5000) return
  RECENT_NETWORK_ERRORS.set(cleanUrl, now)

  if (RECENT_NETWORK_ERRORS.size > 30) {
    for (const [k, v] of RECENT_NETWORK_ERRORS.entries()) {
      if (now - v > 10000) RECENT_NETWORK_ERRORS.delete(k)
    }
  }

  try {
    window.dispatchEvent(
      new CustomEvent('uniflow:network-error', {
        detail: {
          url: cleanUrl,
          message: rawMessage || 'Échec de connexion réseau ou blocage CORS/Timeout',
          timestamp: now,
        },
      })
    )
  } catch {}
}

// Intercepteur de réponse : Rafraîchissement automatique du jeton si expirée (401) + Diagnostic 401
apiClient.interceptors.response.use(
  (response) => {
    if (isMonitoredPath(response.config.url)) {
      console.info(`[Axios Diagnostic Response ${response.status}] ${response.config.url}`)
    }
    return response
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
    const url = originalRequest?.url || ''
    const status = error.response?.status
    const token = getToken()

    if (status === 401) {
      console.warn(`[Axios 401 Unauthorized] Endpoint: ${url} | Token Present: ${Boolean(token)} | Message: ${error.message}`)

      if (originalRequest && !originalRequest._retry) {
        originalRequest._retry = true
        console.info(`[Axios 401 Retry] Attempting token refresh for ${url}...`)
        const refreshed = await doRefresh()
        if (refreshed) {
          const newToken = getToken()
          if (newToken && originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`
          }
          console.info(`[Axios 401 Retry Success] Retrying ${url} with new token.`)
          return apiClient(originalRequest)
        } else {
          console.error(`[Axios 401 Retry Failed] Token refresh failed for ${url}. Clearing tokens.`)
          clearTokens()
          try {
            window.dispatchEvent(new CustomEvent('uniflow:session-expired'))
          } catch {}
        }
      }
    } else if (error.response) {
      console.warn(`[Axios Error ${status}] ${url}:`, error.response.data)
    } else {
      console.warn(`[Axios Network Info] ${url}:`, error.message)
      dispatchNetworkErrorEvent(url, error.message)
    }

    return Promise.reject(error)
  }
)

/**
 * Wrapper centralisé de requête Axios avec gestion du temps d'exécution, journalisation détaillée
 * et fallback gracieux pour le diagnostic des erreurs 401.
 */
export async function executeAxiosRequest<T = any>(config: {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  data?: any
  params?: any
  headers?: Record<string, string>
}): Promise<T> {
  const startTime = Date.now()
  const method = config.method ?? 'GET'
  const isMonitored = isMonitoredPath(config.url)

  if (isMonitored) {
    console.group(`[Axios Wrapper] Executing ${method} ${config.url}`)
    console.info('Config:', config)
  }

  try {
    const response = await apiClient.request<T>({
      url: config.url,
      method,
      data: config.data,
      params: config.params,
      headers: config.headers,
    })

    const duration = Date.now() - startTime
    if (method !== 'GET') {
      playSuccessSound()
    }
    if (isMonitored) {
      console.info(`[Axios Wrapper Success] ${method} ${config.url} (${duration}ms)`)
      console.groupEnd()
    }

    return response.data
  } catch (err: any) {
    const duration = Date.now() - startTime
    const status = err?.response?.status ?? 500
    const errorMessage = err?.response?.data?.message || err?.message || 'Erreur réseau/serveur'

    playErrorSound()

    console.error(`[Axios Wrapper Error ${status}] ${method} ${config.url} (${duration}ms):`, errorMessage)

    if (isMonitored) {
      console.groupEnd()
    }

    throw new ApiError(status, errorMessage, err?.response?.data)
  }
}

export const axiosRequestWrapper = executeAxiosRequest

// ─── ApiError ────────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(public status: number, message: string, public body?: unknown) {
    super(message)
    this.name = 'ApiError'
  }
}

// ─── Core fetch connecting strictly to the Real Backend ──────────────────────────

async function req<T>(path: string, init: RequestInit = {}, retry = true, triedApiPrefix = false, baseOverride?: string): Promise<T> {
  const accountType = getAccountType()
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(init.headers as Record<string, string> ?? {}),
  }
  const cleanBase = (baseOverride ?? getActiveApiUrl()).replace(/\/+$/, '')
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  // Les endpoints métier sont désormais canoniques à la racine.
  // Les appels explicites `/api/*` et `/api/v1/*` restent transmis aux alias backend.
  const requestPath = cleanPath
  if (!cleanBase) {
    throw new ApiError(503, 'Le backend personnel n’est pas configuré pour cet environnement.')
  }
  const url = `${cleanBase}${requestPath}`

  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), API_REQUEST_TIMEOUT_MS)

  try {
    const res = await fetch(url, { ...init, headers, signal: controller.signal })

    if (res.status === 401 && retry) {
      if (cleanPath.startsWith('/auth/login') || cleanPath.startsWith('/auth/register') || cleanPath.startsWith('/auth/refresh')) {
        let msg = 'Identifiants invalides ou non autorisé'
        try {
          const b = await res.json()
          msg = b?.message || msg
        } catch {}
        throw new ApiError(401, msg)
      }

      const ok = await doRefresh(baseOverride)
      if (ok) return req<T>(cleanPath, init, false, false, baseOverride)

      if (token) {
        clearTokens()
        try {
          window.dispatchEvent(new CustomEvent('uniflow:session-expired'))
        } catch {}
      }
      throw new ApiError(401, 'Session expirée')
    }

    if (!res.ok) {
      let body: any = null
      let msg = `Erreur API HTTP ${res.status}`
      try {
        body = await res.json()
        const backendMessage = body?.message || body?.error?.message || body?.error?.error
        if (backendMessage) msg = backendMessage
      } catch {}

      if (res.status === 404) {
        const isPersonalBackend = baseOverride !== undefined || getAccountType() === 'PERSONAL'
        const backendKind = isPersonalBackend ? 'personnel' : 'universitaire'
        const variableName = isPersonalBackend ? 'PERSONAL' : 'UNIVERSITY'
        msg = `Route ${cleanPath} introuvable sur le backend ${backendKind} configuré (${cleanBase}). Vérifiez que le service expose cette route et que VITE_${variableName}_API_URL pointe vers la bonne version.`
      }

      throw new ApiError(res.status, msg, body)
    }

    if (res.status === 204) return null as T
    const data = await res.json()
    return data
  } catch (err) {
    if (err instanceof ApiError) throw err

    dispatchNetworkErrorEvent(cleanPath, err instanceof Error ? err.message : undefined)

    const message = err instanceof DOMException && err.name === 'AbortError'
      ? `Le serveur ne répond pas après ${Math.round(API_REQUEST_TIMEOUT_MS / 1000)} secondes.`
      : err instanceof Error ? err.message : 'Erreur de connexion au serveur backend'
    throw new ApiError(500, message)
  } finally {
    window.clearTimeout(timeoutId)
  }
}

let _refreshPromise: Promise<boolean> | null = null

async function doRefresh(baseOverride?: string): Promise<boolean> {
  if (_refreshPromise) return _refreshPromise

  _refreshPromise = (async () => {
    const r = getRefreshToken()
    if (!r) return false
    try {
      const activeBase = (baseOverride ?? getActiveApiUrl()).replace(/\/+$/, '')
      const refreshPath = '/auth/refresh'
      const res = await fetch(`${activeBase}${refreshPath}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: r }),
      })
      if (!res.ok) {
        clearTokens()
        return false
      }
      const d = await res.json()
      const data = d.data ?? d
      if (!data.accessToken || !data.refreshToken) return false
      setTokens(data.accessToken, data.refreshToken)
      try { window.dispatchEvent(new CustomEvent('uniflow:session-restored')) } catch {}
      return true
    } catch (e) {
      return false
    }
  })()

  try {
    return await _refreshPromise
  } finally {
    _refreshPromise = null
  }
}

// ─── HTTP helpers ─────────────────────────────────────────────────────────────

export const api = {
  get:    <T>(p: string)              => req<T>(p),
  post:   <T>(p: string, b?: unknown) => req<T>(p, { method: 'POST',   body: JSON.stringify(b) }),
  patch:  <T>(p: string, b?: unknown) => req<T>(p, { method: 'PATCH',  body: JSON.stringify(b) }),
  put:    <T>(p: string, b?: unknown) => req<T>(p, { method: 'PUT',    body: JSON.stringify(b) }),
  delete: <T>(p: string)              => req<T>(p, { method: 'DELETE' }),
}

/**
 * Client explicite du backend personnel. Les écrans indépendants ne doivent
 * pas dépendre de `uniflow_account_type` pour choisir leur serveur : un état
 * local absent ou périmé ne doit jamais envoyer `/personal/*` au backend
 * universitaire.
 */
const personalApiClient = {
  get:    <T>(p: string)              => req<T>(p, {}, true, false, PERSONAL_API_URL),
  post:   <T>(p: string, b?: unknown) => req<T>(p, { method: 'POST', body: JSON.stringify(b) }, true, false, PERSONAL_API_URL),
  put:    <T>(p: string, b?: unknown) => req<T>(p, { method: 'PUT', body: JSON.stringify(b) }, true, false, PERSONAL_API_URL),
  patch:  <T>(p: string, b?: unknown) => req<T>(p, { method: 'PATCH', body: JSON.stringify(b) }, true, false, PERSONAL_API_URL),
  delete: <T>(p: string)              => req<T>(p, { method: 'DELETE' }, true, false, PERSONAL_API_URL),
}

// ─── Unwrap (TransformInterceptor → { data: T }) ──────────────────────────────

function u<T>(r: { data?: T } | T): T {
  return (r as { data?: T }).data !== undefined ? (r as { data: T }).data : r as T
}

// =============================================================================
// AUTH
// =============================================================================

export interface LoginDto {
  email: string
  password: string
  accountType?: 'UNIVERSITY' | 'PERSONAL'
  universityCode?: string
}

export interface RegisterDto {
  email: string
  password: string
  firstName: string
  lastName: string
  role: 'ETUDIANT' | 'ENSEIGNANT' | 'DELEGUE' | 'ADMIN' | 'INDEPENDENT_STUDENT' | 'INDEPENDENT_TEACHER'
  accountType?: 'UNIVERSITY' | 'PERSONAL'
  universityCode?: string
  matricule?: string
  countryCode?: string
  levelId?: string
  specialtyId?: string
}

export interface AuthResult {
  accessToken: string
  refreshToken: string
  user: BackendUser
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
interface StudentProfile { firstName: string; lastName: string; matricule?: string; level?: string; specialty?: string }

type RawAuthResponse = {
  accessToken?: string
  refreshToken?: string
  user?: BackendUser
  tokens?: { accessToken?: string; refreshToken?: string }
}

function normalizeAuthResult(raw: RawAuthResponse | AuthResult): AuthResult {
  const value = raw as RawAuthResponse
  const accessToken = value.accessToken ?? value.tokens?.accessToken
  const refreshToken = value.refreshToken ?? value.tokens?.refreshToken
  if (!accessToken || !refreshToken || !value.user) {
    throw new ApiError(502, 'Réponse d’authentification backend incomplète.')
  }
  return { accessToken, refreshToken, user: value.user }
}
interface TeacherProfile { firstName: string; lastName: string }

export interface AcademicLevel {
  id: string
  name: string
  programName: string
}
export interface SpecialtyOption {
  id: string
  name: string
  levelId: string
}

export const authApi = {
  login: async (dto: LoginDto): Promise<AuthResult> => {
    const accType = dto.accountType || 'UNIVERSITY'
    setAccountType(accType)
    const res = normalizeAuthResult(u(await api.post<RawAuthResponse>('/auth/login', {
      email: dto.email,
      password: dto.password,
    })))
    res.user = {
      ...res.user,
      accountType: res.user.accountType ?? res.user.accountCategory ?? accType,
      universityCode: res.user.universityCode ?? (accType === 'UNIVERSITY' ? (dto.universityCode || 'UY1') : undefined),
    }
    localStorage.setItem('uniflow_user', JSON.stringify(res.user))
    return res
  },

  register: async (dto: RegisterDto): Promise<AuthResult> => {
    const accType = dto.accountType || 'UNIVERSITY'
    setAccountType(accType)
    const backendDto = accType === 'PERSONAL'
      ? {
          email: dto.email,
          password: dto.password,
          fullName: `${dto.firstName} ${dto.lastName}`.trim(),
          role: dto.role === 'INDEPENDENT_TEACHER' ? 'TEACHER' : 'STUDENT',
          accountCategory: 'PERSONAL',
          countryCode: dto.countryCode || 'CM',
        }
      : (() => {
          const { accountType: _accountType, universityCode: _universityCode, matricule: _matricule, ...universityDto } = dto
          return universityDto
        })()
    const res = normalizeAuthResult(u(await api.post<RawAuthResponse>('/auth/register', backendDto)))
    res.user = {
      ...res.user,
      accountType: res.user.accountType ?? res.user.accountCategory ?? accType,
      universityCode: res.user.universityCode ?? (accType === 'UNIVERSITY' ? (dto.universityCode || 'UY1') : undefined),
    }
    localStorage.setItem('uniflow_user', JSON.stringify(res.user))
    return res
  },
  me:       async ()                 => u(await api.get<{ data: BackendUser }>('/auth/me')),
  academicOptions: async () => u(await api.get<{ data: { levels: AcademicLevel[]; specialties: SpecialtyOption[] } }>('/auth/academic-options')),
  specialties: async (levelId?: string) => u(await api.get<{ data: SpecialtyOption[] }>(`/auth/specialties${levelId ? `?levelId=${encodeURIComponent(levelId)}` : ''}`)),
  logout:   ()                       => clearTokens(),
  updateProfile: async (dto: Partial<StudentProfile & TeacherProfile & { email: string; phone?: string; address?: string; firstName?: string; lastName?: string; countryCode?: string; preferredCurrency?: string }>) =>
    u(await api.patch<{ data: BackendUser }>('/auth/me', dto))
}

// =============================================================================
// COURSES
// =============================================================================

export interface Course {
  id: string; name: string; code: string; description?: string
  type: 'CM' | 'TD' | 'TP'; credits: number; hours: number
  teachingUnit?: { id: string; name: string; code: string; credits: number }
  teacher?: { id: string; firstName: string; lastName: string }
  classroom?: { id: string; name: string; building: string }
}

export const coursesApi = {
  list:   async ()          => u(await api.get<{ data: Course[] }>('/courses')),
  mine: async () => {
    if (getAccountType() === 'PERSONAL') {
      const personalCourses = await personalAppwriteApi.courses.list()
      return personalCourses.map((course) => ({
        id: course.id,
        name: course.title,
        code: course.code,
        description: course.description,
        type: 'CM' as const,
        credits: course.credits ?? 0,
        hours: 0,
        teacher: course.instructor ? { id: '', firstName: course.instructor, lastName: '' } : undefined,
        classroom: course.classroom ? { id: '', name: course.classroom, building: '' } : undefined,
      }))
    }
    return u(await api.get<{ data: Course[] }>('/courses/my'))
  },
  getOne: async (id: string) => u(await api.get<{ data: Course }>(`/courses/${id}`)),
  create: async (dto: Partial<Course> & { teachingUnitId?: string; teacherId?: string; classroomId?: string }) => u(await api.post<{ data: Course }>('/courses', dto)),
  update: async (id: string, dto: Partial<Course>) => u(await api.patch<{ data: Course }>(`/courses/${id}`, dto)),
  delete: async (id: string) => u(await api.delete<void>(`/courses/${id}`)),
}

export interface PersonalCourse {
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

export interface PersonalSchedule {
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

export interface PersonalAssignment {
  id: string
  courseId: string
  title: string
  dueDate: string
  description?: string
  priority?: string
  status?: string
}

export interface PersonalGrade {
  id: string
  courseId: string
  evaluationTitle: string
  score: number
  maxScore: number
  coefficient: number
}

const personalDayToApi: Record<string, string> = {
  MONDAY: 'LUNDI', TUESDAY: 'MARDI', WEDNESDAY: 'MERCREDI', THURSDAY: 'JEUDI',
  FRIDAY: 'VENDREDI', SATURDAY: 'SAMEDI', SUNDAY: 'DIMANCHE',
}

const toPersonalCourseDto = (dto: Partial<PersonalCourse>) => ({
  code: dto.code,
  name: dto.title,
  ...(dto.instructor?.trim() ? { instructorName: dto.instructor.trim() } : {}),
  ...(typeof dto.credits === 'number' && dto.credits > 0 ? { credits: dto.credits } : {}),
  ...(dto.colorHex?.trim() ? { colorHex: dto.colorHex.trim() } : {}),
  ...(dto.classroom?.trim() ? { semesterLabel: dto.classroom.trim() } : {}),
})

const toPersonalScheduleDto = (dto: Partial<PersonalSchedule>) => ({
  subjectId: dto.courseId,
  dayOfWeek: personalDayToApi[dto.dayOfWeek || ''] || dto.dayOfWeek,
  startTime: dto.startTime,
  endTime: dto.endTime,
  classroomLocation: dto.classroom || undefined,
  notes: dto.type || undefined,
})

const toPersonalTaskDto = (dto: Partial<PersonalAssignment>) => ({
  subjectId: dto.courseId || undefined,
  title: dto.title,
  dueDate: dto.dueDate || undefined,
  description: dto.description || undefined,
  priority: dto.priority || undefined,
  status: dto.status || undefined,
})

export const personalApi = {
  courses: {
    list: async () => u(await personalApiClient.get<{ data: PersonalCourse[] }>('/personal/subjects')),
    create: async (dto: Omit<PersonalCourse, 'id' | 'createdAt'>) => u(await personalApiClient.post<{ data: PersonalCourse }>('/personal/subjects', toPersonalCourseDto(dto))),
    update: async (id: string, dto: Partial<PersonalCourse>) => u(await personalApiClient.put<{ data: PersonalCourse }>(`/personal/subjects/${id}`, toPersonalCourseDto(dto))),
    delete: async (id: string) => u(await personalApiClient.delete<void>(`/personal/subjects/${id}`)),
  },
  schedules: {
    list: async () => u(await personalApiClient.get<{ data: PersonalSchedule[] }>('/personal/schedules')),
    create: async (dto: Omit<PersonalSchedule, 'id' | 'courseTitle' | 'courseCode' | 'colorHex'>) => u(await personalApiClient.post<{ data: PersonalSchedule }>('/personal/schedules', toPersonalScheduleDto(dto))),
    update: async (id: string, dto: Partial<PersonalSchedule>) => u(await personalApiClient.put<{ data: PersonalSchedule }>(`/personal/schedules/${id}`, toPersonalScheduleDto(dto))),
    delete: async (id: string) => u(await personalApiClient.delete<void>(`/personal/schedules/${id}`)),
  },
  assignments: {
    list: async () => u(await personalApiClient.get<{ data: PersonalAssignment[] }>('/personal/tasks')),
    create: async (dto: Omit<PersonalAssignment, 'id'>) => u(await personalApiClient.post<{ data: PersonalAssignment }>('/personal/tasks', toPersonalTaskDto(dto))),
    update: async (id: string, dto: Partial<PersonalAssignment>) => u(await personalApiClient.put<{ data: PersonalAssignment }>(`/personal/tasks/${id}`, toPersonalTaskDto(dto))),
    delete: async (id: string) => u(await personalApiClient.delete<void>(`/personal/tasks/${id}`)),
  },
  grades: {
    list: async () => u(await personalApiClient.get<{ data: PersonalGrade[] }>('/personal/grades')),
    create: async (dto: Omit<PersonalGrade, 'id'>) => u(await personalApiClient.post<{ data: PersonalGrade }>('/personal/grades', { ...dto, subjectId: dto.courseId })),
    update: async (id: string, dto: Partial<PersonalGrade>) => u(await personalApiClient.put<{ data: PersonalGrade }>(`/personal/grades/${id}`, { ...dto, ...(dto.courseId ? { subjectId: dto.courseId } : {}) })),
    delete: async (id: string) => u(await personalApiClient.delete<void>(`/personal/grades/${id}`)),
  },
}

// =============================================================================
// SCHEDULES
// =============================================================================

export interface Schedule {
  id: string; dayOfWeek: string; startTime: string; endTime: string
  semesterId: string
  course: { id: string; name: string; code: string; type: string
            teacher: { firstName: string; lastName: string }
            classroom: { name: string; building: string } }
}

export const schedulesApi = {
  list: async () => u(await api.get<{ data: Schedule[] }>('/schedules')),
  mine: async () => u(await api.get<{ data: Schedule[] }>('/schedules/my')),
  create: async (dto: Partial<Schedule>) => u(await api.post<{ data: Schedule }>('/schedules', dto)),
}

// =============================================================================
// STUDENTS
// =============================================================================

export interface Student {
  id: string; firstName: string; lastName: string; matricule: string
  status: string
  level?: { name: string; program?: { name: string } }
  specialty?: { name: string }
  user?: { email: string }
}

export const studentsApi = {
  list:   async ()           => u(await api.get<{ data: Student[] }>('/students')),
  getOne: async (id: string) => u(await api.get<{ data: Student }>(`/students/${id}`)),
  create: async (dto: Partial<Student> & { userId?: string; levelId?: string; specialtyId?: string; email?: string }) => u(await api.post<{ data: Student }>('/students', dto)),
  update: async (id: string, dto: Partial<Student>) => u(await api.patch<{ data: Student }>(`/students/${id}`, dto)),
  delete: async (id: string) => u(await api.delete<void>(`/students/${id}`)),
}

// =============================================================================
// TEACHERS
// =============================================================================

export interface Teacher {
  id: string; firstName: string; lastName: string
  user?: { email: string }
  courses?: Course[]
}

export const teachersApi = {
  list:   async ()           => u(await api.get<{ data: Teacher[] }>('/teachers')),
  getOne: async (id: string) => u(await api.get<{ data: Teacher }>(`/teachers/${id}`)),
  create: async (dto: Partial<Teacher> & { userId?: string; email?: string }) => u(await api.post<{ data: Teacher }>('/teachers', dto)),
  update: async (id: string, dto: Partial<Teacher>) => u(await api.patch<{ data: Teacher }>(`/teachers/${id}`, dto)),
  delete: async (id: string) => u(await api.delete<void>(`/teachers/${id}`)),
}

// =============================================================================
// ATTENDANCE
// =============================================================================

export interface AttendanceSession {
  id: string; date: string; courseId: string
  course?: { name: string; code: string }
  records: AttendanceRecord[]
}
export interface AttendanceRecord {
  id: string; status: 'PRESENT' | 'ABSENT' | 'RETARD' | 'JUSTIFIE'
  studentId: string
  student?: { firstName: string; lastName: string; matricule: string }
}

export const attendanceApi = {
  listSessions: async () =>
    u(await api.get<{ data: AttendanceSession[] }>('/attendance/sessions')),

  createSession: async (dto: { courseId: string; date: string }) =>
    u(await api.post<{ data: AttendanceSession }>('/attendance/sessions', dto)),

  getSession: async (id: string) =>
    u(await api.get<{ data: AttendanceSession }>(`/attendance/sessions/${id}`)),

  byCourse: async (courseId: string) =>
    u(await api.get<{ data: AttendanceSession[] }>(`/attendance/sessions/by-course/${courseId}`)),

  mark: async (sessionId: string, dto: { studentId: string; status: string }) =>
    u(await api.patch<{ data: AttendanceRecord }>(`/attendance/sessions/${sessionId}/mark`, dto)),

  scan: async (dto: { qrCode: string }) =>
    u(await api.post<{ data: AttendanceRecord }>('/attendance/scan', dto)),
}

// =============================================================================
// CLASSROOMS
// =============================================================================

export interface Classroom {
  id: string; name: string; building: string; floor?: number
  capacity: number; type: string; isAvailable: boolean
  equipment?: string[]
}

export const classroomsApi = {
  list:   async ()           => u(await api.get<{ data: Classroom[] }>('/classrooms')),
  getOne: async (id: string) => u(await api.get<{ data: Classroom }>(`/classrooms/${id}`)),
  create: async (dto: Partial<Classroom>) => u(await api.post<{ data: Classroom }>('/classrooms', dto)),
  update: async (id: string, dto: Partial<Classroom>) => u(await api.patch<{ data: Classroom }>(`/classrooms/${id}`, dto)),
  delete: async (id: string) => u(await api.delete<void>(`/classrooms/${id}`)),
}

// =============================================================================
// NOTIFICATIONS
// =============================================================================

export interface Notification {
  id: string; title: string; message: string; type: string
  isRead: boolean; createdAt: string
}

export const notificationsApi = {
  list: async () => u(await api.get<{ data: Notification[] }>('/notifications')),
  unreadCount: async () => {
    const res = u(await api.get<{ data: { unreadCount: number } | number }>('/notifications/unread-count'))
    return typeof res === 'number' ? res : res?.unreadCount ?? 0
  },
  markRead: async (id: string) => u(await api.patch<{ data: Notification }>(`/notifications/${id}/read`)),
  delete: async (id: string) => u(await api.delete<void>(`/notifications/${id}`)),
}

// =============================================================================
// ASSIGNMENTS (DEVOIRS)
// =============================================================================

export interface Assignment {
  id: string; title: string; code: string; due: string
  progress: number; status: 'À rendre' | 'En retard' | 'Soumis' | 'Noté'
  grade?: string; description?: string; feedback?: string
  submittedAt?: string; submittedFile?: string; submissionNote?: string
}

export const assignmentsApi = {
  list: async () => u(await api.get<{ data: Assignment[] }>('/assignments')),
  mine: async () => u(await api.get<{ data: Assignment[] }>('/assignments')),
  create: async (dto: Partial<Assignment>) => u(await api.post<{ data: Assignment }>('/assignments', dto)),
  update: async (id: string, dto: Partial<Assignment>) => u(await api.patch<{ data: Assignment }>(`/assignments/${id}`, dto)),
  submit: async (id: string, fileInfo?: string) => u(await api.patch<{ data: Assignment }>(`/assignments/${id}`, { status: 'Soumis', progress: 100, file: fileInfo })),
  delete: async (id: string) => u(await api.delete<void>(`/assignments/${id}`)),
}

// =============================================================================
// GRADES (NOTES)
// =============================================================================

export interface Grade {
  id: string; ue: string; code: string; title: string
  type: string; coef: number; grade: number; classAvg: number; rank: number; maxRank: number
}

export const gradesApi = {
  mine: async () => u(await api.get<{ data: Grade[] }>('/grades')),
  create: async (dto: Partial<Grade>) => u(await api.post<{ data: Grade }>('/grades', dto)),
}

// =============================================================================
// MESSAGING (MESSAGERIE)
// =============================================================================

export interface ChatMessage {
  id: string; from: 'me' | 'them'; text: string; time: string; file?: string
}
export interface ChatConversation {
  id: string; name: string; role: string; email: string; online: boolean; time: string; preview: string; unread: number; messages: ChatMessage[]
}

export const messagingApi = {
  conversations: async () => u(await api.get<{ data: ChatConversation[] }>('/messages')),
  sendMessage: async (convId: string, text: string, file?: string) => u(await api.post<{ data: ChatConversation }>('/messages', { convId, text, file })),
}

// =============================================================================
// LIBRARY (BIBLIOTHÈQUE)
// =============================================================================

export interface LibraryResource {
  id: string; title: string; course: string; type: string; size: string; date: string; category: string; duration?: string
}

export const libraryApi = {
  list: async () => u(await api.get<{ data: LibraryResource[] }>('/library')),
  upload: async (dto: Partial<LibraryResource>) => u(await api.post<{ data: LibraryResource }>('/library', dto)),
}

// =============================================================================
// UE
// =============================================================================

export interface UE {
  id: string; name: string; code: string; credits: number
  courses?: Course[]
}

export const ueApi = {
  list:      async ()              => u(await api.get<{ data: UE[] }>('/ue')),
  byLevel:   async (id: string)    => u(await api.get<{ data: UE[] }>(`/ue/by-level/${id}`)),
  bySemester:async (id: string)    => u(await api.get<{ data: UE[] }>(`/ue/by-semester/${id}`)),
  getOne:    async (id: string)    => u(await api.get<{ data: UE }>(`/ue/${id}`)),
  create:    async (dto: Partial<UE> & { levelId?: string; semesterId?: string }) => u(await api.post<{ data: UE }>('/ue', dto)),
  update:    async (id: string, dto: Partial<UE>) => u(await api.patch<{ data: UE }>(`/ue/${id}`, dto)),
  delete:    async (id: string) => u(await api.delete<void>(`/ue/${id}`)),
}

// =============================================================================
// AUDIT LOGS
// =============================================================================

export interface AuditLog {
  id: string
  userId?: string
  userRole?: string
  action: string
  resource: string
  resourceId?: string
  ipAddress?: string
  userAgent?: string
  statusCode?: number
  details?: any
  createdAt: string
}

export const auditLogsApi = {
  list: async (page = 1, limit = 50, resource?: string) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) })
    if (resource) params.set('resource', resource)
    return u(await api.get<{ data: AuditLog[] }>(`/audit-logs?${params.toString()}`))
  },
  getOne: async (id: string) => u(await api.get<{ data: AuditLog }>(`/audit-logs/${id}`)),
}

// =============================================================================
// USERS ADMIN
// =============================================================================

export const usersApi = {
  listAll: async () => {
    const [students, teachers] = await Promise.all([
      studentsApi.list(),
      teachersApi.list()
    ])
    return [...students.map(s => ({ ...s, type: 'student' })), ...teachers.map(t => ({ ...t, type: 'teacher' }))]
  }
}

export interface OverviewStats {
  studentCount: number
  teacherCount: number
  courseCount: number
  satisfactionRate: number
  supportAvailability: string
  assignmentCount?: number
  gradeCount?: number
  averageGrade?: number | null
  attendanceRate?: number | null
}

export const statsApi = {
  overview: async (): Promise<OverviewStats> =>
    u(await api.get<{ data: OverviewStats }>('/stats/overview')),
}

// =============================================================================
// VIDEO CONFERENCE
// =============================================================================

export interface VideoRoom { roomName: string; token: string; serverUrl: string }

export const videoApi = {
  create: async (dto: { courseId?: string; roomName?: string }) =>
    u(await api.post<{ data: VideoRoom }>('/videoconference/rooms', dto)),
}

// =============================================================================
// ENROLLMENTS
// =============================================================================

export interface Enrollment {
  id: string; status: string; teachingUnitId: string
  teachingUnit?: { name: string; code: string; credits: number }
}

export const enrollmentsApi = {
  mine: async () => u(await api.get<{ data: Enrollment[] }>('/enrollments/my')),
  list: async () => u(await api.get<{ data: Enrollment[] }>('/enrollments')),
  byStudent: async (studentId: string) => u(await api.get<{ data: Enrollment[] }>(`/enrollments/by-student/${studentId}`)),
  byUe: async (ueId: string) => u(await api.get<{ data: Enrollment[] }>(`/enrollments/by-ue/${ueId}`)),
  create: async (dto: { studentId: string; teachingUnitId: string }) => u(await api.post<{ data: Enrollment }>('/enrollments', dto)),
  updateStatus: async (id: string, status: string) => u(await api.patch<{ data: Enrollment }>(`/enrollments/${id}/status`, { status })),
}

// =============================================================================
// FILE UPLOAD
// =============================================================================

export const filesApi = {
  upload: async (formData: FormData) => {
    const token = getToken()
    const activeBase = getActiveApiUrl().replace(/\/+$/, '')
    const res = await fetch(`${activeBase}/files`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    })
    if (!res.ok) throw new ApiError(res.status, 'Upload échoué')
    return u(await res.json())
  },
}

// =============================================================================
// SETTINGS & HELP/SUPPORT
// =============================================================================

export interface UserSettings {
  notifications?: Record<string, boolean>
  privacy?: Record<string, boolean>
  advanced?: Record<string, boolean>
  language?: string
}

export const settingsApi = {
  get: async () => u(await api.get<{ data: UserSettings }>('/settings')),
  update: async (settings: UserSettings) => u(await api.post<{ data: UserSettings }>('/settings', settings)),
}

export interface SupportTicket {
  id?: string
  message: string
  category?: string
  status?: string
}

export const supportApi = {
  faqs: async () => u(await api.get<{ data: { q: string; a: string; cat: string }[] }>('/faq')),
  sendTicket: async (ticket: SupportTicket) => u(await api.post<{ data: SupportTicket }>('/support/tickets', ticket)),
}

// ─── API ABONNEMENTS ET COMPTES INDÉPENDANTS (BACKEND 2 VERCEL) ───────────────

export interface SubscriptionPlan {
  id: string
  code: string
  name: string
  category: 'PERSONAL' | 'TEACHER' | 'INSTITUTION'
  countryCode?: string
  currency?: string
  priceMonthlyAmount: number
  priceAnnuallyAmount: number
  priceMonthly: string
  priceAnnually: string
  period: string
  badge?: string
  highlight?: boolean
  description: string
  btnText: string
  btnVariant?: string
  providers: string[]
  features: string[]
  status?: 'ACTIVE' | 'INACTIVE'
}

export interface PricingInfo {
  countryCode: string
  currency: 'XAF' | 'EUR' | 'USD'
  amount: number
  formattedPrice: string
  billingInterval: string
  providers: string[]
}

export interface SubscriptionStatus {
  status: 'NONE' | 'PENDING' | 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'EXPIRED'
  planCode?: string | null
  countryCode?: string | null
  currency?: string | null
  monthlyAmount?: number | null
  currentPeriodEnd?: string | null
  isAutoRenew: boolean
}

export interface CheckoutResult {
  transactionId?: string
  paymentUrl?: string
  status?: string
  message?: string
}

export type CheckoutPayload = {
  planId?: string
  planCode: string
  countryCode: string
  paymentProvider?: string
  phoneNumber?: string
  billingInterval?: 'MONTHLY' | 'ANNUALLY'
  billingCycle: 'monthly' | 'annually'
  email?: string
  fullName?: string
}

export const subscriptionApi = {
  getPlans: async (): Promise<SubscriptionPlan[]> =>
    u(await api.get<SubscriptionPlan[]>('/subscription/plans')),
  getPlanById: async (idOrCode: string): Promise<SubscriptionPlan | null> =>
    u(await api.get<SubscriptionPlan | null>(`/subscription/plans/${idOrCode}`)),
  getPricing: async (countryCode = 'CM'): Promise<PricingInfo> =>
    u(await api.get<PricingInfo>(`/subscription/pricing?countryCode=${encodeURIComponent(countryCode)}`)),
  getStatus: async (): Promise<SubscriptionStatus> =>
    u(await api.get<SubscriptionStatus>('/subscription/status')),
  createCheckout: async (payload: CheckoutPayload) =>
    u(await api.post<CheckoutResult>('/subscription/checkout', payload)),
}

async function personalRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const base = PERSONAL_API_URL.replace(/\/+$/, '')
  if (!base) throw new ApiError(503, 'Le backend personnel n’est pas configuré pour cet environnement.')
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  const requestPath = cleanPath.startsWith('/api/') ? cleanPath : `/api/v1${cleanPath}`
  const token = getToken()
  const response = await fetch(`${base}${requestPath}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers ?? {}),
    },
  })
  if (!response.ok) {
    let body: { message?: string } | null = null
    try { body = await response.json() } catch {}
    const message = response.status === 404
      ? `Route ${requestPath} introuvable sur le backend personnel configuré (${base}). Vérifiez que le service expose cette route.`
      : body?.message || `Erreur du backend personnel HTTP ${response.status}`
    throw new ApiError(response.status, message, body)
  }
  if (response.status === 204) return null as T
  return u(await response.json())
}

export const personalSubscriptionApi = {
  getPlans: async (): Promise<SubscriptionPlan[]> => personalRequest<SubscriptionPlan[]>('/subscription/plans'),
  getPlanById: async (idOrCode: string): Promise<SubscriptionPlan | null> => personalRequest<SubscriptionPlan | null>(`/subscription/plans/${encodeURIComponent(idOrCode)}`),
  getPricing: async (countryCode = 'CM'): Promise<PricingInfo> => personalRequest<PricingInfo>(`/subscription/pricing?countryCode=${encodeURIComponent(countryCode)}`),
  getStatus: async (): Promise<SubscriptionStatus> => personalRequest<SubscriptionStatus>('/subscription/status'),
  createCheckout: async (payload: CheckoutPayload): Promise<CheckoutResult> => personalRequest<CheckoutResult>('/subscription/checkout', { method: 'POST', body: JSON.stringify(payload) }),
}


