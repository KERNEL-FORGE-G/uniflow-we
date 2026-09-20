import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { studentsApi, teachersApi } from '../../lib/api'
import { academicAppwriteApi } from '../../lib/appwrite'
import { useClassrooms, useFaculties, usePrograms, useUniversities } from '../../lib/referenceData'
import { summarizeStructure } from '../../lib/structureModel'
import { filterByScope } from '../../lib/academicScope'
import { useAcademicScope } from '../../hooks/useAcademicScope'
import { AcademicScopeSelect } from '../../components/academic/AcademicScopeSelect'
import { StructureView, structureScopeTitle } from '../../components/admin/StructureView'

export default function AcademicStructurePage() {
  const { scope, profileScope, selection, setSelection, isPlatform, universityName, facultyName, universityCode, facultyCode } = useAcademicScope()

  // Référentiel : tout pour PLATFORM, l'université/faculté de l'appelant pour une administration.
  const universities = useUniversities()
  const faculties = useFaculties(universityName ? (universityCode ?? '') : undefined)
  const programs = usePrograms(universityName ? (universityCode ?? '') : undefined, facultyName ? (facultyCode ?? '') : undefined)
  const classrooms = useClassrooms(universityName ? (universityCode ?? '') : undefined)

  // UE et séances du périmètre du profil (pas de la sélection) : le tableau
  // compte par filière et niveau, la sélection ne fait que le restreindre.
  const courses = useQuery({ queryKey: ['structure', 'courses', profileScope], queryFn: () => academicAppwriteApi.courses.list(profileScope) })
  const schedules = useQuery({ queryKey: ['structure', 'schedules', profileScope], queryFn: () => academicAppwriteApi.schedules.list(profileScope) })
  const students = useQuery({ queryKey: ['structure', 'students', scope], queryFn: () => studentsApi.listScoped(selection) })
  const teachers = useQuery({ queryKey: ['structure', 'teachers'], queryFn: () => teachersApi.list() })

  const summary = useMemo(() => summarizeStructure({
    universities: universities.data ?? [],
    faculties: faculties.data ?? [],
    programs: programs.data ?? [],
    classrooms: classrooms.data ?? [],
    courses: filterByScope(courses.data ?? [], profileScope),
    schedules: filterByScope(schedules.data ?? [], profileScope),
    universityCode: isPlatform ? undefined : universityCode,
    facultyCode: isPlatform ? undefined : facultyCode,
    scope,
  }), [classrooms.data, courses.data, faculties.data, facultyCode, isPlatform, profileScope, programs.data, schedules.data, scope, universities.data, universityCode])

  const perLevel = useMemo(() => {
    const table: Record<string, Record<string, { courses: number; schedules: number }>> = {}
    const bump = (program: string | null | undefined, level: string | null | undefined, key: 'courses' | 'schedules') => {
      if (!program || !level) return
      const row = (table[program] ??= {})
      const cell = (row[level.toUpperCase()] ??= { courses: 0, schedules: 0 })
      cell[key] += 1
    }
    for (const course of courses.data ?? []) bump(course.program, course.level, 'courses')
    for (const schedule of schedules.data ?? []) bump(schedule.program, schedule.level, 'schedules')
    return table
  }, [courses.data, schedules.data])

  const loading = universities.isLoading || programs.isLoading || courses.isLoading || schedules.isLoading
  const error = [universities.error, faculties.error, programs.error, classrooms.error, courses.error, schedules.error, students.error]
    .find((item): item is Error => item instanceof Error)?.message ?? null

  return (
    <div className="space-y-5 animate-fade-in">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Structure académique</h1>
          <p className="mt-0.5 text-sm text-[#6b7280]">Universités, facultés, filières, UE et séances lues dans Appwrite.</p>
        </div>
        <AcademicScopeSelect
          universityName={isPlatform ? undefined : universityName}
          facultyName={isPlatform ? undefined : facultyName}
          value={selection}
          onChange={setSelection}
          compact
          className="w-full sm:w-auto sm:min-w-[28rem]"
        />
      </header>

      {loading ? (
        <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[#1e3a8a]" /></div>
      ) : (
        <StructureView
          scopeTitle={structureScopeTitle({ isPlatform, university: universityName, faculty: facultyName })}
          summary={summary}
          students={students.data?.length ?? 0}
          delegates={(students.data ?? []).filter((student) => student.status === 'delegate').length}
          teachers={teachers.data?.length ?? 0}
          perLevel={perLevel}
          selectedLevel={selection.level || undefined}
          error={error}
        />
      )}
    </div>
  )
}
