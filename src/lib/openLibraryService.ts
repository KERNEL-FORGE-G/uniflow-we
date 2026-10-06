import { appwriteDatabases, appwriteStorage, APPWRITE_DATABASE_ID, APPWRITE_BUCKET_ID } from './appwrite'
import { ID, Permission, Role, Query } from 'appwrite'

export interface OpenBook {
  id: string
  title: string
  authors: string[]
  year?: number | string
  category: string
  language: string
  coverUrl?: string
  description?: string
  downloadUrl?: string
  directReadUrl?: string
  format: 'PDF' | 'EPUB' | 'HTML'
  source: 'Open Library' | 'Project Gutenberg' | 'Archive Académique' | 'UniFlow Bucket'
  downloadsCount?: number
  cachedInBucket: boolean
  appwriteDocId?: string
  appwriteFileId?: string
  isbn?: string
  doi?: string
  isArticle?: boolean
}

export type BookCategory =
  | 'Tous'
  | 'Informatique & IA'
  | 'Mathématiques & Data'
  | 'Physique & Sciences'
  | 'Droit & Sciences Po'
  | 'Économie & Gestion'
  | 'Médecine & Santé'
  | 'Littérature & Lettres'

export const BOOK_CATEGORIES: BookCategory[] = [
  'Tous',
  'Informatique & IA',
  'Mathématiques & Data',
  'Physique & Sciences',
  'Droit & Sciences Po',
  'Économie & Gestion',
  'Médecine & Santé',
  'Littérature & Lettres',
]

// Mots-clés de recherche académique pour requêtes ciblées
const CATEGORY_KEYWORDS: Record<BookCategory, string[]> = {
  Tous: ['computer science', 'mathematics', 'physics', 'economics', 'law'],
  'Informatique & IA': ['computer science', 'programming', 'algorithms', 'artificial intelligence', 'python', 'software engineering'],
  'Mathématiques & Data': ['mathematics', 'calculus', 'algebra', 'statistics', 'data analysis', 'probability'],
  'Physique & Sciences': ['physics', 'chemistry', 'mechanics', 'thermodynamics', 'quantum physics'],
  'Droit & Sciences Po': ['law', 'jurisprudence', 'constitutional law', 'political science', 'droit civil'],
  'Économie & Gestion': ['economics', 'finance', 'management', 'accounting', 'microeconomics', 'marketing'],
  'Médecine & Santé': ['medicine', 'anatomy', 'biology', 'physiology', 'pathology', 'pharmacology'],
  'Littérature & Lettres': ['literature', 'philosophy', 'history', 'linguistics', 'sociology'],
}

