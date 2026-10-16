/**
 * Icône et couleur d'une matière, dérivées de son nom (spécification :
 * `docs/icones-uniflow.md`, § « Icône d'une matière ou d'un cours »).
 *
 * Les cours académiques et les « cours libres » de l'espace personnel n'ont pas
 * d'attribut « icône » en base : l'icône est calculée ici, par une fonction
 * pure, sans React, pour que le web, le mobile et le desktop affichent la même
 * icône pour le même cours. Les noms retournés sont ceux de Phosphor Icons.
 */

export const SUBJECT_ICON_NAMES = [
  'MathOperations', 'Atom', 'Flask', 'Dna', 'Network', 'Database', 'Globe', 'DeviceMobile',
  'ShieldCheck', 'Brain', 'Cloud', 'ChartLine', 'Translate', 'Rocket', 'Kanban', 'Terminal',
  'Code', 'Coins', 'Scales', 'Scroll', 'GlobeHemisphereWest', 'Lightning', 'MusicNotes',
  'Palette', 'Barbell', 'FirstAid', 'Broadcast', 'Feather', 'BookOpen',
] as const

export type SubjectIconName = (typeof SUBJECT_ICON_NAMES)[number]

export const DEFAULT_SUBJECT_ICON: SubjectIconName = 'BookOpen'

/**
 * Table de la spécification, dans l'ordre : le premier groupe dont un mot-clé
 * apparaît dans le nom gagne. L'ordre porte le sens (« Développement web »
 * doit donner `Globe`, pas `Code`), ne pas le réordonner.
 */
const SUBJECT_RULES: ReadonlyArray<{ keywords: readonly string[]; icon: SubjectIconName }> = [
  { keywords: ['math', 'algèbre', 'analyse', 'géométrie'], icon: 'MathOperations' },
  { keywords: ['phys'], icon: 'Atom' },
  { keywords: ['chim'], icon: 'Flask' },
  { keywords: ['bio', 'génétique', 'adn'], icon: 'Dna' },
  { keywords: ['réseau'], icon: 'Network' },
  { keywords: ['base de donn', 'sql', 'bdd'], icon: 'Database' },
  { keywords: ['web'], icon: 'Globe' },
  { keywords: ['mobile', 'android', 'ios'], icon: 'DeviceMobile' },
  { keywords: ['sécur', 'crypto'], icon: 'ShieldCheck' },
  { keywords: ['intelligence artificielle', 'ia', 'apprentissage', 'data', 'science des donn'], icon: 'Brain' },
  { keywords: ['cloud', 'devops'], icon: 'Cloud' },
  { keywords: ['statisti', 'proba'], icon: 'ChartLine' },
  { keywords: ['anglais', 'english', 'langue', 'français', 'espagnol', 'allemand'], icon: 'Translate' },
  { keywords: ['entrepren', 'innov'], icon: 'Rocket' },
  { keywords: ['projet', 'stage', 'tutoré'], icon: 'Kanban' },
  { keywords: ['système', 'linux', 'exploitation'], icon: 'Terminal' },
  { keywords: ['algorith', 'programm', 'code', 'logiciel', 'info', 'développement'], icon: 'Code' },
  { keywords: ['économ', 'gestion', 'compta', 'finance', 'marketing'], icon: 'Coins' },
  { keywords: ['droit', 'juridique'], icon: 'Scales' },
  { keywords: ['histoire'], icon: 'Scroll' },
  { keywords: ['géo'], icon: 'GlobeHemisphereWest' },
  { keywords: ['énerg', 'électr', 'électro'], icon: 'Lightning' },
  { keywords: ['musique'], icon: 'MusicNotes' },
  { keywords: ['art', 'dessin', 'design'], icon: 'Palette' },
  { keywords: ['sport', 'éducation physique'], icon: 'Barbell' },
  { keywords: ['santé', 'médecine', 'anatomie'], icon: 'FirstAid' },
  { keywords: ['tic', 'télécom', 'communication'], icon: 'Broadcast' },
  { keywords: ['philo', 'lettres', 'littérature'], icon: 'Feather' },
]

/**
 * Mots-clés trop courts pour être cherchés au milieu d'un mot : « ia » est dans
 * « matériaux » et « financial », « tic » dans « robotique » et « politique »,
 * « art » dans « cartographie », « ios » dans « curiosité ». Ceux-là ne
 * comptent qu'en début de mot ; les autres racines (« bio » dans
 * « microbiologie », « sql » dans « MySQL ») restent cherchées partout.
 */
const WORD_START_ONLY = new Set(['ia', 'tic', 'art', 'ios'])

