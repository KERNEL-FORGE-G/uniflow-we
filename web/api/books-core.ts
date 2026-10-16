/**
 * Noyau de la Bibliothèque UniFlow — logique pure, sans dépendance au
 * navigateur ni à un package.
 *
 * Pourquoi un seul fichier : `api/` n'est pas dans `tsconfig.json` (`include:
 * ["src", "vite.config.ts"]`) et n'est donc pas typechecké par `tsc -b`, alors
 * que les tests tournent avec `node --test`, qui exige des specifiers explicites
 * en `.ts` là où le déploiement Vercel, lui, est prouvé avec des imports de
 * fichiers frères **sans** extension (`api/open-library.ts` importait `./books`).
 * Les deux conventions sont incompatibles : ce module n'importe donc **rien**,
 * et les trois endpoints (`books.ts`, `book-file.ts`, `book-cover.ts`) le
 * consomment par `from './books-core'`. Toute la logique est testable, rien de
 * ce qui part en production ne repose sur une hypothèse de bundling.
 *
 * Sources : uniquement licites (spec `2026-10-12-bibliotheque-sources-licites-design.md`
 * § 6). Aucun proxy, aucun User-Agent contrefait, aucun catalogue sous droits.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Contrat de données
// ─────────────────────────────────────────────────────────────────────────────

/**
 * `domaine-public` et `accès-libre` donnent un bouton « Télécharger » ;
 * `prêt-numérique` et `notice-seule` ne donnent **que** de la navigation.
 * C'est ce qui remplace le bouton unique qui promettait un fichier inexistant.
 */
export type Licence = 'domaine-public' | 'accès-libre' | 'prêt-numérique' | 'notice-seule'

export type SourceId = 'gutenberg' | 'openlibrary' | 'archive' | 'hal' | 'catalogue'

export type BookFormat = 'PDF' | 'EPUB' | 'HTML' | 'TXT' | 'ZIP'

export interface Book {
  id: string
  title: string
  authors: string[]
  category: string
  licence: Licence
  available: boolean
  source: SourceId
  sourceId: string
  year?: number | string
  language?: string
  format?: BookFormat
  fileUrl?: string
  readerUrl?: string
  noticeUrl?: string
  coverRef?: string
  sizeBytes?: number
  downloadsCount?: number
  isbn?: string
  description?: string
}

type OptionalBookKey =
  | 'year'
  | 'language'
  | 'format'
  | 'fileUrl'
  | 'readerUrl'
  | 'noticeUrl'
  | 'coverRef'
  | 'sizeBytes'
  | 'downloadsCount'
  | 'isbn'
  | 'description'

// ─────────────────────────────────────────────────────────────────────────────
// Limites de plateforme (Vercel, vérifiées dans la doc le 2026-10-12)
// ─────────────────────────────────────────────────────────────────────────────

/** Corps de réponse maximal d'une Vercel Function : 4,5 Mo, sinon `413 FUNCTION_PAYLOAD_TOO_LARGE`. */
export const MAX_DOWNLOAD_BYTES = 4_500_000

/** Une couverture dépasse rarement 100 Ko ; au-delà, on ne proxyfie pas. */
export const MAX_COVER_BYTES = 300_000

/**
 * Deadline par source, et non par requête : l'ancienne pile attendait jusqu'à
 * 12 s un `gutendex.com` mort (HTTP 000 mesuré 5 fois sur 5), ce qui vidait la
 * page. Une source morte doit coûter 2,5 s et un membre de `degraded[]`.
 */
export const DEFAULT_DEADLINE_MS = 2_500

export const DEFAULT_LIMIT = 24
export const MAX_LIMIT = 100

// ─────────────────────────────────────────────────────────────────────────────
// Liste d'hôtes : la seule autorité d'où le service accepte de tirer des octets
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Les deux suffixes HAL (`.hal.science`, `.ccsd.cnrs.fr`) viennent d'une mesure
 * du 2026-10-12 : `fileMain_s` pointait tantôt sur `inria.hal.science`, tantôt
 * sur `dumas.ccsd.cnrs.fr`. Une énumération de sous-domaines casserait au
 * premier laboratoire.
 */
export const ALLOWED_HOSTS = [
  'www.gutenberg.org',
  'gutenberg.org',
  'openlibrary.org',
  'covers.openlibrary.org',
  'archive.org',
  'api.archives-ouvertes.fr',
  '.hal.science',
  '.ccsd.cnrs.fr',
] as const

export function isUrlAllowed(url: string): boolean {
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return false
  }
  // `http://` est refusé : un fichier livré en clair peut être altéré en route.
  if (parsed.protocol !== 'https:') return false
  const host = parsed.hostname.toLowerCase()
  return ALLOWED_HOSTS.some(entry =>
    entry.startsWith('.')
      ? host.length > entry.length && host.endsWith(entry)
      : host === entry,
  )
}

const EXTENSIONS: Record<string, BookFormat> = {
  pdf: 'PDF',
  epub: 'EPUB',
  html: 'HTML',
  htm: 'HTML',
  txt: 'TXT',
  zip: 'ZIP',
}

export function formatFromUrl(url: string): BookFormat {
  const pathname = new URL(url).pathname
  const match = /\.([a-z0-9]+)$/i.exec(pathname)
  const ext = match ? match[1].toLowerCase() : ''
  return EXTENSIONS[ext] ?? 'HTML'
}

// ─────────────────────────────────────────────────────────────────────────────
// Références opaques
//
// Le client n'envoie **jamais** une URL : il envoie un `id` que ce module sait
// résoudre. C'est la fermeture du SSRF mesuré le 2026-10-12 dans
// `functions/uniflow-api/src/services/open-library.js:226` (`fetch(downloadUrl)`
// sur une URL passée dans le corps de la requête, exécutée avec la clé serveur).
// ─────────────────────────────────────────────────────────────────────────────

export interface ResolvedRef {
  url: string
  format: BookFormat
  source: SourceId
  /** Faux pour une simple page de lecture ou de notice : rien à proxyfier. */
  downloadable: boolean
}

