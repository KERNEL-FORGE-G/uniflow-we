import type { TeamAccent } from '../lib/appwrite'
import { TEAM_ACCENTS } from '../lib/appwrite'

/**
 * Traduction des couleurs d'équipe stockées en base.
 *
 * La base ne garde qu'une **clé sémantique** (`blue`, `emerald`…), jamais une
 * classe Tailwind ni un code hexadécimal : le mobile et le desktop lisent la
 * même valeur et la traduisent chacun dans leur palette. Stocker
 * `bg-emerald-100 text-emerald-800` aurait rendu la donnée dépendante de
 * Tailwind, et aucune des deux applications Flutter n'aurait su quoi en faire.
 *
 * Les teintes reprennent celles qui étaient codées en dur dans `TeamsPage.tsx`
 * pour chacun des neuf membres, afin que la page ne change pas d'aspect en
 * passant à la base.
 */
type AccentClasses = {
  /** Pastille du rôle, en haut de la carte. */
  badge: string
  /** Anneau autour de la photo, pour rattacher visuellement la carte à son équipe. */
  ring: string
  /** Pastille de filtre active. */
  chip: string
  /** Aplat clair, pour les fonds. */
  soft: string
}

const ACCENT_CLASSES: Record<TeamAccent, AccentClasses> = {
  blue: { badge: 'bg-blue-100 text-[#1e3a8a] border-blue-200', ring: 'ring-blue-200', chip: 'bg-[#1e3a8a] text-white', soft: 'bg-blue-50' },
  purple: { badge: 'bg-purple-100 text-purple-800 border-purple-200', ring: 'ring-purple-200', chip: 'bg-purple-700 text-white', soft: 'bg-purple-50' },
  emerald: { badge: 'bg-emerald-100 text-emerald-800 border-emerald-200', ring: 'ring-emerald-200', chip: 'bg-emerald-700 text-white', soft: 'bg-emerald-50' },
  amber: { badge: 'bg-amber-100 text-amber-800 border-amber-200', ring: 'ring-amber-200', chip: 'bg-amber-600 text-white', soft: 'bg-amber-50' },
  rose: { badge: 'bg-rose-100 text-rose-800 border-rose-200', ring: 'ring-rose-200', chip: 'bg-rose-700 text-white', soft: 'bg-rose-50' },
  cyan: { badge: 'bg-cyan-100 text-cyan-800 border-cyan-200', ring: 'ring-cyan-200', chip: 'bg-cyan-700 text-white', soft: 'bg-cyan-50' },
  indigo: { badge: 'bg-indigo-100 text-indigo-800 border-indigo-200', ring: 'ring-indigo-200', chip: 'bg-indigo-700 text-white', soft: 'bg-indigo-50' },
}

/**
 * Classes de la couleur demandée, ou celles du bleu par défaut.
 *
 * Le repli est explicite plutôt qu'implicite : un document écrit à la main dans
 * la console Appwrite peut porter une couleur inconnue, et une carte sans
 * pastille serait plus déroutante qu'une carte bleue.
 */
export function teamAccentClasses(accent?: string | null): AccentClasses {
  if (accent && (TEAM_ACCENTS as readonly string[]).includes(accent)) {
    return ACCENT_CLASSES[accent as TeamAccent]
  }
  return ACCENT_CLASSES.blue
}
