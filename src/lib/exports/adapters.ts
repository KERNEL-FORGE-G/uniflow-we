import type { AttendanceSession, Grade, Schedule } from '../api'
import type { UserProfile } from '../../utils/userRole'
import type { AttendanceExportSession, GradeExportEntry, TimetableExportSlot, TranscriptExportStudent } from './exportModel'

/**
 * Passerelles entre les types de `lib/api.ts` et le modèle d'export. Elles
 * vivent à part pour que `exportModel.ts` reste sans dépendance vers le SDK
 * Appwrite et donc testable avec `node --test`.
 */

export function toAttendanceExportSession(session: AttendanceSession, teacherName?: string): AttendanceExportSession {
  return {
    id: session.id,
    date: session.date,
    courseCode: session.course?.code ?? '',
    courseName: session.course?.name ?? 'Cours',
    teacherName,
    records: session.records.map((record) => ({
      studentId: record.studentId,
      studentName: record.student ? `${record.student.firstName} ${record.student.lastName}`.trim() : 'Apprenant non résolu',
      matricule: record.student?.matricule,
      status: record.status,
      markedAt: record.createdAt,
    })),
  }
}

/**
 * Le relevé front ne porte que le code du cours ; un dictionnaire optionnel
 * (`code → intitulé`) permet d'afficher le nom complet quand la page le connaît.
 */
export function toGradeEntries(grades: Grade[], courseTitles: ReadonlyMap<string, string> = new Map()): GradeExportEntry[] {
  return grades.map((grade) => {
    const code = grade.code?.trim() || ''
    return {
      courseCode: code || grade.ue?.trim() || 'Matière',
      courseTitle: courseTitles.get(code) ?? (code ? grade.ue?.trim() || '' : ''),
      evaluationTitle: grade.title || 'Évaluation',
      type: grade.type || undefined,
      score: Number(grade.grade) || 0,
      maxScore: Number(grade.maxScore) || 20,
      coefficient: Number(grade.coef) || 1,
    }
  })
}

export function transcriptStudentFromProfile(profile: UserProfile): TranscriptExportStudent {
  return {
    name: profile.name,
    matricule: profile.matricule,
    institution: [profile.university, profile.faculty].filter(Boolean).join(' — ') || undefined,
    program: profile.program || profile.filiere,
    level: profile.level,
  }
}

export function toTimetableSlots(schedules: Schedule[]): TimetableExportSlot[] {
  return schedules.map((schedule) => {
    const teacher = schedule.course?.teacher
    const classroom = schedule.course?.classroom
    return {
      dayOfWeek: schedule.dayOfWeek,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      courseCode: schedule.course?.code ?? '',
      courseName: schedule.course?.name ?? 'Cours',
      type: schedule.course?.type,
      teacherName: teacher ? `${teacher.firstName} ${teacher.lastName}`.trim() || undefined : undefined,
      room: classroom ? [classroom.name, classroom.building].filter(Boolean).join(' · ') || undefined : undefined,
      group: schedule.group,
    }
  })
}