export function encodeOpaqueRef(url: string): string | undefined {
  if (!isUrlAllowed(url)) return undefined
  return `x.${Buffer.from(url, 'utf8').toString('base64url')}`
}

function decodeOpaqueRef(id: string): string | null {
  const raw = Buffer.from(id.slice(2), 'base64url').toString('utf8')
  // Le base64url accepte n'importe quelle chaîne : on revalide le résultat,
  // jamais l'encodage.
  return isUrlAllowed(raw) ? raw : null
}

const GUTENBERG_FORMS: Record<string, { suffix: string; format: BookFormat }> = {
  epub: { suffix: 'epub.noimages', format: 'EPUB' },
  txt: { suffix: 'txt.utf-8', format: 'TXT' },
  html: { suffix: 'html.images', format: 'HTML' },
}

const ARCHIVE_FORMS: Record<string, { ext: string; format: BookFormat }> = {
  pdf: { ext: 'pdf', format: 'PDF' },
  epub: { ext: 'epub', format: 'EPUB' },
  txt: { ext: 'djvu.txt', format: 'TXT' },
  zip: { ext: 'zip', format: 'ZIP' },
}

/**
 * `id` → URL de fichier. Formes admises : `gut-<n>.<epub|txt|html>`,
 * `ia-<item>.<pdf|epub|txt|zip>`, `ol-<OL…W>` (lecture seule),
 * `x.<base64url>` (HAL et les URL hors gabarit), et les identifiants du
 * catalogue intégré ci-dessous. Tout le reste renvoie `null`, ce qui devient un
 * `410` côté HTTP — jamais une redirection.
 */
export function resolveRef(id: string): ResolvedRef | null {
  const fromCatalog = CATALOG_BY_ID.get(id)
  if (fromCatalog?.fileUrl) {
    return {
      url: fromCatalog.fileUrl,
      format: fromCatalog.format ?? 'PDF',
      source: fromCatalog.source,
      downloadable: true,
    }
  }

  if (id.startsWith('gut-')) {
    const match = /^gut-(\d+)\.(epub|txt|html)$/.exec(id)
    if (!match) return null
    const form = GUTENBERG_FORMS[match[2]]
    return {
      url: `https://www.gutenberg.org/ebooks/${match[1]}.${form.suffix}`,
      format: form.format,
      source: 'gutenberg',
      downloadable: true,
    }
  }

  if (id.startsWith('ia-')) {
    const match = /^ia-([A-Za-z0-9_\-.]{3,100})\.(pdf|epub|txt|zip)$/.exec(id)
    if (!match) return null
    // Un `..` dans le nom d'item traverserait l'arborescence du bucket Archive.org.
    if (match[1].includes('..')) return null
    const form = ARCHIVE_FORMS[match[2]]
    return {
      url: `https://archive.org/download/${match[1]}/${match[1]}.${form.ext}`,
      format: form.format,
      source: 'archive',
      downloadable: true,
    }
  }

  if (id.startsWith('ol-')) {
    const match = /^ol-(OL\d+[WM])$/i.exec(id)
    if (!match) return null
    return {
      url: `https://openlibrary.org/works/${match[1]}`,
      format: 'HTML',
      source: 'openlibrary',
      downloadable: false,
    }
  }

  if (id.startsWith('x.')) {
    const url = decodeOpaqueRef(id)
    if (!url) return null
    return { url, format: formatFromUrl(url), source: 'hal', downloadable: true }
  }

  return null
}

// ─────────────────────────────────────────────────────────────────────────────
// Normalisation — la règle « un champ absent reste absent »
//
// L'implémentation remplissait (`['Auteur Universitaire']`, `year: death_year - 30`,
// `downloadsCount: edition_count * 250`) et l'interface affichait ces chiffres
// dans un badge de popularité. `normalizeBook` interdise désormais l'invention.
// ─────────────────────────────────────────────────────────────────────────────

export function normalizeBook(raw: Partial<Book> & Pick<Book, 'id' | 'title' | 'source' | 'sourceId' | 'licence'>): Book {
  const book: Book = {
    id: raw.id,
    title: String(raw.title).replace(/\s+/g, ' ').trim(),
    authors: Array.isArray(raw.authors)
      ? raw.authors.filter(a => typeof a === 'string' && a.trim() !== '').map(a => a.trim())
      : [],
    category: raw.category || 'Général',
    licence: raw.licence,
    available: raw.available === true,
    source: raw.source,
    sourceId: raw.sourceId,
  }

  for (const key of OPTIONAL_KEYS) {
    const value = raw[key]
    if (value !== undefined && value !== null && value !== '') {
      book[key] = value as never
    }
  }

  // `available` promet une action à l'étudiant : sans URL de fichier ni URL de
  // lecture, la promesse est fausse quelle que soit la licence annoncée.
  if (!book.fileUrl && !book.readerUrl) book.available = false

  return book
}

const OPTIONAL_KEYS: OptionalBookKey[] = [
  'year',
  'language',
  'format',
  'fileUrl',
  'readerUrl',
  'noticeUrl',
  'coverRef',
  'sizeBytes',
  'downloadsCount',
  'isbn',
  'description',
]

/** Du plus actionnable au moins actionnable : sert à départager les doublons. */
export const LICENCE_RANK: Record<Licence, number> = {
  'domaine-public': 0,
  'accès-libre': 1,
  'prêt-numérique': 2,
  'notice-seule': 3,
}

// ─────────────────────────────────────────────────────────────────────────────
// Façade française de la recherche
//
// Les bases visées indexent l'anglais. L'ancienne table traduisait mot à mot et
// produisait « data structures data science » pour « structures de données »
// (`src/lib/openLibraryService.ts:73-79`, doublonnée `api/books.ts:457-459`).
// Les expressions complètes passent donc avant les mots isolés.
// ─────────────────────────────────────────────────────────────────────────────

