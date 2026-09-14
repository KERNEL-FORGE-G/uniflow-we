import { randomUUID } from 'node:crypto'

const endpoint = (process.env.APPWRITE_SELF_HOSTED_ENDPOINT || 'https://appwrite.kernelforge.codes/v1').replace(/\/+$/, '')
const projectId = process.env.APPWRITE_SELF_HOSTED_PROJECT_ID || '6a959096002a64d9d4e6'
const apiKey = process.env.APPWRITE_SELF_HOSTED_API_KEY
const databaseId = 'uniflow'
const courseId = 'course_ict4d_l1_01'
const courseForGradesId = 'course_ict4d_l1_02'
const runId = `e2e${Date.now().toString(36)}${randomUUID().slice(0, 4)}`.toLowerCase()
const password = `E2e!${randomUUID().replaceAll('-', '')}`

if (!apiKey) throw new Error('APPWRITE_SELF_HOSTED_API_KEY est requis pour la suite E2E UY1.')

const created = { users: [], documents: [], sessions: [] }
const result = { runId, startedAt: new Date().toISOString(), steps: {}, performance: {}, cleanup: { ok: false, errors: [] } }

function permissionFor(userId) {
  return [`read("user:${userId}")`, `update("user:${userId}")`, `delete("user:${userId}")`]
}

function query(method, attribute, values) {
  return JSON.stringify({ method, ...(attribute ? { attribute } : {}), ...(values === undefined ? {} : { values: Array.isArray(values) ? values : [values] }) })
}

function queryString(queries = []) {
  return queries.map((item, index) => `queries%5B${index}%5D=${encodeURIComponent(item)}`).join('&')
}

async function fetchWithRetry(url, options) {
  let lastError
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await fetch(url, options)
    } catch (error) {
      lastError = error
      if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)))
    }
  }
  throw lastError
}

async function request(path, { method = 'GET', body, jwt, cookieHeader, queryValues = [], server = false, includeResponse = false } = {}) {
  const url = `${endpoint}${path}${queryValues.length ? `?${queryString(queryValues)}` : ''}`
  const response = await fetchWithRetry(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-Appwrite-Project': projectId,
      ...(server ? { 'X-Appwrite-Key': apiKey } : {}),
      ...(jwt ? { 'X-Appwrite-JWT': jwt } : {}),
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  })
  const text = await response.text()
  let data = {}
  try { data = text ? JSON.parse(text) : {} } catch { data = { message: text } }
  if (!response.ok) throw new Error(`${method} ${path} (${response.status}) : ${data.message || 'réponse Appwrite invalide'}`)
  if (!includeResponse) return data
  const setCookies = typeof response.headers.getSetCookie === 'function'
    ? response.headers.getSetCookie()
    : [response.headers.get('set-cookie')].filter(Boolean)
  return { data, setCookies }
}

async function createAccount(kind, role) {
  const userId = `${kind}_${runId}`.slice(0, 36)
  const email = `${kind}.${runId}@e2e.invalid`
  const name = `E2E ${kind.toUpperCase()} UY1`
  await request('/users', { method: 'POST', server: true, body: { userId, email, password, name } })
  created.users.push(userId)
  await request(`/databases/${databaseId}/collections/users/documents`, {
    method: 'POST',
    server: true,
    body: {
      documentId: userId,
      data: { email, name, accountType: 'UNIVERSITY', role, university: 'Université de Yaoundé I', program: 'ICT4D', level: 'L1', country: 'Cameroun' },
      permissions: permissionFor(userId),
    },
  })
  created.documents.push({ collection: 'users', id: userId })
  const login = await request('/account/sessions/email', { method: 'POST', body: { email, password }, includeResponse: true })
  const cookieHeader = login.setCookies.map((value) => value.split(';', 1)[0]).join('; ')
  const jwt = await request('/account/jwt', { method: 'POST', cookieHeader })
  return { userId, email, jwt: jwt.jwt }
}

async function createAdmin() {
  const admin = await createAccount('admin', 'ADMIN')
  const directoryId = `directory_${admin.userId}`
  await request(`/databases/${databaseId}/collections/academic_directory/documents`, {
    method: 'POST',
    server: true,
    body: {
      documentId: directoryId,
      data: { userId: admin.userId, name: 'E2E Admin UY1', role: 'ADMIN', university: 'Université de Yaoundé I', program: 'ICT4D', level: 'L1', matricule: '', status: 'ACTIVE' },
      permissions: permissionFor(admin.userId),
    },
  })
  created.documents.push({ collection: 'academic_directory', id: directoryId })
  return admin
}

