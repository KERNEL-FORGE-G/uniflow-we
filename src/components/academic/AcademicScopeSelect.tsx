import { GraduationCap, Layers } from 'lucide-react'
import { levelLabel, levelsOf, universityByName, usePrograms, useUniversities } from '@/lib/referenceData'
import { cn } from '@/utils/cn'

export interface AcademicScope {
  program: string
  level: string
}

/**
 * Sélecteur filière + niveau alimenté par le référentiel de l'université.
 * Utilisé par les vues d'administration (comptes, cours, notes, emplois du
 * temps) pour ne plus présumer « ICT4D / L1 » : l'université arrive par son
 * nom (tel que stocké sur les profils) et les listes suivent.
 */
export function AcademicScopeSelect({
  universityName,
  value,
  onChange,
  allowAll = true,
  className,
  compact = false,
}: {
  universityName?: string | null
  value: AcademicScope
  onChange: (next: AcademicScope) => void
  /** Propose « Toutes » / « Tous » (filtres) ; sinon un choix est obligatoire (formulaires). */
  allowAll?: boolean
  className?: string
  compact?: boolean
}) {
  const universities = useUniversities()
  const university = universityByName(universities.data, universityName)
  // Sans université connue (superadmin sans rattachement), on lit toutes les filières.
  const programs = usePrograms(university?.code)
  const selectedProgram = programs.data?.find((program) => program.code === value.program)
  const levels = selectedProgram ? selectedProgram.levels : levelsOf(programs.data)
  const selectClass = cn(
    'w-full appearance-none rounded-xl border border-[#e5e7eb] bg-white pl-9 pr-8 text-sm font-medium text-slate-800 outline-none transition focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/10 disabled:opacity-60',
    compact ? 'py-2' : 'py-2.5',
  )

  return (
    <div className={cn('grid gap-3 sm:grid-cols-2', className)}>
      <label className="relative block">
        <span className="sr-only">Filière</span>
        <GraduationCap className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]" />
        <select
          value={value.program}
          onChange={(event) => onChange({ program: event.target.value, level: '' })}
          disabled={programs.isLoading}
          className={selectClass}
        >
          <option value="">{programs.isLoading ? 'Chargement des filières…' : allowAll ? 'Toutes les filières' : 'Choisir une filière'}</option>
          {(programs.data ?? []).map((program) => (
            <option key={program.code} value={program.code}>{program.name === program.code ? program.name : `${program.name} (${program.code})`}</option>
          ))}
        </select>
      </label>
      <label className="relative block">
        <span className="sr-only">Niveau</span>
        <Layers className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]" />
        <select
          value={value.level}
          onChange={(event) => onChange({ ...value, level: event.target.value })}
          disabled={programs.isLoading || levels.length === 0}
          className={selectClass}
        >
          <option value="">{allowAll ? 'Tous les niveaux' : 'Choisir un niveau'}</option>
          {levels.map((level) => <option key={level} value={level}>{level} — {levelLabel(level)}</option>)}
        </select>
      </label>
      {programs.error && <p className="text-xs font-medium text-rose-700 sm:col-span-2">Le référentiel des filières est indisponible pour le moment.</p>}
    </div>
  )
}