const PHRASES: Record<string, string> = {
  'structures de donnees': 'data structures',
  'structure de donnee': 'data structures',
  'algorithme et structure de donnees': 'algorithms data structures',
  'algorithmes et structures de donnees': 'algorithms data structures',
  'intelligence artificielle': 'artificial intelligence',
  'apprentissage automatique': 'machine learning',
  'apprentissage profond': 'deep learning',
  'science des donnees': 'data science',
  'analyse de donnees': 'data analysis',
  'systemes d exploitation': 'operating systems',
  'systeme d exploitation': 'operating systems',
  'reseaux informatiques': 'computer networks',
  'reseau informatique': 'computer networks',
  'securite informatique': 'cybersecurity',
  'cryptographie': 'cryptography',
  'droit constitutionnel': 'constitutional law',
  'droit civil': 'civil law',
  'droit penal': 'criminal law',
  'sciences politiques': 'political science',
  'comptabilite generale': 'accounting',
  'économie politique': 'economics',
  'mathematiques appliquees': 'applied mathematics',
  'analyse numerique': 'numerical analysis',
  'thermodynamique': 'thermodynamics',
  'mecanique quantique': 'quantum mechanics',
  'physique des particules': 'particle physics',
  'biologie moleculaire': 'molecular biology',
  'sante publique': 'public health',
  'litterature francaise': 'french literature',
  'philosophie des sciences': 'philosophy of science',
}

const WORDS: Record<string, string> = {
  programmation: 'programming',
  developpement: 'software development',
  algorithme: 'algorithm',
  algorithmes: 'algorithms',
  donnees: 'data',
  chimie: 'chemistry',
  physique: 'physics',
  maths: 'mathematics',
  algebre: 'algebra',
  geometrie: 'geometry',
  probabilite: 'probability',
  statistiques: 'statistics',
  informatique: 'computer science',
  securite: 'security',
  droit: 'law',
  economie: 'economics',
  gestion: 'management',
  finance: 'finance',
  marketing: 'marketing',
  biologie: 'biology',
  medecine: 'medicine',
  pharmacie: 'pharmacology',
  anatomie: 'anatomy',
  these: 'thesis',
  cours: 'textbook',
  manuel: 'textbook',
  exercices: 'problems exercises',
  corriges: 'solutions',
}

/** Les catégories de la page, traduites vers l'anglais des bases. */
export const CATEGORY_TERMS: Record<string, string> = {
  'Informatique & IA': 'computer science',
  'Mathématiques & Data': 'mathematics',
  'Physique & Sciences': 'physics',
  'Droit & Sciences Po': 'law',
  'Économie & Gestion': 'economics',
  'Médecine & Santé': 'medicine',
  'Littérature & Lettres': 'literature',
  Tous: '',
}