async function executeFunction(functionId, payload, jwt, { allowEmptyResponse = false } = {}) {
  const started = performance.now()
  const execution = await request(`/functions/${functionId}/executions`, {
    method: 'POST',
    jwt,
    body: { body: JSON.stringify(payload), async: true },
  })
  const deadline = Date.now() + 120_000
  let completed = execution
  while (!['completed', 'failed'].includes(completed.status)) {
    if (Date.now() > deadline) throw new Error(`${functionId} n’a pas terminé dans le délai E2E de 120 secondes.`)
    await new Promise((resolve) => setTimeout(resolve, 1_000))
    completed = await request(`/functions/${functionId}/executions/${execution.$id}`, { server: true })
  }
  const clientDurationMs = Number((performance.now() - started).toFixed(2))
  let response = {}
  try { response = JSON.parse(completed.responseBody || '{}') } catch { throw new Error(`${functionId} a renvoyé un corps non JSON.`) }
  if (Object.keys(response).length === 0 && allowEmptyResponse && completed.responseStatusCode < 400) response = { ok: true }
  if (completed.responseStatusCode >= 400 || response.ok !== true) throw new Error(`${functionId} a refusé l’action : ${response.message || response.code || completed.responseStatusCode}`)
  return { response, clientDurationMs, functionDurationSeconds: Number(completed.duration || 0) }
}

function percentile(values, ratio) {
  if (!values.length) return 0
  const ordered = [...values].sort((a, b) => a - b)
  return Number(ordered[Math.min(ordered.length - 1, Math.ceil(ordered.length * ratio) - 1)].toFixed(2))
}

async function listDocuments(collection, queries = []) {
  return request(`/databases/${databaseId}/collections/${collection}/documents`, { server: true, queryValues: [query('limit', undefined, 100), ...queries] })
}

async function deleteTrackedDocuments() {
  const conversations = (await listDocuments('chat_conversations')).documents || []
  const ownedConversations = conversations.filter((document) => [document.participantA, document.participantB].includes(created.studentId) || [document.participantA, document.participantB].includes(created.delegateId))
  const conversationIds = new Set(ownedConversations.map((document) => document.$id))
  const messages = (await listDocuments('chat_messages')).documents || []
  for (const document of messages.filter((message) => conversationIds.has(message.conversationId))) {
    await request(`/databases/${databaseId}/collections/chat_messages/documents/${document.$id}`, { method: 'DELETE', server: true })
  }
  for (const document of ownedConversations) {
    await request(`/databases/${databaseId}/collections/chat_conversations/documents/${document.$id}`, { method: 'DELETE', server: true })
  }
  const dynamicCollections = ['academic_grades', 'attendance_records', 'attendance_sessions', 'academic_enrollments', 'subscription_payment_requests', 'subscription_statuses']
  for (const collection of dynamicCollections) {
    const documents = (await listDocuments(collection)).documents || []
    const matches = documents.filter((document) => document.studentId === created.studentId || document.userId === created.studentId || document.createdBy === created.delegateId || document.createdBy === created.adminId || created.sessions.includes(document.$id))
    for (const document of matches) {
      await request(`/databases/${databaseId}/collections/${collection}/documents/${document.$id}`, { method: 'DELETE', server: true })
    }
  }
  for (const document of [...created.documents].reverse()) {
    await request(`/databases/${databaseId}/collections/${document.collection}/documents/${document.id}`, { method: 'DELETE', server: true })
  }
  for (const userId of [...created.users].reverse()) {
    await request(`/users/${userId}`, { method: 'DELETE', server: true })
  }
}

async function cleanup() {
  try {
    await deleteTrackedDocuments()
    result.cleanup.ok = true
  } catch (error) {
    result.cleanup.errors.push(error instanceof Error ? error.message : String(error))
  }
}

