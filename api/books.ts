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
  // ── Informatique & IA ──
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
    downloadUrl: 'https://archive.org/download/introductiontoal00corm/introductiontoal00corm.pdf',
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
    id: 'curated-cs-7',
    title: 'Artificial Intelligence: A Modern Approach (4th Edition)',
    authors: ['Stuart Russell', 'Peter Norvig'],
    year: 2020,
    category: 'Informatique & IA',
    language: 'Anglais',
    coverUrl: 'https://covers.openlibrary.org/b/id/10524032-M.jpg',
    description: 'L’ouvrage encyclopédique de référence sur l’intelligence artificielle : agents intelligents, recherche, apprentissage automatique et réseaux profonds.',
    downloadUrl: 'https://aima.cs.berkeley.edu/',
    directReadUrl: 'https://aima.cs.berkeley.edu/',
    format: 'PDF',
    source: 'Open Library',
    downloadsCount: 42100,
    cachedInBucket: false,
  },
  {
    id: 'curated-cs-8',
    title: 'The Linux Command Line (5th Edition)',
    authors: ['William Shotts'],
    year: 2019,
    category: 'Informatique & IA',
    language: 'Anglais / Français',
    coverUrl: 'https://covers.openlibrary.org/b/id/8314112-M.jpg',
    description: 'Manuel pratique complet sur le terminal Linux, le shell Bash, les scripts d’automatisation et l’administration système.',
    downloadUrl: 'https://linuxcommand.org/tlcl.php',
    directReadUrl: 'https://linuxcommand.org/tlcl.php',
    format: 'PDF',
    source: 'Archive Académique',
    downloadsCount: 18900,
    cachedInBucket: false,
  },

  // ── Mathématiques & Data ──
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
    id: 'curated-math-3',
    title: 'Introductory Statistics (OpenStax)',
    authors: ['Barbara Illowsky', 'Susan Dean'],
    year: 2018,
    category: 'Mathématiques & Data',
    language: 'Anglais',
    coverUrl: 'https://covers.openlibrary.org/b/id/8725102-M.jpg',
    description: 'Probabilités, variables aléatoires, loi normale, tests d’hypothèses et régression linéaire pour les sciences exactes et sociales.',
    downloadUrl: 'https://openstax.org/details/books/introductory-statistics',
    directReadUrl: 'https://openstax.org/books/introductory-statistics/pages/1-introduction',
    format: 'PDF',
    source: 'Open Library',
    downloadsCount: 14500,
    cachedInBucket: false,
  },
  {
    id: 'curated-math-4',
    title: 'Cours d’Algèbre et Analyse Mathématique L1-L2',
    authors: ['Département de Mathématiques'],
    year: 2022,
    category: 'Mathématiques & Data',
    language: 'Français',
    coverUrl: 'https://covers.openlibrary.org/b/id/8521094-M.jpg',
    description: 'Polycopié complet d’algèbre générale (groupes, anneaux, espaces vectoriels) et d’analyse réelle pour étudiants universitaires francophones.',
    downloadUrl: 'https://archive.org/details/cours-analyse-algebre',
    directReadUrl: 'https://archive.org/details/cours-analyse-algebre',
    format: 'PDF',
    source: 'Archive Académique',
    downloadsCount: 12300,
    cachedInBucket: false,
  },

  // ── Physique & Sciences ──
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
    id: 'curated-phy-2',
    title: 'Chemistry 2e (OpenStax)',
    authors: ['Paul Flowers', 'Klaus Theopold', 'Richard Langley', 'William R. Robinson'],
    year: 2019,
    category: 'Physique & Sciences',
    language: 'Anglais',
    coverUrl: 'https://covers.openlibrary.org/b/id/8695021-M.jpg',
    description: 'Manuel de référence en chimie générale : structure atomique, liaisons chimiques, stœchiométrie, thermochimie et cinétique chimique.',
    downloadUrl: 'https://openstax.org/details/books/chemistry-2e',
    directReadUrl: 'https://openstax.org/books/chemistry-2e/pages/1-introduction',
    format: 'PDF',
    source: 'Open Library',
    downloadsCount: 17800,
    cachedInBucket: false,
    isbn: '9781947172623',
  },
  {
    id: 'curated-phy-3',
    title: 'Fondements de la Mécanique Quantique et Relativiste',
    authors: ['Prof. H. Poincaré', 'Faculté des Sciences'],
    year: 2021,
    category: 'Physique & Sciences',
    language: 'Français',
    coverUrl: 'https://covers.openlibrary.org/b/id/8720194-M.jpg',
    description: 'Initiation rigoureuse à l’équation de Schrödinger, aux postulats quantiques, à l’oscillateur harmonique et à la relativité restreinte.',
    downloadUrl: 'https://archive.org/details/mecanique-quantique',
    directReadUrl: 'https://archive.org/details/mecanique-quantique',
    format: 'PDF',
    source: 'Archive Académique',
    downloadsCount: 9200,
    cachedInBucket: false,
  },

  // ── Économie & Gestion ──
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
    id: 'curated-eco-2',
    title: 'Principles of Accounting Volume 1: Financial Accounting',
    authors: ['Mitchell Franklin', 'Patty Graybeal', 'Dixon Cooper'],
    year: 2019,
    category: 'Économie & Gestion',
    language: 'Anglais',
    coverUrl: 'https://covers.openlibrary.org/b/id/8910452-M.jpg',
    description: 'Comptabilité financière universitaire : bilan comptable, compte de résultat, flux de trésorerie et analyse financière des entreprises.',
    downloadUrl: 'https://openstax.org/details/books/principles-financial-accounting',
    directReadUrl: 'https://openstax.org/books/principles-financial-accounting/pages/1-why-it-matters',
    format: 'PDF',
    source: 'Open Library',
    downloadsCount: 11400,
    cachedInBucket: false,
  },

  // ── Droit & Sciences Po ──
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
    id: 'curated-law-2',
    title: 'Droit Constitutionnel et Régimes Politiques Comparés',
    authors: ['Institut d’Études Politiques'],
    year: 2022,
    category: 'Droit & Sciences Po',
    language: 'Français',
    coverUrl: 'https://covers.openlibrary.org/b/id/10543210-M.jpg',
    description: 'Théorie de l’État, séparation des pouvoirs, contrôle de constitutionnalité et analyse comparée des régimes présidentiels et parlementaires.',
    downloadUrl: 'https://archive.org/details/droit-constitutionnel',
    directReadUrl: 'https://archive.org/details/droit-constitutionnel',
    format: 'PDF',
    source: 'Archive Académique',
    downloadsCount: 7900,
    cachedInBucket: false,
  },

  // ── Médecine & Santé ──
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
    id: 'curated-med-2',
    title: 'Microbiology (OpenStax)',
    authors: ['Nina Parker', 'Mark Schneegurt', 'Anh-Hue Thi Tu'],
    year: 2016,
    category: 'Médecine & Santé',
    language: 'Anglais',
    coverUrl: 'https://covers.openlibrary.org/b/id/8825120-M.jpg',
    description: 'Fondements de la microbiologie clinique : bactéries, virus, immunologie, mécanismes pathogènes et traitements antimicrobiens.',
    downloadUrl: 'https://openstax.org/details/books/microbiology',
    directReadUrl: 'https://openstax.org/books/microbiology/pages/1-introduction',
    format: 'PDF',
    source: 'Open Library',
    downloadsCount: 15600,
    cachedInBucket: false,
  },

  // ── Littérature & Lettres ──
  {
    id: 'curated-cs-cpp-1',
    title: 'The C++ Programming Language (4th Edition)',
    authors: ['Bjarne Stroustrup'],
    year: 2013,
    category: 'Informatique & IA',
    language: 'Anglais / Français',
    coverUrl: 'https://covers.openlibrary.org/b/id/7946979-M.jpg',
    description: 'Le guide complet et définitif du créateur du C++, couvrant la programmation orientée objet, les templates, la STL et la gestion moderne des ressources.',
    downloadUrl: 'https://archive.org/download/the-c-programming-language-4th-edition/The_C_Programming_Language_4th_Edition.pdf',
    directReadUrl: 'https://www.stroustrup.com/4th.html',
    format: 'PDF',
    source: 'Open Library',
    downloadsCount: 35400,
    cachedInBucket: false,
    isbn: '9780321563842',
  },
  {
    id: 'curated-cs-cpp-2',
    title: 'Programming: Principles and Practice Using C++ (2nd Edition)',
    authors: ['Bjarne Stroustrup'],
    year: 2014,
    category: 'Informatique & IA',
    language: 'Anglais',
    coverUrl: 'https://covers.openlibrary.org/b/id/8381861-M.jpg',
    description: 'Introduction fondamentale à la programmation et aux bonnes pratiques d’ingénierie logicielle pour étudiants et universitaires.',
    downloadUrl: 'https://archive.org/download/programming-principles-and-practice-using-c-2nd-edition/Programming_Principles_and_Practice_Using_C_2nd_Edition.pdf',
    directReadUrl: 'https://www.stroustrup.com/programming.html',
    format: 'PDF',
    source: 'Archive Académique',
    downloadsCount: 22100,
    cachedInBucket: false,
    isbn: '9780321992789',
  },
  {
    id: 'curated-cs-cpp-3',
    title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    authors: ['Robert C. Martin'],
    year: 2008,
    category: 'Informatique & IA',
    language: 'Anglais / Français',
    coverUrl: 'https://covers.openlibrary.org/b/id/8231846-M.jpg',
    description: 'Principes incontournables d’écriture de code lisible, maintenable, testable et modulaire pour le développement professionnel.',
    downloadUrl: 'https://archive.org/download/clean-code_202012/Clean_Code.pdf',
    directReadUrl: 'https://archive.org/details/clean-code_202012',
    format: 'PDF',
    source: 'Open Library',
    downloadsCount: 46200,
    cachedInBucket: false,
    isbn: '9780132350884',
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

// Mots-clés de substitution pour la recherche dans les bases académiques internationales
const FRENCH_TO_ENGLISH_TERMS: Record<string, string> = {
  programmation: 'programming',
  programmeur: 'programming',
  developpement: 'software development programming',
  algorithme: 'algorithm',
  algorithmes: 'algorithms',
  structure: 'data structures',
  structures: 'data structures',
  donnees: 'data science',
  chimie: 'chemistry',
  physique: 'physics',
  mathematiques: 'mathematics',
  mathematique: 'mathematics',
  maths: 'mathematics',
  math: 'mathematics',
  algebre: 'algebra',
  analyse: 'calculus analysis',
  geometrie: 'geometry',
  probabilite: 'probability',
  probabilites: 'probabilities probability',
  statistique: 'statistics',
  statistiques: 'statistics',
  informatique: 'computer science programming',
  reseau: 'computer networks',
  reseaux: 'computer networks networking',
  systeme: 'operating system',
  systemes: 'operating systems',
  securite: 'cybersecurity security',
  cryptographie: 'cryptography',
  intelligence: 'artificial intelligence',
  artificielle: 'artificial intelligence',
  ia: 'artificial intelligence',
  machine: 'machine learning',
  apprentissage: 'machine learning',
  droit: 'law jurisprudence',
  juridique: 'legal law',
  constitutionnel: 'constitutional',
  civil: 'civil law',
  penal: 'criminal law',
  economie: 'economics',
  economique: 'economics',
  gestion: 'management accounting',
  finance: 'finance',
  finances: 'financial finance',
  comptabilite: 'accounting',
  marketing: 'marketing',
  biologie: 'biology',
  biochimie: 'biochemistry',
  genetique: 'genetics',
  medecine: 'medicine',
  medical: 'medicine',
  anatomie: 'anatomy',
  physiologie: 'physiology',
  sante: 'health medical',
  pharmacologie: 'pharmacology',
  histoire: 'history',
  philosophie: 'philosophy',
  sociologie: 'sociology',
  litterature: 'literature',
  langue: 'linguistics language',
  anglais: 'english',
  francais: 'french',
  livre: 'book',
  manuel: 'textbook',
  cours: 'course textbook',
}

function normalizeTerm(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Appwrite-Project, X-Requested-With')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    let query = ''
    let category = 'Tous'
    let limit = 35

    if (req.method === 'GET') {
      query = ((req.query.q as string) || (req.query.query as string) || '').trim()
      category = (req.query.category as string) || 'Tous'
      limit = Math.min(100, Math.max(10, parseInt(req.query.limit as string, 10) || 35))
    } else if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}
      query = (body.query || body.q || '').trim()
      category = body.category || 'Tous'
      limit = Math.min(100, Math.max(10, parseInt(body.limit, 10) || 35))
    }

    const normQuery = normalizeTerm(query)
    const normCategory = normalizeTerm(category)

    // 1. Filtrer d'abord parmi le catalogue local indexé (réponse instantanée)
    let results: ApiBook[] = CURATED_BOOKS.filter((b) => {
      const bCatNorm = normalizeTerm(b.category)
      const matchesCat =
        category === 'Tous' ||
        bCatNorm.includes(normCategory) ||
        normCategory.includes(bCatNorm)

      if (!matchesCat) return false
      if (!normQuery) return true

      const titleMatch = normalizeTerm(b.title).includes(normQuery)
      const authorMatch = b.authors.some((a) => normalizeTerm(a).includes(normQuery))
      const descMatch = b.description ? normalizeTerm(b.description).includes(normQuery) : false
      return titleMatch || authorMatch || descMatch
    })

    // Termes de recherche enrichis pour les bases externes (OpenLibrary + Gutendex)
    let externalSearchTerm = query
    if (externalSearchTerm) {
      // Traduction mot à mot intelligente (ex: "programmation c++" -> "programming c++")
      const words = externalSearchTerm.split(/\s+/)
      const mappedWords = words.map((w) => {
        const nw = normalizeTerm(w)
        return FRENCH_TO_ENGLISH_TERMS[nw] || w
      })
      externalSearchTerm = mappedWords.join(' ')
    } else if (category !== 'Tous') {
      externalSearchTerm = FRENCH_TO_ENGLISH_TERMS[normCategory] || category
    }

    if (!externalSearchTerm) {
      externalSearchTerm = 'science computer mathematics physics'
    }

    // 2. Recherche distante en parallèle : Open Library + Gutendex
    const searchPromises: Promise<ApiBook[]>[] = []

    // Source A : Open Library (30+ millions d'ouvrages)
    searchPromises.push(
      (async () => {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 4500)
        try {
          const olUrl = `https://openlibrary.org/search.json?q=${encodeURIComponent(externalSearchTerm)}&limit=${limit}`
          const olRes = await fetch(olUrl, { signal: controller.signal })
          clearTimeout(timeout)
          if (!olRes.ok) return []
          const data = await olRes.json()
          if (!data.docs || !Array.isArray(data.docs)) return []

          return data.docs.map((doc: any): ApiBook => {
            const coverUrl = doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : undefined
            const iaId = doc.ia?.[0]
            const downloadUrl = iaId ? `https://archive.org/download/${iaId}/${iaId}.pdf` : undefined
            const readUrl = doc.key ? `https://openlibrary.org${doc.key}` : undefined

            return {
              id: `ol-${doc.key ? doc.key.replace('/works/', '') : Math.random().toString(36).slice(2)}`,
              title: doc.title || 'Ouvrage sans titre',
              authors: Array.isArray(doc.author_name) ? doc.author_name : ['Auteur Universitaire'],
              year: doc.first_publish_year || undefined,
              category: category !== 'Tous' ? category : 'Sciences & Enseignement',
              language: Array.isArray(doc.language) && doc.language.includes('fre') ? 'Français' : 'Anglais',
              coverUrl,
              description: `Édition académique (${doc.first_publish_year || 'Récente'}). ${doc.subject ? `Sujets : ${(doc.subject as string[]).slice(0, 4).join(', ')}` : ''}`,
              downloadUrl: downloadUrl || readUrl,
              directReadUrl: readUrl || downloadUrl,
              format: 'PDF',
              source: 'Open Library',
              downloadsCount: doc.edition_count ? doc.edition_count * 200 : 850,
              cachedInBucket: false,
              isbn: Array.isArray(doc.isbn) ? doc.isbn[0] : undefined,
            }
          })
        } catch {
          clearTimeout(timeout)
          return []
        }
      })()
    )

    // Source B : Project Gutenberg (Gutendex)
    searchPromises.push(
      (async () => {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 4000)
        try {
          const gUrl = `https://gutendex.com/books/?search=${encodeURIComponent(externalSearchTerm)}`
          const gRes = await fetch(gUrl, { signal: controller.signal })
          clearTimeout(timeout)
          if (!gRes.ok) return []
          const gData = await gRes.json()
          if (!gData.results || !Array.isArray(gData.results)) return []

          return gData.results.map((b: any): ApiBook => {
            const formats = b.formats || {}
            const pdfUrl = formats['application/pdf'] || formats['application/epub+zip'] || formats['text/html'] || ''
            const coverUrl = formats['image/jpeg'] || undefined
            return {
              id: `guten-${b.id}`,
              title: b.title,
              authors: Array.isArray(b.authors) && b.authors.length > 0 ? b.authors.map((a: any) => a.name) : ['Auteur Gutenberg'],
              category: category !== 'Tous' ? category : 'Général & Sciences',
              language: Array.isArray(b.languages) && b.languages.includes('fr') ? 'Français' : 'Multilingue',
              downloadUrl: pdfUrl,
              directReadUrl: formats['text/html'] || pdfUrl,
              coverUrl,
              format: pdfUrl.includes('epub') ? 'EPUB' : 'PDF',
              source: 'Project Gutenberg',
              downloadsCount: b.download_count || 150,
              cachedInBucket: false,
            }
          })
        } catch {
          clearTimeout(timeout)
          return []
        }
      })()
    )

    const [olSettled, gutenSettled] = await Promise.allSettled(searchPromises)
    const olList = olSettled.status === 'fulfilled' ? olSettled.value : []
    const gutenList = gutenSettled.status === 'fulfilled' ? gutenSettled.value : []

    // 3. Déduplication par titre normalisé
    const seenTitles = new Set<string>()
    const merged: ApiBook[] = []

    for (const b of [...results, ...olList, ...gutenList]) {
      const key = normalizeTerm(b.title)
      if (key && !seenTitles.has(key)) {
        seenTitles.add(key)
        merged.push(b)
      }
    }

    const finalResults = merged.slice(0, limit)

    return res.status(200).json({
      ok: true,
      total: finalResults.length,
      results: finalResults,
      books: finalResults,
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