export function stripAccents(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

export function normalizeKey(value: string): string {
  return stripAccents(String(value).toLowerCase()).replace(/[^a-z0-9]+/g, ' ').trim()
}

/**
 * Requête étudiant → terme de recherche. Une requête vide **avec** une catégorie
 * utilise le terme de la catégorie ; vide et « Tous » renvoie `''`, ce qui
 * n'invente aucun résultat (l'agrégateur ne lance alors que le catalogue).
 */
export function toSearchTerm(query: string, category: string): string {
  const normalized = normalizeKey(query ?? '')
  if (!normalized) return CATEGORY_TERMS[category] ?? ''

  let working = normalized
  for (const phrase of Object.keys(PHRASES).sort((a, b) => b.length - a.length)) {
    if (working.includes(phrase)) {
      working = working.replace(phrase, ` ${PHRASES[phrase]} `)
    }
  }

  const words = working.split(/\s+/).filter(Boolean).map(word => WORDS[word] ?? word)
  const unique: string[] = []
  for (const word of words) {
    for (const piece of word.split(' ')) {
      if (piece && !unique.includes(piece)) unique.push(piece)
    }
  }
  return unique.join(' ')
}

// ─────────────────────────────────────────────────────────────────────────────
// Déduplication et tri
//
// L'actuelle déduplication (`api/books.ts:684`) comparait
// `title.trim().toLowerCase()`, donc « Algorithmes » et « Algorithmes, 2e éd. »
// passaient tous les deux.
// ─────────────────────────────────────────────────────────────────────────────

export function dedupeBooks(books: Book[]): Book[] {
  const byTitle = new Map<string, Book>()
  const byIsbn = new Map<string, Book>()

  const better = (a: Book, b: Book): Book => {
    const rank = LICENCE_RANK[a.licence] - LICENCE_RANK[b.licence]
    if (rank !== 0) return rank < 0 ? a : b
    return a.available === b.available ? a : a.available ? a : b
  }

  const kept: Book[] = []
  for (const book of books) {
    const isbn = book.isbn ? String(book.isbn).replace(/[^0-9Xx]/g, '') : ''
    const titleKey = normalizeKey(book.title)

    const clashIsbn = isbn ? byIsbn.get(isbn) : undefined
    const clashTitle = titleKey ? byTitle.get(titleKey) : undefined
    const clash = clashIsbn ?? clashTitle

    if (clash) {
      const winner = better(clash, book)
      // Le gagnant remplace l'entré existante dans l'ordre de conservation.
      const index = kept.indexOf(clash)
      if (index >= 0) kept[index] = winner
      if (clashIsbn && clashIsbn !== winner) byIsbn.set(isbn, winner)
      if (clashTitle && clashTitle !== winner) byTitle.set(titleKey, winner)
      continue
    }

    kept.push(book)
    if (isbn) byIsbn.set(isbn, book)
    if (titleKey) byTitle.set(titleKey, book)
  }

  return kept
}

/**
 * Tri : ce qui est actionnable d'abord, puis la licence la plus ouverte, puis
 * l'ordre alphabétique. Aucun tri par « nombre de téléchargements » : ce champ
 * n'est publié par aucune des trois sources intégrées, et c'est précisément lui
 * qui était inventé.
 */
export function sortBooks(books: Book[]): Book[] {
  return [...books].sort((a, b) => {
    if (a.available !== b.available) return a.available ? -1 : 1
    const rank = LICENCE_RANK[a.licence] - LICENCE_RANK[b.licence]
    if (rank !== 0) return rank
    return a.title.localeCompare(b.title, 'fr')
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Adaptateurs de sources
// ─────────────────────────────────────────────────────────────────────────────

export interface FetchResponseLike {
  ok: boolean
  status: number
  headers: { get(name: string): string | null }
  json(): Promise<unknown>
  text(): Promise<string>
  arrayBuffer(): Promise<ArrayBuffer>
}

export interface FetchInitLike {
  method?: string
  signal?: AbortSignal
  headers?: Record<string, string>
}

export type Fetcher = (url: string, init?: FetchInitLike) => Promise<FetchResponseLike>

export interface SourceAdapter {
  id: SourceId
  label: string
  /** Plafond par source : l'API d'Open Library s'arrête à 50 par page, HAL à 40 utilement. */
  maxLimit: number
  search(term: string, limit: number, fetch: Fetcher, signal: AbortSignal): Promise<Book[]>
}

function decodeEntities(value: string): string {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
}

function atomTag(block: string, name: string): string {
  const match = new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`).exec(block)
  return match ? decodeEntities(match[1]).trim() : ''
}

/**
 * Atom (OPDS) → livres. Les trois premières entrées du flux de recherche
 * Gutenberg sont des navigation (« Search Results », etc.) : seul un `<id>` de
 * la forme `/ebooks/<numéro>` est un livre.
 */
export function parseOpdsFeed(xml: string, limit: number, category: string): Book[] {
  const books: Book[] = []
  const entries = xml.match(/<entry[\s\S]*?<\/entry>/g) ?? []

  for (const entry of entries) {
    const rawId = atomTag(entry, 'id')
    const match = /\/ebooks\/(\d+)/.exec(rawId)
    if (!match) continue

    const number = match[1]
    const authors = (entry.match(/<author>[\s\S]*?<\/author>/g) ?? [])
      .map(block => atomTag(block, 'name'))
      // « Project Gutenberg » apparaît comme éditeur-auteur : ce n'est pas un auteur.
      .filter(name => name !== '' && !/^project gutenberg$/i.test(name))

    const summary = atomTag(entry, 'summary')
    const coverUrl = `https://www.gutenberg.org/cache/epub/${number}/pg${number}.cover.medium.jpg`

    books.push(
      normalizeBook({
        id: `gut-${number}.epub`,
        title: atomTag(entry, 'title') || `Ouvrage Gutenberg ${number}`,
        authors,
        category,
        source: 'gutenberg',
        sourceId: number,
        licence: 'domaine-public',
        available: true,
        // Gutenberg sert EPUB, HTML, texte et ZIP — jamais de PDF. Le format est
        // donc celui de l'URL résolue, pas un « PDF » par défaut.
        format: 'EPUB',
        fileUrl: `https://www.gutenberg.org/ebooks/${number}.epub.noimages`,
        noticeUrl: `https://www.gutenberg.org/ebooks/${number}`,
        coverRef: encodeOpaqueRef(coverUrl),
        description: summary || undefined,
      }),
    )

    if (books.length >= limit) break
  }

  return books
}

const gutenbergAdapter: SourceAdapter = {
  id: 'gutenberg',
  label: 'Project Gutenberg',
  maxLimit: 40,
  async search(term, limit, fetch, signal) {
    // Le flux OPDS du site, et non `gutendex.com` : le second répond HTTP 000
    // depuis ce poste (5 essais sur 5) alors que le premier rend 200 en 0,82 s.
    const url = `https://www.gutenberg.org/ebooks/search.opds/?query=${encodeURIComponent(term)}`
    const response = await fetch(url, { signal, headers: { accept: 'application/atom+xml' } })
    if (!response.ok) throw new Error(`gutenberg HTTP ${response.status}`)
    const category = termCategory(term)
    return parseOpdsFeed(await response.text(), limit, category)
  },
}

function termCategory(term: string): string {
  const key = normalizeKey(term)
  if (/computer|program|algorithm|software|code/.test(key)) return 'Informatique & IA'
  if (/math|statistic|algebra|calculus|probability/.test(key)) return 'Mathématiques & Data'
  if (/physic|chemis|quantum|thermodynamic/.test(key)) return 'Physique & Sciences'
  if (/law|jurisprud|constitution/.test(key)) return 'Droit & Sciences Po'
  if (/econom|financ|management|accounting/.test(key)) return 'Économie & Gestion'
  if (/medicin|anatom|biolog|physiolog/.test(key)) return 'Médecine & Santé'
  return 'Littérature & Lettres'
}

/**
 * `ebook_access` est le seul champ d'Open Library qui dise honnêtement ce qu'un
 * étudiant pourra faire de l'ouvrage. Mesuré le 2026-10-12 : le **paramètre**
 * `&ebook_access=public` n'est pas honoré (`numFound` identique au non-filtré et
 * un document `printdisabled` dans la réponse) — le filtre se fait donc sur le
 * champ revenu, après normalisation.
 */
export function mapEbookAccess(access: string | undefined): { licence: Licence; available: boolean } {
  switch (access) {
    case 'public':
      return { licence: 'domaine-public', available: true }
    case 'online_reader':
      return { licence: 'accès-libre', available: true }
    case 'borrowable':
      return { licence: 'prêt-numérique', available: false }
    default:
      return { licence: 'notice-seule', available: false }
  }
}

const OPENLIBRARY_FIELDS = [
  'key',
  'title',
  'author_name',
  'first_publish_year',
  'cover_i',
  'ebook_access',
  'ia',
  'language',
].join(',')

function firstValue(value: unknown): string | undefined {
  if (Array.isArray(value)) return typeof value[0] === 'string' ? value[0] : undefined
  return typeof value === 'string' ? value : undefined
}

const OPENLIBRARY_LANGUAGES: Record<string, string> = {
  eng: 'Anglais',
  fre: 'Français',
  fra: 'Français',
  ger: 'Allemand',
  spa: 'Espagnol',
  por: 'Portugais',
  ita: 'Italien',
}

const openLibraryAdapter: SourceAdapter = {
  id: 'openlibrary',
  label: 'Open Library',
  maxLimit: 50,
  async search(term, limit, fetch, signal) {
    const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(term)}&fields=${OPENLIBRARY_FIELDS}&limit=${limit}`
    const response = await fetch(url, { signal })
    if (!response.ok) throw new Error(`openlibrary HTTP ${response.status}`)
    const payload = (await response.json()) as { docs?: Record<string, unknown>[] }
    const category = termCategory(term)

    return (payload.docs ?? []).slice(0, limit).map(doc => {
      const workKey = String(doc.key ?? '')
      const number = /\/works\/(OL\d+[WM])/.exec(workKey)?.[1]
      const { licence, available } = mapEbookAccess(firstValue(doc.ebook_access) ?? (Array.isArray(doc.ebook_access) ? String(doc.ebook_access[0]) : undefined))
      const iaItem = firstValue(doc.ia) ?? (Array.isArray(doc.ia) ? String(doc.ia[0]) : undefined)
      const languageCode = firstValue(doc.language)
      const coverId = doc.cover_i ? String(doc.cover_i) : ''

      // Le fichier n'est proposé que pour `public` : les scans empruntables
      // répondent 401/403 sur le motif d'URL `{item}/{item}.pdf` (mesuré).
      const fileUrl = licence === 'domaine-public' && iaItem
        ? `https://archive.org/download/${iaItem}/${iaItem}.pdf`
        : undefined

      return normalizeBook({
        id: number ? (fileUrl && iaItem ? `ia-${iaItem}.pdf` : `ol-${number}`) : `ol-${workKey.replace(/[^A-Za-z0-9]/g, '') || 'inconnu'}`,
        title: String(doc.title ?? 'Ouvrage sans titre'),
        authors: Array.isArray(doc.author_name) ? (doc.author_name as string[]) : [],
        category,
        source: 'openlibrary',
        sourceId: workKey,
        licence,
        available,
        year: doc.first_publish_year ? String(doc.first_publish_year) : undefined,
        language: languageCode ? OPENLIBRARY_LANGUAGES[languageCode] ?? languageCode : undefined,
        format: fileUrl ? 'PDF' : undefined,
        fileUrl,
        readerUrl: number ? `https://openlibrary.org${workKey}` : undefined,
        noticeUrl: number ? `https://openlibrary.org${workKey}` : undefined,
        coverRef: coverId ? encodeOpaqueRef(`https://covers.openlibrary.org/b/id/${coverId}-M.jpg`) : undefined,
      })
    })
  },
}

