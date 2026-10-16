/**
 * Types et fonctions pures du référentiel académique (universités, facultés,
 * filières, salles). Aucune dépendance Appwrite ici : ce module est testé
 * sous `node --test`, l'accès réseau vit dans `referenceData.ts`.
 */

export interface University {
  id: string
  code: string
  name: string
  shortName: string
  city: string
  country: string
  website: string
  active: boolean
}

export interface Faculty {
  id: string
  universityCode: string
  code: string
  name: string
  active: boolean
}

export interface AcademicProgram {
  id: string
  universityCode: string
  facultyCode: string
  code: string
  name: string
  /** Niveaux ouverts, dans l'ordre du référentiel (« L1 », « L2 », « L3 », « M1 »…). */
  levels: string[]
  description: string
  active: boolean
}

export interface Classroom {
  id: string
  universityCode: string
  facultyCode: string
  code: string
  name: string
  kind: string
  capacity: number
  building: string
  active: boolean
}

export type ReferenceRow = Record<string, unknown> & { $id: string }

const text = (row: ReferenceRow, key: string) => (typeof row[key] === 'string' ? (row[key] as string) : '')
const flag = (row: ReferenceRow, key: string) => row[key] !== false

/** « L1,L2,L3 » → ['L1','L2','L3'] ; tolère espaces et points-virgules. */
export function parseLevels(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((level) => String(level).trim()).filter(Boolean)
  return String(value || '')
    .split(/[,;\s]+/)
    .map((level) => level.trim().toUpperCase())
    .filter(Boolean)
}

export const byName = <T extends { name: string; code: string }>(a: T, b: T) => (a.name || a.code).localeCompare(b.name || b.code, 'fr')

export function toUniversity(row: ReferenceRow): University {
  return { id: row.$id, code: text(row, 'code'), name: text(row, 'name'), shortName: text(row, 'shortName'), city: text(row, 'city'), country: text(row, 'country'), website: text(row, 'website'), active: flag(row, 'active') }
}

export function toFaculty(row: ReferenceRow): Faculty {
  return { id: row.$id, universityCode: text(row, 'universityCode'), code: text(row, 'code'), name: text(row, 'name'), active: flag(row, 'active') }
}

export function toProgram(row: ReferenceRow): AcademicProgram {
  return { id: row.$id, universityCode: text(row, 'universityCode'), facultyCode: text(row, 'facultyCode'), code: text(row, 'code'), name: text(row, 'name'), levels: parseLevels(row.levels), description: text(row, 'description'), active: flag(row, 'active') }
}

export function toClassroom(row: ReferenceRow): Classroom {
  return { id: row.$id, universityCode: text(row, 'universityCode'), facultyCode: text(row, 'facultyCode'), code: text(row, 'code'), name: text(row, 'name'), kind: text(row, 'kind') || 'SALLE', capacity: Number(row.capacity) || 0, building: text(row, 'building'), active: flag(row, 'active') }
}

/** Nom lisible d'un niveau (« L1 » → « Licence 1 », « M2 » → « Master 2 »). */
export function levelLabel(level: string): string {
  const match = /^([LMD])(\d)$/i.exec(level.trim())
  if (!match) return level
  const cycle = { L: 'Licence', M: 'Master', D: 'Doctorat' }[match[1].toUpperCase() as 'L' | 'M' | 'D']
  return `${cycle} ${match[2]}`
}

/** Retrouve l'université d'un profil (stockée par son nom) dans le référentiel. */
export function universityByName(universities: University[] | undefined, name?: string | null): University | undefined {
  if (!universities || !name) return undefined
  const needle = name.trim().toLowerCase()
  return universities.find((university) => university.name.trim().toLowerCase() === needle || university.code.toLowerCase() === needle)
}

/** Retrouve la faculté d'un profil (stockée par son nom) parmi celles d'une université. */
export function facultyByName(faculties: Faculty[] | undefined, name?: string | null): Faculty | undefined {
  if (!faculties || !name) return undefined
  const needle = name.trim().toLowerCase()
  return faculties.find((faculty) => faculty.name.trim().toLowerCase() === needle || faculty.code.toLowerCase() === needle)
}

/** Retrouve la filière d'un profil (stockée par son code ou son nom). */
export function programByCodeOrName(programs: AcademicProgram[] | undefined, value?: string | null): AcademicProgram | undefined {
  if (!programs || !value) return undefined
  const needle = value.trim().toLowerCase()
  return programs.find((program) => program.code.toLowerCase() === needle || program.name.trim().toLowerCase() === needle)
}

/** Niveaux distincts d'un ensemble de filières, triés (L1 < L2 < L3 < M1…). */
export function levelsOf(programs: AcademicProgram[] | undefined): string[] {
  const rank = (level: string) => {
    const match = /^([LMD])(\d)$/i.exec(level)
    if (!match) return 99
    return { L: 0, M: 10, D: 20 }[match[1].toUpperCase() as 'L' | 'M' | 'D'] + Number(match[2])
  }
  return Array.from(new Set((programs ?? []).flatMap((program) => program.levels))).sort((a, b) => rank(a) - rank(b) || a.localeCompare(b))
}
