import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useUserRole } from '@/utils/userRole'
import { facultyByName, universityByName, useFaculties, useUniversities } from '@/lib/referenceData'
import { isPlatformAccount, mergeScope, scopeLabel, scopeOf, type AcademicScope } from '@/lib/academicScope'

export interface ScopeSelection { program: string; level: string }

const STORAGE_KEY = 'uniflow_admin_scope'
const EMPTY: ScopeSelection = { program: '', level: '' }

function readStored(): ScopeSelection {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY
    const parsed = JSON.parse(raw) as Partial<ScopeSelection>
    return { program: typeof parsed.program === 'string' ? parsed.program : '', level: typeof parsed.level === 'string' ? parsed.level : '' }
  } catch {
    return EMPTY
  }
}

/**
 * Périmètre académique de la session : celui du profil (université, faculté,
 * filière, niveau) complété par la sélection filière/niveau des pages
 * administration et enseignant. La sélection est partagée entre les pages
 * (sessionStorage) pour qu'un admin qui choisit « INF · L2 » sur les UE la
 * retrouve sur l'emploi du temps et les salles.
 */
export function useAcademicScope() {
  const { currentUser, authUser } = useUserRole()
  const [searchParams] = useSearchParams()
  // Les liens de la page Structure (« UE de INF · L2 ») arrivent avec
  // ?program=&level= : ils priment sur la sélection mémorisée.
  const [selection, setSelectionState] = useState<ScopeSelection>(() => {
    const program = searchParams.get('program') ?? ''
    const level = searchParams.get('level') ?? ''
    return program || level ? { program, level } : readStored()
  })

  useEffect(() => {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(selection)) } catch { /* stockage indisponible */ }
  }, [selection])

  const setSelection = useCallback((next: ScopeSelection) => setSelectionState({ program: next.program || '', level: next.level || '' }), [])

  const profileScope = useMemo<AcademicScope>(() => scopeOf({
    accountType: currentUser.accountType,
    isSuperAdmin: currentUser.isSuperAdmin,
    role: currentUser.uniflowRole,
    university: currentUser.university,
    faculty: currentUser.faculty,
    program: currentUser.program,
    level: currentUser.level ?? authUser?.level,
  }), [authUser?.level, currentUser])

  const isPlatform = isPlatformAccount({ accountType: currentUser.accountType, isSuperAdmin: currentUser.isSuperAdmin })
  // Un apprenant a un périmètre fixé par son profil : le sélecteur ne le concerne pas.
  const canSelect = currentUser.uniflowRole === 'ADMIN' || currentUser.uniflowRole === 'TEACHER' || isPlatform
  const scope = useMemo(() => canSelect ? mergeScope(profileScope, selection) : profileScope, [canSelect, profileScope, selection])

  const universities = useUniversities()
  const university = universityByName(universities.data, currentUser.university)
  const faculties = useFaculties(university?.code ?? (currentUser.university ? '' : undefined))
  const faculty = facultyByName(faculties.data, currentUser.faculty)

  return {
    /** Périmètre effectif (profil + sélection) à passer aux `listScoped`. */
    scope,
    profileScope,
    selection,
    setSelection,
    canSelect,
    isPlatform,
    universityName: currentUser.university,
    facultyName: currentUser.faculty,
    universityCode: university?.code,
    facultyCode: faculty?.code,
    label: scopeLabel(scope),
  }
}