const HAL_FIELDS = ['docid', 'title_s', 'abstracts_s', 'fileMain_s', 'langId_s', 'publishDate_year_s'].join(',')

const halAdapter: SourceAdapter = {
  id: 'hal',
  label: 'HAL — archive ouverte',
  maxLimit: 40,
  async search(term, limit, fetch, signal) {
    // Sans clé d'API, en français, et avec un PDF par item : c'est le fonds
    // académique francophone qui manquait réellement au service.
    const url = `https://api.archives-ouvertes.fr/search/?q=${encodeURIComponent(term)}&fl=${HAL_FIELDS}&wt=json&rows=${limit}`
    const response = await fetch(url, { signal })
    if (!response.ok) throw new Error(`hal HTTP ${response.status}`)
    const payload = (await response.json()) as { response?: { docs?: Record<string, unknown>[] } }
    const category = termCategory(term)

    return (payload.response?.docs ?? []).slice(0, limit).map(doc => {
      const docId = String(doc.docid ?? '')
      const fileUrl = firstValue(doc.fileMain_s) ?? (typeof doc.fileMain_s === 'string' ? doc.fileMain_s : undefined)
      const languageCode = firstValue(doc.langId_s)
      const year = firstValue(doc.publishDate_year_s)

      return normalizeBook({
        // L'URL HAL dépend de l'hôte du dépôt (inria… vs dumas…) : on la porte
        // dans une référence opaque, on ne la reconstitue jamais.
        id: (fileUrl && encodeOpaqueRef(fileUrl)) || `hal-${docId}`,
        title: firstValue(doc.title_s) ?? `Document HAL ${docId}`,
        authors: [],
        category,
        source: 'hal',
        sourceId: docId,
        licence: fileUrl ? 'accès-libre' : 'notice-seule',
        available: !!fileUrl,
        year: year || undefined,
        language: languageCode === 'fre' ? 'Français' : languageCode === 'eng' ? 'Anglais' : languageCode,
        format: fileUrl ? 'PDF' : undefined,
        fileUrl,
        noticeUrl: docId ? `https://hal.science/hal-${docId}` : undefined,
        description: firstValue(doc.abstracts_s),
      })
    })
  },
}

export const SOURCES: SourceAdapter[] = [gutenbergAdapter, openLibraryAdapter, halAdapter]

// ─────────────────────────────────────────────────────────────────────────────
// Agrégation
// ─────────────────────────────────────────────────────────────────────────────

export interface DegradedSource {
  source: string
  reason: string
}

export interface AggregateResult {
  results: Book[]
  degraded: DegradedSource[]
  tookMs: number
  next: string | null
}

function withDeadline<T>(work: Promise<T>, deadlineMs: number, controller: AbortController, source: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      controller.abort()
      reject(new Error(`${source} : délai de ${deadlineMs} ms dépassé`))
    }, deadlineMs)
    work.then(
      value => {
        clearTimeout(timer)
        resolve(value)
      },
      error => {
        clearTimeout(timer)
        reject(error)
      },
    )
  })
}

/** Même garde, mais pour un aller simple où le contrôleur appartient à l'appelant. */
function withTimeout<T>(work: () => Promise<T>, deadlineMs: number, controller: AbortController, label: string): Promise<T> {
  return withDeadline(work(), deadlineMs, controller, label)
}

export interface AggregateOptions {
  limit: number
  fetch: Fetcher
  deadlineMs?: number
  licence?: string
  language?: string
  /** Le catalogue intégré passe en premier : il est vérifié à la main (`verify-book-sources.mjs`). */
  catalog?: Book[]
}