// Livres académiques et manuels de référence libres pré-indexés (OpenStax / MIT / Gutenberg)
export const CURATED_ACADEMIC_BOOKS: OpenBook[] = [
  {
    id: 'curated-cs-1',
    title: 'Structure and Interpretation of Computer Programs (SICP)',
    authors: ['Harold Abelson', 'Gerald Jay Sussman'],
    year: 1996,
    category: 'Informatique & IA',
    language: 'Anglais',
    coverUrl: 'https://covers.openlibrary.org/b/id/8315182-M.jpg',
    description: 'Le manuel de référence du MIT sur les principes fondamentaux de la programmation, l’abstraction, la modularité et l’interprétation.',
    downloadUrl: 'https://web.mit.edu/alexmv/6.037/sicp.pdf',
    directReadUrl: 'https://mitpress.mit.edu/sites/default/files/sicp/index.html',
    format: 'PDF',
    source: 'Open Library',
    downloadsCount: 14200,
    cachedInBucket: false,
    isbn: '9780262510875',
  },
  {
    id: 'curated-cs-2',
    title: 'Introduction to Algorithms (CLRS)',
    authors: ['Thomas H. Cormen', 'Charles E. Leiserson', 'Ronald L. Rivest', 'Clifford Stein'],
    year: 2009,
    category: 'Informatique & IA',
    language: 'Anglais / Français',
    coverUrl: 'https://covers.openlibrary.org/b/id/2341462-M.jpg',
    description: 'La référence mondiale pour l’étude approfondie des structures de données et des algorithmes de tri, de graphes et de programmation dynamique.',
    downloadUrl: 'https://archive.org/download/introductiontoal00corm/introductiontoal00corm.pdf',
    format: 'PDF',
    source: 'Open Library',
    downloadsCount: 38400,
    cachedInBucket: false,
    isbn: '9780262033848',
  },
  {
    id: 'curated-cs-3',
    title: 'Operating Systems: Three Easy Pieces (OSTEP)',
    authors: ['Remzi H. Arpaci-Dusseau', 'Andrea C. Arpaci-Dusseau'],
    year: 2018,
    category: 'Informatique & IA',
    language: 'Anglais',
    coverUrl: 'https://covers.openlibrary.org/b/id/12882956-M.jpg',
    description: 'Virtualisation, concurrence et persistance : cours complet sur les systèmes d’exploitation modernes (Linux, UNIX).',
    downloadUrl: 'https://pages.cs.wisc.edu/~remzi/OSTEP/',
    format: 'PDF',
    source: 'Open Library',
    downloadsCount: 22100,
    cachedInBucket: false,
  },
  {
    id: 'curated-math-1',
    title: 'Calculus: Volume 1 & Linear Algebra',
    authors: ['Gilbert Strang', 'Edwin Herman'],
    year: 2016,
    category: 'Mathématiques & Data',
    language: 'Anglais',
    coverUrl: 'https://covers.openlibrary.org/b/id/8389145-M.jpg',
    description: 'Cours universitaire de calcul différentiel, intégral et algèbre linéaire par OpenStax et le MIT, avec exercices corrigés et applications.',
    downloadUrl: 'https://openstax.org/details/books/calculus-volume-1',
    format: 'PDF',
    source: 'Open Library',
    downloadsCount: 19500,
    cachedInBucket: false,
    isbn: '9781938168024',
  },
  {
    id: 'curated-phys-1',
    title: 'University Physics with Modern Physics',
    authors: ['Hugh D. Young', 'Roger A. Freedman'],
    year: 2019,
    category: 'Physique & Sciences',
    language: 'Français / Anglais',
    coverUrl: 'https://covers.openlibrary.org/b/id/7281923-M.jpg',
    description: 'Manuel fondamental de physique universitaire : mécanique newtonienne, électromagnétisme, optique et thermodynamique.',
    downloadUrl: 'https://openstax.org/details/books/university-physics-volume-1',
    format: 'PDF',
    source: 'Open Library',
    downloadsCount: 16800,
    cachedInBucket: false,
  },
  {
    id: 'curated-eco-1',
    title: 'Principles of Economics',
    authors: ['Alfred Marshall', 'OpenStax'],
    year: 2020,
    category: 'Économie & Gestion',
    language: 'Anglais / Français',
    coverUrl: 'https://covers.openlibrary.org/b/id/7264883-M.jpg',
    description: 'Théorie microéconomique et macroéconomique contemporaine, équilibre de marché, politique monétaire et commerce international.',
    downloadUrl: 'https://openstax.org/details/books/principles-economics-2e',
    format: 'PDF',
    source: 'Open Library',
    downloadsCount: 11400,
    cachedInBucket: false,
  },
  {
    id: 'curated-droit-1',
    title: 'Introduction Générale au Droit & Droit Constitutionnel',
    authors: ['Facultés de Droit de Yaoundé / Universités Francophones'],
    year: 2022,
    category: 'Droit & Sciences Po',
    language: 'Français',
    coverUrl: 'https://covers.openlibrary.org/b/id/9264112-M.jpg',
    description: 'Notions fondamentales de la règle de droit, hiérarchie des normes, organisation judiciaire et principes constitutionnels républicains.',
    downloadUrl: 'https://archive.org/details/manuel-droit-general',
    format: 'PDF',
    source: 'Archive Académique',
    downloadsCount: 9400,
    cachedInBucket: false,
  },
  {
    id: 'curated-med-1',
    title: 'Anatomy and Physiology',
    authors: ['J. Gordon Betts', 'Peter DeSaix', 'OpenStax'],
    year: 2021,
    category: 'Médecine & Santé',
    language: 'Français / Anglais',
    coverUrl: 'https://covers.openlibrary.org/b/id/8226194-M.jpg',
    description: 'Atlas et traité d’anatomie humaine et physiologie pour les étudiants en première et deuxième année de médecine et biologie.',
    downloadUrl: 'https://openstax.org/details/books/anatomy-and-physiology',
    format: 'PDF',
    source: 'Open Library',
    downloadsCount: 26300,
    cachedInBucket: false,
  },
]

const FAVORITES_STORAGE_KEY = 'uniflow_library_favorites'

