/**
 * Chiffres de la page « Structure académique », calculés depuis la base et
 * non plus affichés en constantes (« 1 université · Parcours ICT4D : 1 »).
 * Logique pure, testée sous `node --test`.
 */
import { filterByScope, type AcademicScope, type ScopedDocument } from './academicScope.ts'

export interface StructureInput {
  universities: Array<{ code: string; name: string }>
  faculties: Array<{ code: string; universityCode: string; name: string }>
  programs: Array<{ code: string; name: string; universityCode: string; facultyCode: string; levels: string[] }>
  classrooms: Array<{ code: string }>
  courses: Array<ScopedDocument & { $id: string }>
  schedules: Array<ScopedDocument & { $id: string }>
  /** Codes d'université et de faculté du périmètre (ADMIN) ; absents pour PLATFORM. */
  universityCode?: string
  facultyCode?: string
  scope: AcademicScope
}

export interface ProgramSummary {
  code: string
  name: string
  levels: string[]
  courseCount: number
  scheduleCount: number
}

export interface StructureSummary {
  universities: number
  faculties: number
  programs: number
  classrooms: number
  courses: number
  schedules: number
  levels: string[]
  byProgram: ProgramSummary[]
  /** « 1 université · 1 faculté · 12 filières · 296 UE · 527 séances ». */
  headline: string
}

const plural = (count: number, singular: string, pluralForm = `${singular}s`) => `${count} ${count === 1 ? singular : pluralForm}`

export function summarizeStructure(input: StructureInput): StructureSummary {
  const universities = input.universityCode ? input.universities.filter((u) => u.code === input.universityCode) : input.universities
  const faculties = input.faculties.filter((f) => (!input.universityCode || f.universityCode === input.universityCode) && (!input.facultyCode || f.code === input.facultyCode))
  const programs = input.programs.filter((p) => (!input.universityCode || p.universityCode === input.universityCode) && (!input.facultyCode || p.facultyCode === input.facultyCode))
  const courses = filterByScope(input.courses, input.scope)
  const schedules = filterByScope(input.schedules, input.scope)

  const byProgram: ProgramSummary[] = programs
    .filter((program) => !input.scope.program || program.code === input.scope.program)
    .map((program) => ({
      code: program.code,
      name: program.name,
      levels: program.levels,
      courseCount: courses.filter((course) => course.program === program.code).length,
      scheduleCount: schedules.filter((schedule) => schedule.program === program.code).length,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, 'fr'))

  const levels = Array.from(new Set(programs.flatMap((program) => program.levels))).sort()

  const headline = [
    plural(universities.length, 'université'),
    plural(faculties.length, 'faculté'),
    plural(byProgram.length, 'filière'),
    `${courses.length} UE`,
    plural(schedules.length, 'séance'),
  ].join(' · ')

  return {
    universities: universities.length,
    faculties: faculties.length,
    programs: byProgram.length,
    classrooms: input.classrooms.length,
    courses: courses.length,
    schedules: schedules.length,
    levels,
    byProgram,
    headline,
  }
}