export async function aggregate(term: string, category: string, options: AggregateOptions): Promise<AggregateResult> {
  const startedAt = Date.now()
  const deadlineMs = options.deadlineMs ?? DEFAULT_DEADLINE_MS
  const catalog = options.catalog ?? []

  const finish = (books: Book[], degraded: DegradedSource[]): AggregateResult => ({
    results: sortBooks(filterBooks(dedupeBooks(books), options)).slice(0, options.limit),
    degraded,
    tookMs: Date.now() - startedAt,
    next: null,
  })

  // Une recherche vide **sans** catégorie ne lance aucune source : l'ancienne
  // pile requêtait `?q=` et compensait le vide par un plancher de 30 résultats
  // fabriqués (`services/open-library.js:52`).
  if (term === '') return finish(catalog, [])

  const searches = SOURCES.map(source => {
    const controller = new AbortController()
    const limit = Math.min(source.maxLimit, Math.max(1, Math.round(options.limit / 2)))
    return withDeadline(
      source.search(term, limit, options.fetch, controller.signal).then(books => ({ id: source.id, books })),
      deadlineMs,
      controller,
      source.id,
    )
  })

  const settled = await Promise.allSettled(searches)
  const degraded: DegradedSource[] = []
  const collected: Book[] = [...catalog]

  settled.forEach((outcome, index) => {
    if (outcome.status === 'fulfilled') {
      collected.push(...outcome.value.books)
      return
    }
    degraded.push({
      source: SOURCES[index].id,
      reason: outcome.reason instanceof Error ? outcome.reason.message : String(outcome.reason),
    })
  })

  return finish(collected, degraded)
}

function filterBooks(books: Book[], options: { licence?: string; language?: string }): Book[] {
  return books.filter(book => {
    if (options.licence && options.licence !== 'all' && book.licence !== options.licence) return false
    if (options.language && options.language !== 'all' && book.language !== options.language) return false
    return true
  })
}

/** Identifiant de source d'un `degraded[]` : on le prend de l'exception, proprement. */
function sourceOf(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error)
  const known = SOURCES.find(source => message.includes(source.id) || message.includes(source.label))
  return known ? known.id : 'source'
}

// ─────────────────────────────────────────────────────────────────────────────
// Catalogue intégré (seed)
//
// Uniquement des URL vérifiées live le 2026-10-12, et `node
// scripts/verify-book-sources.mjs` les recontrôle une par une. Les 25 entrées
// précédentes (`api/books.ts:21-447`) contenaient quatre liens
// `archive.org/details/…` en 404 et cinq PDF en 403/503 : le bouton
// « Télécharger » ne pouvait pas marcher.
// ─────────────────────────────────────────────────────────────────────────────

export const CATALOG: Book[] = [
  normalizeBook({
    id: 'gut-1342.epub',
    title: 'Pride and Prejudice',
    authors: ['Jane Austen'],
    category: 'Littérature & Lettres',
    source: 'catalogue',
    sourceId: '1342',
    licence: 'domaine-public',
    available: true,
    year: '1813',
    language: 'Anglais',
    format: 'EPUB',
    fileUrl: 'https://www.gutenberg.org/ebooks/1342.epub.noimages',
    noticeUrl: 'https://www.gutenberg.org/ebooks/1342',
    coverRef: encodeOpaqueRef('https://www.gutenberg.org/cache/epub/1342/pg1342.cover.medium.jpg'),
    description: 'Roman de Jane Austen, domaine public, servi par Project Gutenberg.',
  }),
  normalizeBook({
    id: 'ia-Applied_Cryptography_2nd_ed._B._Schneier.pdf',
    title: 'Applied Cryptography, 2e édition',
    authors: ['Bruce Schneier'],
    category: 'Informatique & IA',
    source: 'catalogue',
    sourceId: 'Applied_Cryptography_2nd_ed._B._Schneier',
    licence: 'domaine-public',
    available: true,
    year: '1996',
    language: 'Anglais',
    format: 'PDF',
    fileUrl: 'https://archive.org/download/Applied_Cryptography_2nd_ed._B._Schneier/Applied_Cryptography_2nd_ed._B._Schneier.pdf',
    sizeBytes: 3_440_000,
    noticeUrl: 'https://archive.org/details/Applied_Cryptography_2nd_ed._B._Schneier',
    description: 'Traité de cryptographie appliqué, déposé sur Internet Archive et vérifié téléchargeable.',
  }),
  normalizeBook({
    id: 'ia-algorithmicmotio00shar.pdf',
    title: 'Algorithmic Motion',
    authors: ['A. D. Sharpe'],
    category: 'Mathématiques & Data',
    source: 'catalogue',
    sourceId: 'algorithmicmotio00shar',
    licence: 'domaine-public',
    available: true,
    language: 'Anglais',
    format: 'PDF',
    fileUrl: 'https://archive.org/download/algorithmicmotio00shar/algorithmicmotio00shar.pdf',
    sizeBytes: 2_130_000,
    noticeUrl: 'https://archive.org/details/algorithmicmotio00shar',
    description: 'Ouvrage numérisé par Internet Archive, accès public vérifié.',
  }),
  normalizeBook({
    id: 'ia-brutus00cice.pdf',
    title: 'Brutus',
    authors: ['Cicero'],
    category: 'Littérature & Lettres',
    source: 'catalogue',
    sourceId: 'brutus00cice',
    licence: 'domaine-public',
    available: true,
    language: 'Anglais',
    format: 'PDF',
    fileUrl: 'https://archive.org/download/brutus00cice/brutus00cice.pdf',
    // 15,9 Mo mesurés : au-dessus du plafond de 4,5 Mo d'une Function Vercel,
    // donc `book-file` répond `302` et non des octets. Cas réel du test 7.
    sizeBytes: 15_904_000,
    noticeUrl: 'https://archive.org/details/brutus00cice',
    description: 'Livre de Cicéron numérisé, trop volumineux pour un transfert par la Function.',
  }),
  normalizeBook({
    id: 'x.aHR0cHM6Ly9pbnJpYS5oYWwuc2NpZW5jZS9pbnJpYS0wMDA3NTQzNi9kb2N1bWVudA',
    title: 'Rapport de recherche INRIA',
    authors: [],
    category: 'Informatique & IA',
    source: 'catalogue',
    sourceId: 'inria-00075436',
    licence: 'accès-libre',
    available: true,
    language: 'Anglais',
    format: 'PDF',
    fileUrl: 'https://inria.hal.science/inria-00075436/document',
    noticeUrl: 'https://hal.inria.fr/inria-00075436',
    description: 'Article déposé dans l’archive ouverte HAL, PDF vérifié en HEAD.',
  }),
]

