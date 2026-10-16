import { Query } from 'appwrite'
import { useQuery } from '@tanstack/react-query'
import { APPWRITE_DATABASE_ID, appwriteDatabases } from './appwrite'
import { byName, toClassroom, toFaculty, toProgram, toUniversity, type AcademicProgram, type Classroom, type Faculty, type ReferenceRow, type University } from './referenceModel'

export * from './referenceModel'

/**
 * Référentiel académique lu en base : universités, facultés, filières (avec
 * leurs niveaux) et salles. Ces collections sont lisibles **sans session**
 * (`read("any")`) : le formulaire d'inscription les consulte avant qu'un
 * compte existe. Plus aucune liste codée en dur dans le client — les trois
 * applications ne proposaient que « Université de Yaoundé I / ICT4D / L1 ».
 */

async function listAll(collection: string, extra: string[] = []): Promise<ReferenceRow[]> {
  const rows: ReferenceRow[] = []
  let cursor: string | null = null
  for (;;) {
    const queries = [Query.limit(100), ...extra]
    if (cursor) queries.push(Query.cursorAfter(cursor))
    const page = await appwriteDatabases.listDocuments(APPWRITE_DATABASE_ID, collection, queries)
    rows.push(...(page.documents as unknown as ReferenceRow[]))
    if (page.documents.length < 100) return rows
    cursor = page.documents[page.documents.length - 1].$id
  }
}

export async function fetchUniversities(): Promise<University[]> {
  const rows = await listAll('universities')
  return rows.map(toUniversity).filter((university) => university.active && university.code).sort(byName)
}

export async function fetchFaculties(universityCode?: string): Promise<Faculty[]> {
  const rows = await listAll('faculties', universityCode ? [Query.equal('universityCode', universityCode)] : [])
  return rows.map(toFaculty).filter((faculty) => faculty.active && faculty.code).sort(byName)
}

export async function fetchPrograms(universityCode?: string, facultyCode?: string): Promise<AcademicProgram[]> {
  const filters: string[] = []
  if (universityCode) filters.push(Query.equal('universityCode', universityCode))
  if (facultyCode) filters.push(Query.equal('facultyCode', facultyCode))
  const rows = await listAll('academic_programs', filters)
  return rows.map(toProgram).filter((program) => program.active && program.code).sort(byName)
}

export async function fetchClassrooms(universityCode?: string): Promise<Classroom[]> {
  const rows = await listAll('classrooms', universityCode ? [Query.equal('universityCode', universityCode)] : [])
  return rows.map(toClassroom).filter((classroom) => classroom.active && classroom.code).sort((a, b) => a.code.localeCompare(b.code, 'fr', { numeric: true }))
}

const STALE = 10 * 60 * 1000

export function useUniversities() {
  return useQuery({ queryKey: ['reference', 'universities'], queryFn: fetchUniversities, staleTime: STALE })
}

/** `universityCode` vide = pas encore choisi : la requête attend. `undefined` = toutes. */
export function useFaculties(universityCode?: string) {
  return useQuery({ queryKey: ['reference', 'faculties', universityCode ?? '*'], queryFn: () => fetchFaculties(universityCode), staleTime: STALE, enabled: universityCode !== '' })
}

export function usePrograms(universityCode?: string, facultyCode?: string) {
  return useQuery({ queryKey: ['reference', 'programs', universityCode ?? '*', facultyCode ?? '*'], queryFn: () => fetchPrograms(universityCode, facultyCode), staleTime: STALE, enabled: universityCode !== '' && facultyCode !== '' })
}

export function useClassrooms(universityCode?: string) {
  return useQuery({ queryKey: ['reference', 'classrooms', universityCode ?? '*'], queryFn: () => fetchClassrooms(universityCode), staleTime: STALE })
}
