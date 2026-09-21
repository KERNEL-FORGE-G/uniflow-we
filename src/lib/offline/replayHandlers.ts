import { attendanceApi, messagingApi, type AttendanceRecord } from '../api'
import { attendanceCoalesceKey } from './offlineModel'
import { enqueueOfflineWrite, registerReplayHandler } from './writeQueue'

/**
 * Écritures rejouables hors ligne. Chaque type a une charge utile sérialisable
 * (elle traverse IndexedDB) et un exécuteur qui rappelle l'API normale.
 */

export interface QueuedMessagePayload {
  conversationId: string
  text: string
}

export interface QueuedAttendancePayload {
  courseId: string
  date: string
  rows: Array<{ studentId: string; status: AttendanceRecord['status'] }>
}

export function registerOfflineReplayHandlers() {
  registerReplayHandler<QueuedMessagePayload>('message', async (payload) => {
    await messagingApi.sendMessage(payload.conversationId, payload.text)
  })
  registerReplayHandler<QueuedAttendancePayload>('attendance', async (payload) => {
    await attendanceApi.saveTodayRoll(payload)
  })
}

export function queueMessage(payload: QueuedMessagePayload) {
  return enqueueOfflineWrite('message', payload)
}

/** La feuille du jour d'un cours se remplace : seule la dernière version compte. */
export function queueAttendanceRoll(payload: QueuedAttendancePayload) {
  return enqueueOfflineWrite('attendance', payload, attendanceCoalesceKey(payload.courseId, payload.date))
}