const CATALOG_BY_ID = new Map(CATALOG.map(book => [book.id, book]))

/**
 * Le catalogue filtré sur la catégorie et le terme. Il est comparé **en
 * français** aussi : « réseaux » doit sortir sur « computer networks ».
 */
export function catalogFor(category: string, term: string): Book[] {
  const normalizedTerm = normalizeKey(term)
  return CATALOG.filter(book => {
    const matchCategory = !category || category === 'Tous' || book.category === category
    if (!matchCategory) return false
    if (!normalizedTerm) return true
    const haystack = normalizeKey([book.title, book.authors.join(' '), book.category, book.description ?? ''].join(' '))
    return normalizedTerm.split(' ').some(word => haystack.includes(word))
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Réponses HTTP, produites ici pour que les endpoints n'aient que le câblage
// ─────────────────────────────────────────────────────────────────────────────

export interface CoreResponse {
  status: number
  headers: Record<string, string>
  body?: unknown
  bytes?: Uint8Array
  redirect?: string
}

const CORS = { 'access-control-allow-origin': '*', vary: 'Accept-Encoding' }

export function clampLimit(raw: string | undefined): number {
  const value = Number.parseInt(raw ?? '', 10)
  if (!Number.isFinite(value)) return DEFAULT_LIMIT
  return Math.min(MAX_LIMIT, Math.max(1, value))
}

export function knownCategory(raw: string | undefined): string {
  const value = raw && Object.prototype.hasOwnProperty.call(CATEGORY_TERMS, raw) ? raw : 'Tous'
  return value
}

export async function booksResponse(
  query: Record<string, string | undefined>,
  fetch: Fetcher,
): Promise<CoreResponse> {
  const action = query.action ?? 'search'

  if (action === 'sources') {
    return {
      status: 200,
      headers: {
        ...CORS,
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
      },
      body: {
        ok: true,
        sources: [
          ...SOURCES.map(source => ({ id: source.id, label: source.label, status: 'intégré' })),
          // Les sources essayées et non retenues sont déclarées, pas masquées :
          // une page qui ne dit rien de ce qui manque laisse croire à un bug.
          { id: 'gallica', label: 'Gallica (BnF)', status: 'non intégré — HTTP 403 depuis nos serveurs' },
          { id: 'standardebooks', label: 'Standard Ebooks', status: 'non intégré — flux OPDS en 401' },
          { id: 'doab', label: 'DOAB / OAPEN', status: 'non intégré — API non vérifiée' },
          { id: 'openstax', label: 'OpenStax', status: 'non intégré — API 404 sur ce chemin' },
          { id: 'gutendex', label: 'Gutendex', status: 'remplacé par gutenberg.org direct — HTTP 000' },
        ],
      },
    }
  }

  if (action === 'get') {
    const id = query.id ?? ''
    const ref = resolveRef(id)
    if (!ref) return unavailable(id, 'référence inconnue ou hors liste')
    const catalogEntry = CATALOG_BY_ID.get(id)
    return {
      status: 200,
      headers: {
        ...CORS,
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'public, max-age=300, s-maxage=86400, stale-while-revalidate=604800',
      },
      // Rien n'est inventé : si le catalogue ne connaît pas l'id, la réponse
      // porte le strict minimum résoluble depuis la référence.
      body: {
        ok: true,
        book: catalogEntry ?? { id, source: ref.source, format: ref.format },
        formats: formatsFor(id, ref),
      },
    }
  }

  if (action !== 'search') {
    return {
      status: 400,
      headers: { ...CORS, 'content-type': 'application/json; charset=utf-8' },
      body: { ok: false, code: 'UNKNOWN_ACTION', actions: ['search', 'get', 'sources'] },
    }
  }

  const category = knownCategory(query.category)
  const term = toSearchTerm(query.q ?? '', category)
  const limit = clampLimit(query.limit)

  const outcome = await aggregate(term, category, {
    limit,
    fetch,
    licence: query.licence,
    language: query.language,
    catalog: catalogFor(category, term),
  })

  return {
    status: 200,
    headers: {
      ...CORS,
      'content-type': 'application/json; charset=utf-8',
      // Le cache devient HTTP : serverless n'a pas de disque partagé, la `Map`
      // des anciennes implémentations ne survit pas d'une invocation à l'autre.
      'cache-control': 'public, max-age=60, s-maxage=900, stale-while-revalidate=86400',
    },
    body: { ok: true, query: query.q ?? '', term, category, tookMs: outcome.tookMs, degraded: outcome.degraded, results: outcome.results, next: outcome.next },
  }
}

/** Formats réellement publiés pour une référence (Gutenberg ne publie pas de PDF). */
export function formatsFor(id: string, ref: ResolvedRef): { format: BookFormat; url: string; sizeBytes: number | null }[] {
  const gutenberg = /^gut-(\d+)\.(epub|txt|html)$/.exec(id)
  if (gutenberg) {
    const number = gutenberg[1]
    return [
      { format: 'EPUB', url: `https://www.gutenberg.org/ebooks/${number}.epub.noimages`, sizeBytes: null },
      { format: 'TXT', url: `https://www.gutenberg.org/ebooks/${number}.txt.utf-8`, sizeBytes: null },
      { format: 'HTML', url: `https://www.gutenberg.org/ebooks/${number}.html.images`, sizeBytes: null },
    ]
  }
  const archive = /^ia-[A-Za-z0-9_\-.]{3,100}\./.exec(id)
  if (archive) {
    const item = id.slice(3, id.lastIndexOf('.'))
    return ['pdf', 'epub', 'txt', 'zip'].map(ext => ({
      format: EXTENSIONS[ext],
      url: `https://archive.org/download/${item}/${item}.${ARCHIVE_FORMS[ext].ext}`,
      sizeBytes: null,
    }))
  }
  return [{ format: ref.format, url: ref.url, sizeBytes: null }]
}

function unavailable(id: string, reason: string): CoreResponse {
  return {
    status: 410,
    headers: { ...CORS, 'content-type': 'application/json; charset=utf-8' },
    body: { ok: false, code: 'BOOK_UNAVAILABLE', id, reason },
  }
}

/**
 *Décision d'un téléchargement : octets si la source annonce une taille tenant
 * dans le plafond de la Function, sinon `302` vers la source. Sans
 * `content-length`, on ne promet rien et on redirige.
 */
export async function fileResponse(query: Record<string, string | undefined>, fetch: Fetcher): Promise<CoreResponse> {
  const id = query.id ?? ''
  const ref = resolveRef(id)
  if (!ref) return unavailable(id, 'référence inconnue ou hors liste')
  if (!ref.downloadable) return unavailable(id, 'simple page de lecture : aucun fichier à transférer')
  if (!isUrlAllowed(ref.url)) return unavailable(id, 'hôtes hors liste d’autorisation')

  const controller = new AbortController()
  const probe = await withTimeout(() => fetch(ref.url, { method: 'HEAD', signal: controller.signal }), 5_000, controller, 'sonde HEAD')
    .catch(error => ({ error }))
  if ('error' in probe) return unavailable(id, `source injoignable (${sourceOf(probe.error)})`)
  if (!probe.ok) return unavailable(id, `la source répond ${probe.status}`)

  const declared = Number(probe.headers.get('content-length') ?? '')
  if (!Number.isFinite(declared) || declared > MAX_DOWNLOAD_BYTES) {
    return {
      status: 302,
      headers: {
        location: ref.url,
        'cache-control': 'public, max-age=60',
        'x-uniflow-file': 'source',
      },
      redirect: ref.url,
    }
  }

  // Le GET a sa propre deadline : sans elle, une source lente fait durer la
  // Function jusqu'au plafond de 300 s alors que 4,5 Mo se transfèrent en secondes.
  const transferController = new AbortController()
  const body = await withTimeout(() => fetch(ref.url, { signal: transferController.signal }), 20_000, transferController, 'transfert')
    .catch(error => ({ error }))
  if ('error' in body) return unavailable(id, `transfert interrompu (${sourceOf(body.error)})`)
  if (!body.ok) return unavailable(id, `la source répond ${body.status}`)

  const bytes = new Uint8Array(await body.arrayBuffer())
  // Un `content-length` menteur ne doit pas faire exploser la réponse : on
  // coupe avant d'envoyer, sinon la Function meurt en `413`.
  if (bytes.byteLength > MAX_DOWNLOAD_BYTES) {
    return {
      status: 413,
      headers: { ...CORS, 'content-type': 'application/json; charset=utf-8', 'x-uniflow-file': 'source' },
      body: { ok: false, code: 'BOOK_TOO_LARGE', id, sizeBytes: bytes.byteLength, limitBytes: MAX_DOWNLOAD_BYTES, href: ref.url },
    }
  }

  return {
    status: 200,
    headers: {
      ...CORS,
      'content-type': probe.headers.get('content-type') ?? mimeTypeFor(ref.format),
      'content-disposition': `attachment; filename="${filenameFor(id, ref.format)}"`,
      'cache-control': 'public, max-age=3600, s-maxage=604800, immutable',
      'x-uniflow-file': 'bytes',
    },
    bytes,
  }
}

export async function coverResponse(query: Record<string, string | undefined>, fetch: Fetcher): Promise<CoreResponse> {
  const id = query.id ?? ''
  const entry = CATALOG_BY_ID.get(id)
  const ref = entry?.coverRef ?? id
  if (!ref.startsWith('x.')) return unavailable(id, 'aucune couverture sous référence')

  const url = decodeOpaqueRef(ref)
  if (!url) return unavailable(id, 'couverture hors liste d’autorisation')

  // Une 302 obligerait CSP à autoriser l'hôte distant : on sert les octets, et
  // `vercel.json` peut alors retirer `covers.openlibrary.org` de `img-src`.
  const controller = new AbortController()
  const response = await withTimeout(() => fetch(url, { signal: controller.signal }), 4_000, controller, 'couverture')
    .catch(error => ({ error }))
  if ('error' in response) return unavailable(id, `couverture injoignable (${sourceOf(response.error)})`)
  if (!response.ok) return unavailable(id, `la couverture répond ${response.status}`)

  const bytes = new Uint8Array(await response.arrayBuffer())
  if (bytes.byteLength > MAX_COVER_BYTES) return unavailable(id, `couverture trop lourde (${bytes.byteLength} octets)`)

  const type = response.headers.get('content-type') ?? 'image/jpeg'
  if (!type.startsWith('image/')) return unavailable(id, `la source ne renvoie pas une image (${type})`)

  return {
    status: 200,
    headers: {
      'content-type': type,
      'cache-control': 'public, max-age=604800, s-maxage=2592000, immutable',
      ...CORS,
    },
    bytes,
  }
}

function mimeTypeFor(format: BookFormat): string {
  switch (format) {
    case 'PDF':
      return 'application/pdf'
    case 'EPUB':
      return 'application/epub+zip'
    case 'TXT':
      return 'text/plain; charset=utf-8'
    case 'ZIP':
      return 'application/zip'
    default:
      return 'text/html; charset=utf-8'
  }
}

export function filenameFor(id: string, format: BookFormat): string {
  const entry = CATALOG_BY_ID.get(id)
  const base = entry ? normalizeKey(entry.title).replace(/ /g, '-') : id.replace(/[^A-Za-z0-9_-]/g, '').slice(0, 40)
  const extension = format === 'PDF' ? 'pdf' : format === 'EPUB' ? 'epub' : format === 'TXT' ? 'txt' : format === 'ZIP' ? 'zip' : 'html'
  return `${base || 'ouvrage'}.${extension}`
}