try {
  const [student, delegate] = await Promise.all([createAccount('student', 'STUDENT'), createAccount('delegate', 'DELEGATE')])
  const admin = await createAdmin()
  Object.assign(created, { studentId: student.userId, delegateId: delegate.userId, adminId: admin.userId })

  const [studentProvision, delegateProvision] = await Promise.all([
    executeFunction('academic_registration', { action: 'provision', matricule: `E2E-${runId}` }, student.jwt, { allowEmptyResponse: true }),
    executeFunction('academic_registration', { action: 'provision', matricule: `E2E-DEL-${runId}` }, delegate.jwt, { allowEmptyResponse: true }),
  ])
  result.steps.inscription = {
    studentFunctionAccepted: studentProvision.response.ok === true,
    delegateFunctionAccepted: delegateProvision.response.ok === true,
  }

  const enrollments = await listDocuments('academic_enrollments', [query('equal', 'studentId', student.userId)])
  const activeEnrollments = (enrollments.documents || []).filter((entry) => entry.status !== 'INACTIVE')
  if (activeEnrollments.length !== 10) throw new Error(`Inscription E2E incomplète : ${activeEnrollments.length} inscriptions actives sur 10.`)
  result.steps.inscriptions = { activeCourses: activeEnrollments.length }

  const attendanceDate = '2030-01-01T09:00:00.000Z'
  const rollPayload = { action: 'roll', courseId, date: attendanceDate, rows: [{ studentId: student.userId, status: 'PRESENT' }] }
  const attendance = await executeFunction('attendance_secure', rollPayload, delegate.jwt, { allowEmptyResponse: true })
  const matchingSessions = (await listDocuments('attendance_sessions')).documents.filter((entry) => entry.courseId === courseId && String(entry.date).slice(0, 10) === attendanceDate.slice(0, 10))
  if (matchingSessions.length !== 1) throw new Error(`Appel E2E invalide : ${matchingSessions.length} séance(s) trouvée(s) pour le même cours et la même date.`)
  created.sessions.push(matchingSessions[0].$id)
  result.steps.appel = { functionAccepted: attendance.response.ok === true, sessionCreated: true }

  const burstSizes = [1, 4, 8]
  for (const size of burstSizes) {
    const responses = await Promise.allSettled(Array.from({ length: size }, () => executeFunction('attendance_secure', rollPayload, delegate.jwt, { allowEmptyResponse: true })))
    const successful = responses.filter((entry) => entry.status === 'fulfilled').map((entry) => entry.value)
    if (successful.length !== size) throw new Error(`Rafale de ${size} appels : ${size - successful.length} échec(s).`)
    const clientMs = successful.map((entry) => entry.clientDurationMs)
    const functionSeconds = successful.map((entry) => entry.functionDurationSeconds)
    result.performance[`burst_${size}`] = {
      requests: size,
      successful: successful.length,
      clientMs: { p50: percentile(clientMs, 0.5), p95: percentile(clientMs, 0.95), max: Math.max(...clientMs) },
      functionSeconds: { p50: percentile(functionSeconds, 0.5), p95: percentile(functionSeconds, 0.95), max: Math.max(...functionSeconds) },
      functionAccepted: successful.every((entry) => entry.response.ok === true),
    }
  }

  const roster = await executeFunction('academic_grades', { action: 'roster', courseId: courseForGradesId }, admin.jwt, { allowEmptyResponse: true })
  const gradeTitle = `E2E ${runId}`
  const grade = await executeFunction('academic_grades', { action: 'upsert', courseId: courseForGradesId, studentId: student.userId, evaluationTitle: gradeTitle, type: 'CC', score: 14, maxScore: 20, coefficient: 2 }, admin.jwt, { allowEmptyResponse: true })
  const matchingGrades = (await listDocuments('academic_grades')).documents.filter((entry) => entry.studentId === student.userId && entry.courseId === courseForGradesId && entry.evaluationTitle === gradeTitle)
  if (matchingGrades.length !== 1) throw new Error(`Note E2E invalide : ${matchingGrades.length} évaluation(s) trouvée(s).`)
  const gradeId = matchingGrades[0].$id
  result.steps.notes = { rosterFunctionAccepted: roster.response.ok === true, gradeFunctionAccepted: grade.response.ok === true, gradeStored: true }

  const studentGrades = await request(`/databases/${databaseId}/collections/academic_grades/documents`, { jwt: student.jwt })
  if (!(studentGrades.documents || []).some((entry) => entry.$id === gradeId)) throw new Error('Le relevé apprenant ne peut pas lire la note E2E attribuée.')
  await executeFunction('academic_grades', { action: 'delete', courseId: courseForGradesId, studentId: student.userId, gradeId }, admin.jwt, { allowEmptyResponse: true })
  result.steps.releve = { studentCanReadGrade: true, gradeCleanupByFunction: true }

  await executeFunction('messaging', { action: 'open', email: student.email }, delegate.jwt, { allowEmptyResponse: true })
  const conversations = (await listDocuments('chat_conversations')).documents.filter((entry) => [entry.participantA, entry.participantB].includes(student.userId) && [entry.participantA, entry.participantB].includes(delegate.userId))
  if (conversations.length !== 1) throw new Error(`Conversation E2E invalide : ${conversations.length} conversation(s) trouvée(s).`)
  const chatText = `Contrôle E2E UY1 ${runId}`
  await executeFunction('messaging', { action: 'send', conversationId: conversations[0].$id, text: chatText }, delegate.jwt, { allowEmptyResponse: true })
  await executeFunction('messaging', { action: 'list' }, student.jwt, { allowEmptyResponse: true })
  const studentMessages = await request('/databases/uniflow/collections/chat_messages/documents', { jwt: student.jwt })
  const sentMessage = (studentMessages.documents || []).find((entry) => entry.conversationId === conversations[0].$id && entry.body === chatText && entry.senderId === delegate.userId)
  if (!sentMessage) throw new Error('Le destinataire E2E ne peut pas lire le message universitaire envoyé.')
  await executeFunction('messaging', { action: 'read', conversationId: conversations[0].$id }, student.jwt, { allowEmptyResponse: true })
  const messageAfterRead = await request(`/databases/${databaseId}/collections/chat_messages/documents/${sentMessage.$id}`, { server: true })
  const recipientReadField = conversations[0].participantA === student.userId ? 'readByA' : 'readByB'
  if (messageAfterRead[recipientReadField] !== true) throw new Error('Le marquage lu Appwrite du destinataire n’a pas été persisté.')
  result.steps.messaging = { conversationCreated: true, studentCanReadMessage: true, explicitReadPersisted: true }

  const paymentPlanId = `qa_pay_${runId}`.slice(0, 36)
  const paymentPlanCode = `qa_whatsapp_${runId}`
  await request(`/databases/${databaseId}/collections/subscription_plans/documents`, {
    method: 'POST',
    server: true,
    body: {
      documentId: paymentPlanId,
      data: {
        code: paymentPlanCode,
        name: 'Plan QA WhatsApp',
        category: 'PERSONAL',
        countryCode: 'CM',
        currency: 'XAF',
        priceMonthlyAmount: 1,
        priceAnnuallyAmount: 12,
        period: 'QA uniquement',
        badge: 'Test automatisé',
        highlight: false,
        description: `Plan temporaire E2E ${runId}`,
        providers: '[]',
        status: 'ACTIVE',
      },
      permissions: ['read("users")'],
    },
  })
  created.documents.push({ collection: 'subscription_plans', id: paymentPlanId })
  await executeFunction('subscription_payments', {
    action: 'create',
    planCode: paymentPlanCode,
    billingCycle: 'MONTHLY',
    fullName: 'E2E Student UY1',
    email: student.email,
    phoneNumber: '',
  }, student.jwt, { allowEmptyResponse: true })
  const paymentRequests = (await listDocuments('subscription_payment_requests')).documents.filter((entry) => entry.userId === student.userId && entry.planCode === paymentPlanCode)
  if (paymentRequests.length !== 1 || paymentRequests[0].status !== 'PENDING' || !String(paymentRequests[0].reference || '').startsWith('UF-')) {
    throw new Error('La demande de paiement WhatsApp E2E n’est pas persistée correctement en attente.')
  }
  await executeFunction('subscription_payments', { action: 'review', requestId: paymentRequests[0].$id, decision: 'CONFIRMED', adminNote: 'Validation QA sans message WhatsApp réel.' }, admin.jwt, { allowEmptyResponse: true })
  const confirmedRequest = await request(`/databases/${databaseId}/collections/subscription_payment_requests/documents/${paymentRequests[0].$id}`, { server: true })
  const paymentStatus = (await listDocuments('subscription_statuses')).documents.find((entry) => entry.userId === student.userId)
  if (confirmedRequest.status !== 'CONFIRMED' || !paymentStatus || paymentStatus.status !== 'ACTIVE' || paymentStatus.planCode !== paymentPlanCode) {
    throw new Error('La confirmation administrative E2E ne met pas correctement à jour le statut Appwrite.')
  }
  result.steps.subscriptionPayment = { requestPersistedPending: true, referenceGenerated: true, adminConfirmationActivatedStatus: true, whatsappMessageNotSent: true }

  const audit = await executeFunction('attendance_secure', { action: 'audit' }, admin.jwt, { allowEmptyResponse: true })
  const recordsForSession = (await listDocuments('attendance_records')).documents.filter((entry) => entry.sessionId === matchingSessions[0].$id && entry.studentId === student.userId)
  if (recordsForSession.length !== 1) throw new Error(`Idempotence E2E invalide : ${recordsForSession.length} relevé(s) trouvé(s) pour la même séance.`)
  result.steps.integrity = { auditFunctionAccepted: audit.response.ok === true, singleAttendanceRecord: true }

  result.passed = true
} catch (error) {
  result.passed = false
  result.error = error instanceof Error ? error.message : String(error)
} finally {
  await cleanup()
  result.finishedAt = new Date().toISOString()
  console.log(JSON.stringify(result, null, 2))
}

if (!result.passed || !result.cleanup.ok) process.exitCode = 1