/** Minuscules, sans accents : « Géométrie » et « GEOMETRIE » se lisent pareil. */
export function normalizeSubjectText(value: string | null | undefined): string {
  return (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function keywordPattern(keyword: string): RegExp {
  const normalized = normalizeSubjectText(keyword)
  // « Bases de données avancées » doit satisfaire « base de donn » : chaque
  // mot d'une expression tolère un pluriel et des espaces multiples.
  const body = normalized.split(/\s+/).map(escapeRegExp).join('s?\\s+')
  const prefix = WORD_START_ONLY.has(normalized) ? '(?:^|[^a-z0-9])' : ''
  return new RegExp(prefix + body)
}

const isPhrase = (keyword: string) => /\s/.test(keyword.trim())

/**
 * Deux passes : les expressions de plusieurs mots d'abord, puis les racines.
 * Sans cela « Éducation physique » tombait sur `Atom` (« phys » précède
 * « éducation physique » dans la table) : une expression entière est toujours
 * plus précise qu'une racine, elle doit l'emporter.
 */
const COMPILED_RULES = [
  ...SUBJECT_RULES.map((rule) => ({ icon: rule.icon, patterns: rule.keywords.filter(isPhrase).map(keywordPattern) })),
  ...SUBJECT_RULES.map((rule) => ({ icon: rule.icon, patterns: rule.keywords.filter((k) => !isPhrase(k)).map(keywordPattern) })),
].filter((rule) => rule.patterns.length > 0)

/** Nom Phosphor de l'icône d'une matière, `BookOpen` quand aucun mot-clé ne correspond. */
export function subjectIconName(name: string | null | undefined, code?: string | null): SubjectIconName {
  const haystack = normalizeSubjectText(`${name ?? ''} ${code ?? ''}`)
  if (!haystack) return DEFAULT_SUBJECT_ICON
  for (const rule of COMPILED_RULES) {
    if (rule.patterns.some((pattern) => pattern.test(haystack))) return rule.icon
  }
  return DEFAULT_SUBJECT_ICON
}

/** Palette UniFlow, dans l'ordre de la spécification (le hachage indexe cette liste). */
export const UNIFLOW_PALETTE = ['#0D9488', '#1E3A8A', '#7C3AED', '#F59E0B', '#10B981', '#EC4899', '#F97316'] as const

/**
 * Hachage FNV-1a 32 bits : arithmétique entière simple à reproduire à
 * l'identique en Dart, contrairement au `hashCode` natif dont la valeur n'est
 * pas garantie d'une plateforme à l'autre.
 */
export function stableHash(value: string): number {
  let hash = 0x811c9dc5
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 0x01000193) >>> 0
  }
  return hash >>> 0
}

/** `#RRGGBB` en majuscules, ou `null` si la valeur n'est pas une couleur exploitable (`#RGB` accepté). */
export function normalizeHexColor(value: string | null | undefined): string | null {
  const raw = (value ?? '').trim()
  const match = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(raw)
  if (!match) return null
  const hex = match[1].length === 3 ? match[1].split('').map((c) => c + c).join('') : match[1]
  return `#${hex.toUpperCase()}`
}

/** Couleur d'une matière : `colorHex` quand il existe, sinon une couleur de la palette choisie par hachage stable du code. */
export function subjectColor(code: string | null | undefined, colorHex?: string | null): string {
  const explicit = normalizeHexColor(colorHex)
  if (explicit) return explicit
  const key = normalizeSubjectText(code)
  return UNIFLOW_PALETTE[stableHash(key) % UNIFLOW_PALETTE.length]
}

function hexChannels(hex: string): [number, number, number] {
  const normalized = normalizeHexColor(hex) ?? '#1E3A8A'
  return [
    parseInt(normalized.slice(1, 3), 16),
    parseInt(normalized.slice(3, 5), 16),
    parseInt(normalized.slice(5, 7), 16),
  ]
}

/** Nuance plus sombre d'une couleur (`ratio` 0 → inchangée, 1 → noir), pour le dégradé 135° des tuiles. */
export function darkenHex(hex: string, ratio = 0.25): string {
  const clamped = Math.min(1, Math.max(0, ratio))
  const [r, g, b] = hexChannels(hex).map((channel) => Math.round(channel * (1 - clamped)))
  return `#${[r, g, b].map((channel) => channel.toString(16).padStart(2, '0')).join('').toUpperCase()}`
}

/** Couleur avec transparence en `rgba()`, pour les fonds teintés et les ombres colorées. */
export function hexWithAlpha(hex: string, alpha: number): string {
  const [r, g, b] = hexChannels(hex)
  return `rgba(${r}, ${g}, ${b}, ${Math.min(1, Math.max(0, alpha))})`
}
