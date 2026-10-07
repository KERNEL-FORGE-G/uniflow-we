import type { VercelRequest, VercelResponse } from '@vercel/node'

export interface ApiBook {
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
  source: string
  downloadsCount?: number
  cachedInBucket: boolean
  isbn?: string
}

const CURATED_BOOKS: ApiBook[] = [
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
    language: 'Anglais',
    coverUrl: 'https://covers.openlibrary.org/b/id/8231856-M.jpg',
    description: 'La bible mondiale des structures de données et des algorithmes. Manuel indispensable pour tout cursus en sciences informatiques.',
    downloadUrl: 'https://edutechlearners.com/download/Introduction_to_algorithms-3rd%20Edition.pdf',
    directReadUrl: 'https://mitpress.mit.edu/books/introduction-algorithms-third-edition',
    format: 'PDF',
    source: 'Archive Académique',
    downloadsCount: 28900,
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
    coverUrl: 'https://covers.openlibrary.org/b/id/12683921-M.jpg',
    description: 'Un ouvrage universitaire clair et complet sur la virtualisation du CPU/mémoire, la concurrence et la persistance des systèmes d’exploitation.',
    downloadUrl: 'https://pages.cs.wisc.edu/~remzi/OSTEP/ostep.pdf',
    directReadUrl: 'https://pages.cs.wisc.edu/~remzi/OSTEP/',
    format: 'PDF',
    source: 'Open Library',
    downloadsCount: 19500,
    cachedInBucket: false,
  },
  {
    id: 'curated-cs-4',
    title: 'Computer Networks: A Systems Approach',
    authors: ['Larry Peterson', 'Bruce Davie'],
    year: 2021,
    category: 'Informatique & IA',
    language: 'Anglais',
    coverUrl: 'https://covers.openlibrary.org/b/id/8301294-M.jpg',
    description: 'Les concepts fondamentaux des réseaux informatiques expliqués à travers la conception de systèmes réels, de TCP/IP aux architectures SDN.',
    downloadUrl: 'https://book.systemsapproach.org/',
    directReadUrl: 'https://book.systemsapproach.org/',
    format: 'HTML',
    source: 'Archive Académique',
    downloadsCount: 11200,
    cachedInBucket: false,
  },
  {
    id: 'curated-cs-5',
    title: 'Python for Data Analysis (3rd Edition)',
    authors: ['Wes McKinney'],
    year: 2022,
    category: 'Informatique & IA',
    language: 'Anglais',
    coverUrl: 'https://covers.openlibrary.org/b/id/12845620-M.jpg',
    description: 'Manipulation, traitement, nettoyage et analyse approfondie des données avec Python, Pandas, NumPy et Jupyter, par le créateur de Pandas.',
    downloadUrl: 'https://wesmckinney.com/book/',
    directReadUrl: 'https://wesmckinney.com/book/',
    format: 'HTML',
    source: 'Open Library',
    downloadsCount: 22400,
    cachedInBucket: false,
  },
  {
    id: 'curated-cs-6',
    title: 'Designing Data-Intensive Applications',
    authors: ['Martin Kleppmann'],
    year: 2017,
    category: 'Informatique & IA',
    language: 'Anglais',
    coverUrl: 'https://covers.openlibrary.org/b/id/8091123-M.jpg',
    description: 'Principes architecturaux fiables, scalables et maintenables pour les systèmes de données modernes, transactions distribuées et flux d’événements.',
    downloadUrl: 'https://dataintensive.net/',
    directReadUrl: 'https://dataintensive.net/',
    format: 'PDF',
    source: 'Open Library',
    downloadsCount: 31200,
    cachedInBucket: false,
    isbn: '9781449373320',
  },
  {
    id: 'curated-math-1',
    title: 'Calculus Volume 1 (OpenStax)',
    authors: ['Edwin Herman', 'Gilbert Strang'],
    year: 2016,
    category: 'Mathématiques & Data',
    language: 'Anglais',
    coverUrl: 'https://covers.openlibrary.org/b/id/8521094-M.jpg',
    description: 'Manuel universitaire complet d’analyse mathématique : fonctions, limites, dérivées, intégrales et applications concrètes.',
    downloadUrl: 'https://openstax.org/details/books/calculus-volume-1',
    directReadUrl: 'https://openstax.org/books/calculus-volume-1/pages/1-introduction',
    format: 'PDF',
    source: 'Open Library',
    downloadsCount: 16700,
    cachedInBucket: false,
    isbn: '9781938168024',
  },
  {
    id: 'curated-math-2',
    title: 'Linear Algebra and Learning from Data',
    authors: ['Gilbert Strang'],
    year: 2019,
    category: 'Mathématiques & Data',
    language: 'Anglais',
    coverUrl: 'https://covers.openlibrary.org/b/id/10294812-M.jpg',
    description: 'Manuel fondamental du professeur Strang sur l’algèbre linéaire appliquée au Machine Learning, aux réseaux de neurones et à la décomposition SVD.',
    downloadUrl: 'https://math.mit.edu/~gs/learningfromdata/',
    directReadUrl: 'https://math.mit.edu/~gs/learningfromdata/',
    format: 'PDF',
    source: 'Open Library',
    downloadsCount: 18400,
    cachedInBucket: false,
    isbn: '9780692196380',
  },
  {
    id: 'curated-phy-1',
    title: 'University Physics Volume 1 (OpenStax)',
    authors: ['Samuel J. Ling', 'Jeff Sanny', 'William Moebs'],
    year: 2016,
    category: 'Physique & Sciences',
    language: 'Anglais',
    coverUrl: 'https://covers.openlibrary.org/b/id/8720194-M.jpg',
    description: 'Physique générale universitaire basée sur le calcul différentiel et intégral : mécanique newtonienne, ondes et acoustique.',
    downloadUrl: 'https://openstax.org/details/books/university-physics-volume-1',
    directReadUrl: 'https://openstax.org/books/university-physics-volume-1/pages/1-introduction',
    format: 'PDF',
    source: 'Open Library',
    downloadsCount: 13900,
    cachedInBucket: false,
    isbn: '9781938168277',
  },
  {
    id: 'curated-eco-1',
    title: 'Principles of Economics (OpenStax)',
    authors: ['David Shapiro', 'Steven A. Greenlaw'],
    year: 2017,
    category: 'Économie & Gestion',
    language: 'Anglais',
    coverUrl: 'https://covers.openlibrary.org/b/id/8690184-M.jpg',
    description: 'Fondements de la microéconomie et de la macroéconomie moderne pour étudiants de premier et second cycles universitaires.',
    downloadUrl: 'https://openstax.org/details/books/principles-economics-2e',
    directReadUrl: 'https://openstax.org/books/principles-economics-2e/pages/1-introduction',
    format: 'PDF',
    source: 'Open Library',
    downloadsCount: 9800,
    cachedInBucket: false,
    isbn: '9781947172364',
  },
  {
    id: 'curated-law-1',
    title: 'Introduction au Droit Civil et Théorie Générale',
    authors: ['Faculté de Droit & Sciences Juridiques'],
    year: 2021,
    category: 'Droit & Sciences Po',
    language: 'Français',
    coverUrl: 'https://covers.openlibrary.org/b/id/10543210-M.jpg',
    description: 'Manuel académique francophone sur les sources du droit, la hiérarchie des normes, les droits subjectifs et la preuve en droit civil.',
    downloadUrl: 'https://cours.unjf.fr/',
    directReadUrl: 'https://cours.unjf.fr/',
    format: 'PDF',
    source: 'Archive Académique',
    downloadsCount: 8400,
    cachedInBucket: false,
  },
  {
    id: 'curated-med-1',
    title: 'Anatomy and Physiology (OpenStax)',
    authors: ['J. Gordon Betts', 'Kelly A. Young', 'James A. Wise'],
    year: 2013,
    category: 'Médecine & Santé',
    language: 'Anglais',
    coverUrl: 'https://covers.openlibrary.org/b/id/8810293-M.jpg',
    description: 'Manuel exhaustif d’anatomie humaine et de physiologie médicale avec schémas anatomiques haute définition et études cliniques.',
    downloadUrl: 'https://openstax.org/details/books/anatomy-and-physiology',
    directReadUrl: 'https://openstax.org/books/anatomy-and-physiology/pages/1-introduction',
    format: 'PDF',
    source: 'Open Library',
    downloadsCount: 21300,
    cachedInBucket: false,
    isbn: '9781938168130',
  },
  {
    id: 'curated-lit-1',
    title: 'Histoire de la Littérature Francophone et Universelle',
    authors: ['Département de Lettres et Sciences Humaines'],
    year: 2020,
    category: 'Littérature & Lettres',
    language: 'Français',
    coverUrl: 'https://covers.openlibrary.org/b/id/9102834-M.jpg',
    description: 'Panorama des courants littéraires majeurs du XVIe siècle à l’ère contemporaine, méthodologie de la dissertation et de l’explication de texte.',
    downloadUrl: 'https://gallica.bnf.fr/',
    directReadUrl: 'https://gallica.bnf.fr/',
    format: 'PDF',
    source: 'Archive Académique',
    downloadsCount: 7600,
    cachedInBucket: false,
  },
]

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Appwrite-Project')

  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }

  try {
    let query = ''
    let category = 'Tous'
    let limit = 35

    if (req.method === 'GET') {
      query = ((req.query.q as string) || (req.query.query as string) || '').trim().toLowerCase()
      category = (req.query.category as string) || 'Tous'
      limit = Math.min(100, Math.max(10, parseInt(req.query.limit as string, 10) || 35))
    } else if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}
      query = (body.query || body.q || '').trim().toLowerCase()
      category = body.category || 'Tous'
      limit = Math.min(100, Math.max(10, parseInt(body.limit, 10) || 35))
    }

    // Filter curated books
    let results = CURATED_BOOKS.filter((b) => {
      const matchesCategory = category === 'Tous' || b.category.toLowerCase().includes(category.toLowerCase()) || category.toLowerCase().includes(b.category.toLowerCase())
      if (!matchesCategory) return false

      if (!query) return true

      const titleMatch = b.title.toLowerCase().includes(query)
      const authorMatch = b.authors.some((a) => a.toLowerCase().includes(query))
      const descMatch = b.description?.toLowerCase().includes(query)
      return titleMatch || authorMatch || descMatch
    })

    // If needed, supplement with Gutendex
    if (results.length < limit && query) {
      try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 3000)
        const gRes = await fetch(`https://gutendex.com/books/?search=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        })
        clearTimeout(timeout)
        if (gRes.ok) {
          const gData = await gRes.json()
          if (Array.isArray(gData.results)) {
            const extra = gData.results.slice(0, limit - results.length).map((b: any) => ({
              id: `guten-${b.id}`,
              title: b.title,
              authors: (b.authors || []).map((a: any) => a.name),
              category: category !== 'Tous' ? category : 'Général & Sciences',
              language: 'Multilingue',
              downloadUrl: b.formats?.['application/pdf'] || b.formats?.['application/epub+zip'] || b.formats?.['text/html'] || '',
              coverUrl: b.formats?.['image/jpeg'] || undefined,
              format: 'PDF',
              source: 'Project Gutenberg',
              downloadsCount: b.download_count || 100,
              cachedInBucket: false,
            }))
            results = [...results, ...extra]
          }
        }
      } catch {
        // Fallback gracefully to curated books
      }
    }

    const finalResults = results.slice(0, limit)

    return res.status(200).json({
      ok: true,
      total: finalResults.length,
      results: finalResults,
      books: finalResults, // Compatible with both Mobile (results) and Desktop (books)
      category,
      query,
    })
  } catch (error: any) {
    return res.status(500).json({
      ok: false,
      error: error.message || 'Erreur lors de la retransmission du service book',
    })
  }
}