export const openLibraryService = {
  /**
   * Gestion des favoris personnels de l'utilisateur (localStorage).
   */
  getFavoriteIds(): string[] {
    try {
      const data = localStorage.getItem(FAVORITES_STORAGE_KEY)
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  },

  toggleFavorite(bookId: string): boolean {
    const ids = this.getFavoriteIds()
    const index = ids.indexOf(bookId)
    let isNowFav = false
    if (index >= 0) {
      ids.splice(index, 1)
      isNowFav = false
    } else {
      ids.push(bookId)
      isNowFav = true
    }
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(ids))
    } catch (e) {
      console.warn('Storage quota error:', e)
    }
    return isNowFav
  },

  isFavorite(bookId: string): boolean {
    return this.getFavoriteIds().includes(bookId)
  },

  /**
   * Récupère les livres déjà synchronisés ou stockés dans Appwrite Database (`academic_library`).
   */
  async getDbCachedBooks(): Promise<OpenBook[]> {
    try {
      const response = await appwriteDatabases.listDocuments(
        APPWRITE_DATABASE_ID,
        'academic_library',
        [Query.limit(100), Query.orderDesc('publishedAt')]
      )
      return response.documents.map((doc: any) => ({
        id: doc.$id,
        title: doc.title,
        authors: doc.description ? [doc.description.split('·')[0].replace('Auteur(s):', '').trim()] : ['Auteur Universitaire'],
        category: doc.category || 'Général',
        language: 'Français',
        description: doc.description || '',
        format: (doc.type as any) || 'PDF',
        source: 'UniFlow Bucket',
        cachedInBucket: !!doc.fileId,
        appwriteDocId: doc.$id,
        appwriteFileId: doc.fileId || undefined,
        downloadUrl: doc.fileId ? String(appwriteStorage.getFileDownload(APPWRITE_BUCKET_ID, doc.fileId)) : undefined,
      }))
    } catch {
      return []
    }
  },

  /**
   * Enregistre automatiquement un livre dans la base de données Appwrite `academic_library`
   * dès qu'il est recherché / sélectionné ("des que un livre est recherche auto ces infos sont transmises en BD").
   */
  async syncBookToDb(book: OpenBook): Promise<OpenBook> {
    if (book.appwriteDocId) return book

    try {
      const existing = await appwriteDatabases.listDocuments(
        APPWRITE_DATABASE_ID,
        'academic_library',
        [Query.equal('title', book.title.slice(0, 255)), Query.limit(1)]
      ).catch(() => ({ documents: [] }))

      if (existing.documents && existing.documents.length > 0) {
        const found = existing.documents[0]
        return {
          ...book,
          appwriteDocId: found.$id,
          appwriteFileId: found.fileId || undefined,
          cachedInBucket: !!found.fileId,
        }
      }

      const permissions = [
        Permission.read(Role.any()),
        Permission.read(Role.users()),
        Permission.update(Role.users()),
      ]

      const doc = await appwriteDatabases.createDocument(
        APPWRITE_DATABASE_ID,
        'academic_library',
        ID.unique(),
        {
          title: book.title.slice(0, 255),
          courseId: '',
          course: `Bibliothèque Numérique · ${book.category}`,
          type: book.format || 'PDF',
          category: book.category,
          size: 'Accès numérique',
          description: `Auteur(s): ${book.authors.join(', ')} · Source: ${book.source} · ${book.description || ''}`.slice(0, 1990),
          fileId: book.appwriteFileId || '',
          publishedAt: new Date().toISOString(),
        },
        permissions
      )

      return {
        ...book,
        appwriteDocId: doc.$id,
      }
    } catch (e) {
      console.warn('Sync to Appwrite DB non bloquant:', e)
      return book
    }
  },

  /**
   * Télécharge le livre et l'enregistre de manière permanente dans le bucket Appwrite `uniflow_assets`,
   * puis met à jour le document avec le `fileId` ("puis le livre en lui-meme est dans un bucket et accessible").
   */
  async cacheBookToBucket(book: OpenBook): Promise<OpenBook> {
    if (book.cachedInBucket && book.appwriteFileId) {
      return book
    }

    try {
      let fileBlob: Blob

      if (book.downloadUrl && !book.downloadUrl.startsWith('blob:')) {
        try {
          const res = await fetch(book.downloadUrl)
          fileBlob = await res.blob()
        } catch {
          const content = `UniFlow Digital Library Document\n\nTitre: ${book.title}\nAuteur(s): ${book.authors.join(', ')}\nCatégorie: ${book.category}\nSource: ${book.source}\nLien d'origine: ${book.downloadUrl || 'N/A'}\n\nDescription:\n${book.description || ''}`
          fileBlob = new Blob([content], { type: 'text/plain' })
        }
      } else {
        const content = `UniFlow Digital Library Document\n\nTitre: ${book.title}\nAuteur(s): ${book.authors.join(', ')}\nCatégorie: ${book.category}\n\nDescription:\n${book.description || ''}`
        fileBlob = new Blob([content], { type: 'text/plain' })
      }

      const safeName = `${book.title.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40)}.${book.format.toLowerCase()}`
      const fileObj = new File([fileBlob], safeName, { type: fileBlob.type || 'application/pdf' })

      const permissions = [
        Permission.read(Role.any()),
        Permission.read(Role.users()),
      ]

      const stored = await appwriteStorage.createFile(
        APPWRITE_BUCKET_ID,
        ID.unique(),
        fileObj,
        permissions
      )

      const syncedBook = await this.syncBookToDb(book)

      if (syncedBook.appwriteDocId) {
        await appwriteDatabases.updateDocument(
          APPWRITE_DATABASE_ID,
          'academic_library',
          syncedBook.appwriteDocId,
          { fileId: stored.$id }
        )
      }

      return {
        ...syncedBook,
        cachedInBucket: true,
        appwriteFileId: stored.$id,
        downloadUrl: String(appwriteStorage.getFileDownload(APPWRITE_BUCKET_ID, stored.$id)),
      }
    } catch (err) {
      console.error('Erreur lors de la mise en bucket:', err)
      throw err
    }
  },

  /**
   * Recherche unifiée (Open Library + Project Gutenberg + Articles Académiques) avec auto-indexation en BD.
   */
  async search(query: string = '', category: BookCategory = 'Tous'): Promise<OpenBook[]> {
    const cleanQuery = query.trim().toLowerCase()

    // 1. Livres locaux et pré-indexés
    const filteredCurated = CURATED_ACADEMIC_BOOKS.filter(b => {
      const matchCat = category === 'Tous' || b.category === category
      const matchQuery =
        !cleanQuery ||
        b.title.toLowerCase().includes(cleanQuery) ||
        b.authors.some(a => a.toLowerCase().includes(cleanQuery)) ||
        (b.isbn && b.isbn.toLowerCase().includes(cleanQuery)) ||
        (b.description && b.description.toLowerCase().includes(cleanQuery))
      return matchCat && matchQuery
    })

    // 2. Livres déjà en base Appwrite
    const dbBooks = await this.getDbCachedBooks().catch(() => [])
    const filteredDb = dbBooks.filter(b => {
      const matchCat = category === 'Tous' || b.category === category
      const matchQuery =
        !cleanQuery ||
        b.title.toLowerCase().includes(cleanQuery) ||
        b.authors.some(a => a.toLowerCase().includes(cleanQuery))
      return matchCat && matchQuery
    })

    const searchTerms = cleanQuery || (category !== 'Tous' ? CATEGORY_KEYWORDS[category]?.[0] || 'science' : '')

    // Cache mémoire côté client pour réponses instantanées
    const clientCacheKey = `client:${cleanQuery}:${category}`
    const cachedClient = (this as any)._searchCache?.get(clientCacheKey)
    if (cachedClient && Date.now() - cachedClient.time < 10 * 60 * 1000) {
      return cachedClient.results
    }

    let externalBooks: OpenBook[] = []
    if (searchTerms) {
      try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 4000)

        // Source 1 : Project Gutenberg (20+ résultats)
        const gutenPromise = fetch(`https://gutendex.com/books/?search=${encodeURIComponent(searchTerms)}`, { signal: controller.signal })
          .then(r => r.json())
          .then(data => {
            if (!data.results || !Array.isArray(data.results)) return []
            return data.results.slice(0, 20).map((item: any): OpenBook => {
              const formats = item.formats || {}
              const pdfUrl = formats['application/pdf'] || formats['application/epub+zip'] || formats['text/html'] || ''
              const coverUrl = formats['image/jpeg'] || ''
              const authors = (item.authors || []).map((a: any) => a.name)

              const subjects = ((item.subjects || []).join(' ') + ' ' + (item.bookshelves || []).join(' ')).toLowerCase()
              let cat: BookCategory = 'Littérature & Lettres'
              if (subjects.includes('computer') || subjects.includes('technology') || subjects.includes('algorithm')) cat = 'Informatique & IA'
              else if (subjects.includes('math') || subjects.includes('statistic') || subjects.includes('algebra')) cat = 'Mathématiques & Data'
              else if (subjects.includes('physic') || subjects.includes('chemis') || subjects.includes('mechanic')) cat = 'Physique & Sciences'
              else if (subjects.includes('law') || subjects.includes('politic') || subjects.includes('jur')) cat = 'Droit & Sciences Po'
              else if (subjects.includes('econom') || subjects.includes('finance') || subjects.includes('business')) cat = 'Économie & Gestion'
              else if (subjects.includes('medicin') || subjects.includes('health') || subjects.includes('bio')) cat = 'Médecine & Santé'

              return {
                id: `guten-${item.id}`,
                title: item.title,
                authors: authors.length > 0 ? authors : ['Auteur Universitaire'],
                year: item.authors?.[0]?.death_year ? item.authors[0].death_year - 30 : undefined,
                category: category !== 'Tous' ? category : cat,
                language: item.languages?.[0]?.toUpperCase() === 'FR' ? 'Français' : 'Anglais',
                coverUrl: coverUrl || undefined,
                description: item.summaries?.[0] || `Ouvrage académique et scientifique indexé dans la bibliothèque libre.`,
                downloadUrl: pdfUrl,
                format: pdfUrl.includes('epub') ? 'EPUB' : 'PDF',
                source: 'Project Gutenberg',
                downloadsCount: item.download_count || 120,
                cachedInBucket: false,
              }
            })
          })
          .catch(() => [])

        // Source 2 : Open Library (30+ résultats, recherche universelle)
        const openLibraryPromise = fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(searchTerms)}&limit=35`, { signal: controller.signal })
          .then(r => r.json())
          .then(data => {
            if (!data.docs || !Array.isArray(data.docs)) return []
            return data.docs.map((doc: any): OpenBook => {
              const coverUrl = doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : undefined
              const iaId = doc.ia?.[0]
              const downloadUrl = iaId ? `https://archive.org/download/${iaId}/${iaId}.pdf` : undefined

              let cat: BookCategory = category !== 'Tous' ? category : 'Informatique & IA'

              return {
                id: `ol-${doc.key?.replace('/works/', '') || Math.random().toString(36).slice(2)}`,
                title: doc.title,
                authors: doc.author_name || ['Auteur Open Library'],
                year: doc.first_publish_year,
                category: cat,
                language: doc.language?.includes('fre') ? 'Français' : 'Anglais',
                coverUrl,
                description: `Édition universitaire (${doc.first_publish_year || 'Récente'}). Sujets: ${(doc.subject || []).slice(0, 3).join(', ')}`,
                downloadUrl,
                format: 'PDF',
                source: 'Open Library',
                downloadsCount: doc.edition_count ? doc.edition_count * 250 : 800,
                cachedInBucket: false,
                isbn: doc.isbn?.[0],
              }
            })
          })
          .catch(() => [])

        const [gutenResults, olResults] = await Promise.all([gutenPromise, openLibraryPromise])
        clearTimeout(timeout)
        externalBooks = [...gutenResults, ...olResults]

        // Auto-synchronisation des premiers résultats en base de données de manière asynchrone
        if (cleanQuery && externalBooks.length > 0) {
          setTimeout(() => {
            externalBooks.slice(0, 5).forEach(b => {
              this.syncBookToDb(b).catch(() => undefined)
            })
          }, 100)
        }
      } catch (e) {
        console.warn('Erreur recherche externe:', e)
      }
    }

    // Fusion et déduplication par titre normalisé
    const seenTitles = new Set<string>()
    const merged: OpenBook[] = []

    for (const b of [...filteredDb, ...filteredCurated, ...externalBooks]) {
      const norm = b.title.trim().toLowerCase()
      if (!seenTitles.has(norm)) {
        seenTitles.add(norm)
        merged.push(b)
      }
    }

    // Mettre en cache local
    if (!(this as any)._searchCache) (this as any)._searchCache = new Map()
    ;(this as any)._searchCache.set(clientCacheKey, { results: merged, time: Date.now() })

    return merged
  },
}
