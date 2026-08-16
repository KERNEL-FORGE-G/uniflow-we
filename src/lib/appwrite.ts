import { Account, Client, Databases, ID, Permission, Query, Role, type Models } from 'appwrite'

const endpoint = String(import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1').replace(/\/+$/, '')
const projectId = String(import.meta.env.VITE_APPWRITE_PROJECT_ID || '6a80ed6d002ccb5cec52')
export const APPWRITE_DATABASE_ID = String(import.meta.env.VITE_APPWRITE_DATABASE_ID || 'uniflow')
export const APPWRITE_BUCKET_ID = String(import.meta.env.VITE_APPWRITE_STORAGE_BUCKET_ID || 'avatars')

export const appwriteClient = new Client().setEndpoint(endpoint).setProject(projectId)
export const appwriteAccount = new Account(appwriteClient)
export const appwriteDatabases = new Databases(appwriteClient)

export type UniFlowAccountType = 'UNIVERSITY' | 'PERSONAL'
export type UniFlowRole = 'STUDENT' | 'DELEGATE' | 'TEACHER' | 'ADMIN'

export interface UniFlowUser {
  id: string
  email: string
  name: string
  accountType: UniFlowAccountType
  role: UniFlowRole
  university?: string
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

const userPermissions = (userId: string) => [
  Permission.read(Role.user(userId)),
  Permission.update(Role.user(userId)),
  Permission.delete(Role.user(userId)),
]

export async function createAccount(email: string, password: string, name: string, accountType: UniFlowAccountType, role: UniFlowRole) {
  const account = await appwriteAccount.create(ID.unique(), email.trim(), password, name.trim())
  // Appwrite interdit plusieurs sessions simultanées dans ce flux client :
  // fermer une session résiduelle permet de terminer une inscription depuis
  // une page conservée ouverte ou après un changement de compte.
  try { await appwriteAccount.deleteSession('current') } catch { /* aucune session précédente */ }
  await appwriteAccount.createEmailPasswordSession(email.trim(), password)
  const profile = await appwriteAccount.get()
  // L’inscription ne dépend pas d’une collection de profil optionnelle :
  // le compte Auth est la source de vérité immédiate. Le profil sera créé par
  // le flux de paramètres dès que la collection est provisionnée avec CREATE.
  return normalizeUser(profile, accountType, role)
}

export async function loginAccount(email: string, password: string, accountType: UniFlowAccountType) {
  await appwriteAccount.createEmailPasswordSession(email.trim(), password)
  const profile = await appwriteAccount.get()
  const collectionId = accountType === 'PERSONAL' ? 'personal_users' : 'users'
  let role: UniFlowRole = accountType === 'PERSONAL' ? 'STUDENT' : 'STUDENT'
  try {
    const doc = await appwriteDatabases.getDocument(APPWRITE_DATABASE_ID, collectionId, profile.$id)
    role = normalizeRole((doc as { role?: string }).role, accountType)
  } catch {
    // Le profil peut ne pas encore exister : l’interface reste authentifiée et affiche un état incomplet honnête.
  }
  return normalizeUser(profile, accountType, role)
}

export async function getCurrentAccount(): Promise<UniFlowUser | null> {
  try {
    const profile = await appwriteAccount.get()
    const rawType = localStorage.getItem('uniflow_account_type') === 'PERSONAL' ? 'PERSONAL' : 'UNIVERSITY'
    return normalizeUser(profile, rawType, rawType === 'PERSONAL' ? 'STUDENT' : 'STUDENT')
  } catch {
    return null
  }
}

export async function logoutAccount() {
  try { await appwriteAccount.deleteSession('current') } catch { /* already logged out */ }
}

export async function listDocuments<T>(collectionId: string, queries: string[] = []) {
  const result = await appwriteDatabases.listDocuments<Models.Document>(APPWRITE_DATABASE_ID, collectionId, queries)
  return result.documents as unknown as T[]
}

export async function listPersonalSubjects(ownerId: string) {
  return listDocuments<PersonalSubject>('personal_subjects', [Query.equal('ownerId', ownerId), Query.orderDesc('$createdAt')])
}

export async function listPersonalTasks(ownerId: string) {
  return listDocuments<PersonalTask>('personal_tasks', [Query.equal('ownerId', ownerId), Query.orderDesc('$createdAt')])
}

export async function listPersonalSchedules(ownerId: string) {
  return listDocuments<PersonalSchedule>('personal_schedules', [Query.equal('ownerId', ownerId), Query.orderAsc('startsAt')])
}

export async function listPersonalGrades(ownerId: string) {
  return listDocuments<PersonalGrade>('personal_grades', [Query.equal('ownerId', ownerId), Query.orderDesc('$createdAt')])
}

export async function createPersonalSubject(ownerId: string, data: Omit<PersonalSubject, '$id' | 'ownerId'>) {
  return appwriteDatabases.createDocument(APPWRITE_DATABASE_ID, 'personal_subjects', ID.unique(), { ownerId, ...data })
}

export async function createPersonalTask(ownerId: string, data: Omit<PersonalTask, '$id' | 'ownerId'>) {
  return appwriteDatabases.createDocument(APPWRITE_DATABASE_ID, 'personal_tasks', ID.unique(), { ownerId, ...data })
}

export async function createPersonalSchedule(ownerId: string, data: Omit<PersonalSchedule, '$id' | 'ownerId'>) {
  return appwriteDatabases.createDocument(APPWRITE_DATABASE_ID, 'personal_schedules', ID.unique(), { ownerId, ...data })
}

export async function createPersonalGrade(ownerId: string, data: Omit<PersonalGrade, '$id' | 'ownerId'>) {
  return appwriteDatabases.createDocument(APPWRITE_DATABASE_ID, 'personal_grades', ID.unique(), { ownerId, ...data })
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

function normalizeUser(profile: Models.User<Models.Preferences>, accountType: UniFlowAccountType, role: UniFlowRole): UniFlowUser {
  return { id: profile.$id, email: profile.email, name: profile.name, accountType, role }
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

function storedOwnerId() {
  try {
    const raw = localStorage.getItem('uniflow_user')
    const user = raw ? JSON.parse(raw) as { id?: string } : null
    if (!user?.id) throw new Error('Session Appwrite absente. Connectez-vous avant de gérer vos données personnelles.')
    return user.id
  } catch (error) {
    throw error instanceof Error ? error : new Error('Session Appwrite absente.')
  }
}

function ownerPermissions(ownerId: string) {
  // Appwrite interdit Permission.create au niveau d’un document/row.
  // CREATE doit être accordé au niveau de la collection ; le document reste privé au propriétaire.
  return [Permission.read(Role.user(ownerId)), Permission.update(Role.user(ownerId)), Permission.delete(Role.user(ownerId))]
}

function subjectToCourse(doc: Record<string, any>): PersonalCourseRecord {
  return { id: doc.$id, code: doc.code || '', title: doc.title || doc.name || '', instructor: doc.instructor || '', credits: typeof doc.credits === 'number' ? doc.credits : undefined, colorHex: doc.colorHex || '#0d9488', classroom: doc.classroom || '', description: doc.description || '', createdAt: doc.$createdAt }
}
function scheduleToUi(doc: Record<string, any>): PersonalScheduleRecord {
  return { id: doc.$id, courseId: doc.courseId || '', dayOfWeek: doc.dayOfWeek || '', startTime: doc.startTime || '', endTime: doc.endTime || '', classroom: doc.classroom || '', type: doc.type || '' }
}
function taskToUi(doc: Record<string, any>): PersonalAssignmentRecord {
  return { id: doc.$id, courseId: doc.courseId || '', title: doc.title || '', dueDate: doc.dueDate || '', description: doc.description || '', priority: doc.priority || '', status: doc.status || '' }
}
function gradeToUi(doc: Record<string, any>): PersonalGradeRecord {
  return { id: doc.$id, courseId: doc.courseId || doc.subjectId || '', evaluationTitle: doc.evaluationTitle || doc.label || '', score: Number(doc.score || 0), maxScore: Number(doc.maxScore || 20), coefficient: Number(doc.coefficient || 1) }
}

export const personalAppwriteApi = {
  courses: {
    list: async () => (await listPersonalSubjects(storedOwnerId())).map(subjectToCourse),
    create: async (dto: Omit<PersonalCourseRecord, 'id' | 'createdAt'>) => {
      const ownerId = storedOwnerId()
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
    list: async () => (await listPersonalSchedules(storedOwnerId())).map(scheduleToUi),
    create: async (dto: Omit<PersonalScheduleRecord, 'id' | 'courseTitle' | 'courseCode' | 'colorHex'>) => {
      const ownerId = storedOwnerId()
      const doc = await appwriteDatabases.createDocument(APPWRITE_DATABASE_ID, 'personal_schedules', ID.unique(), { ownerId, ...dto })
      return scheduleToUi(doc as Record<string, any>)
    },
    update: async (id: string, dto: Partial<PersonalScheduleRecord>) => scheduleToUi(await appwriteDatabases.updateDocument(APPWRITE_DATABASE_ID, 'personal_schedules', id, dto) as Record<string, any>),
    delete: async (id: string) => { await appwriteDatabases.deleteDocument(APPWRITE_DATABASE_ID, 'personal_schedules', id) },
  },
  assignments: {
    list: async () => (await listPersonalTasks(storedOwnerId())).map(taskToUi),
    create: async (dto: Omit<PersonalAssignmentRecord, 'id'>) => {
      const ownerId = storedOwnerId()
      const doc = await appwriteDatabases.createDocument(APPWRITE_DATABASE_ID, 'personal_tasks', ID.unique(), { ownerId, ...dto })
      return taskToUi(doc as Record<string, any>)
    },
    update: async (id: string, dto: Partial<PersonalAssignmentRecord>) => taskToUi(await appwriteDatabases.updateDocument(APPWRITE_DATABASE_ID, 'personal_tasks', id, dto) as Record<string, any>),
    delete: async (id: string) => { await appwriteDatabases.deleteDocument(APPWRITE_DATABASE_ID, 'personal_tasks', id) },
  },
  grades: {
    list: async () => (await listPersonalGrades(storedOwnerId())).map(gradeToUi),
    create: async (dto: Omit<PersonalGradeRecord, 'id'>) => {
      const ownerId = storedOwnerId()
      const doc = await appwriteDatabases.createDocument(APPWRITE_DATABASE_ID, 'personal_grades', ID.unique(), { ownerId, subjectId: dto.courseId, courseId: dto.courseId, label: dto.evaluationTitle, evaluationTitle: dto.evaluationTitle, score: String(dto.score), maxScore: String(dto.maxScore), coefficient: String(dto.coefficient) })
      return gradeToUi(doc as Record<string, any>)
    },
    update: async (id: string, dto: Partial<PersonalGradeRecord>) => gradeToUi(await appwriteDatabases.updateDocument(APPWRITE_DATABASE_ID, 'personal_grades', id, { ...dto, ...(dto.courseId ? { subjectId: dto.courseId } : {}), ...(dto.evaluationTitle ? { label: dto.evaluationTitle } : {}) }) as Record<string, any>),
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
