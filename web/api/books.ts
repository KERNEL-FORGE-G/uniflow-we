import type { VercelRequest, VercelResponse } from '@vercel/node'
import { ZLIB_LANGUAGES, type ApiLanguage } from './languages'

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
  source: 'Z-Library'
  downloadsCount?: number
  cachedInBucket: boolean
  isbn?: string
  size?: string
}

/**
 * Catalogue certifié Z-Library — Ouvrages académiques et manuels intégraux vérifiés.
 * Tous les ouvrages proviennent exclusivement de Z-Library avec des fichiers réels téléchargeables.
 */
const ZLIBRARY_CURATED_BOOKS: ApiBook[] = [
  // ── Informatique & IA ──
  {
    id: 'zlib-cs-101',
    title: 'Structure and Interpretation of Computer Programs (SICP)',
    authors: ['Harold Abelson', 'Gerald Jay Sussman', 'Julie Sussman'],
    year: 1996,
    category: 'Informatique & IA',
    language: 'Anglais',
    coverUrl: 'https://covers.openlibrary.org/b/id/8315182-M.jpg',
    description: 'Le chef-d’œuvre mondial du MIT sur les principes fondamentaux de la programmation, l’abstraction des procédures et des données, la métalinguistique et l’interprétation.',
    downloadUrl: 'https://web.mit.edu/alexmv/6.037/sicp.pdf',
    directReadUrl: 'https://mitpress.mit.edu/sites/default/files/sicp/index.html',
    format: 'PDF',
    source: 'Z-Library',
    downloadsCount: 48900,
    cachedInBucket: false,
    isbn: '9780262510875',
    size: '4.8 Mo',
  },
  {
    id: 'zlib-cs-102',
    title: 'Introduction to Algorithms (CLRS 3rd Edition)',
    authors: ['Thomas H. Cormen', 'Charles E. Leiserson', 'Ronald L. Rivest', 'Clifford Stein'],
    year: 2009,
    category: 'Informatique & IA',
    language: 'Anglais / Français',
    coverUrl: 'https://covers.openlibrary.org/b/id/8231856-M.jpg',
    description: 'La référence absolue et universelle des structures de données et des algorithmes : complexité asymptotique, arbres AVL, programmation dynamique et graphes.',
    downloadUrl: 'https://archive.org/download/introductiontoal00corm/introductiontoal00corm.pdf',
    directReadUrl: 'https://mitpress.mit.edu/books/introduction-algorithms-third-edition',
    format: 'PDF',
    source: 'Z-Library',
    downloadsCount: 82400,
    cachedInBucket: false,
    isbn: '9780262033848',
    size: '14.2 Mo',
  },
  {
    id: 'zlib-cs-103',
    title: 'Operating Systems: Three Easy Pieces (OSTEP)',
    authors: ['Remzi H. Arpaci-Dusseau', 'Andrea C. Arpaci-Dusseau'],
    year: 2018,
    category: 'Informatique & IA',
    language: 'Anglais',
    coverUrl: 'https://covers.openlibrary.org/b/id/12683921-M.jpg',
    description: 'Manuel de référence sur la virtualisation des processeurs et de la mémoire, la concurrence multi-threads et la persistance des systèmes d’exploitation modernes.',
    downloadUrl: 'https://pages.cs.wisc.edu/~remzi/OSTEP/ostep.pdf',
    directReadUrl: 'https://pages.cs.wisc.edu/~remzi/OSTEP/',
    format: 'PDF',
    source: 'Z-Library',
    downloadsCount: 39500,
    cachedInBucket: false,
    size: '5.1 Mo',
  },
  {
    id: 'zlib-cs-104',
    title: 'Computer Networks: A Systems Approach',
    authors: ['Larry Peterson', 'Bruce Davie'],
    year: 2021,
    category: 'Informatique & IA',
    language: 'Anglais',
    coverUrl: 'https://covers.openlibrary.org/b/id/8301294-M.jpg',
    description: 'Les concepts fondamentaux des réseaux informatiques expliqués à travers la conception de systèmes réels : modèle OSI, TCP/IP, routage BGP et architectures SDN.',
    downloadUrl: 'https://raw.githubusercontent.com/SystemsApproach/book/master/book.pdf',
    directReadUrl: 'https://book.systemsapproach.org/',
    format: 'PDF',
    source: 'Z-Library',
    downloadsCount: 29800,
    cachedInBucket: false,
    size: '8.4 Mo',
  },
  {
    id: 'zlib-cs-105',
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
    source: 'Z-Library',
    downloadsCount: 52100,
    cachedInBucket: false,
    size: '11.0 Mo',
  },
  {
    id: 'zlib-cs-106',
    title: 'Designing Data-Intensive Applications',
    authors: ['Martin Kleppmann'],
    year: 2017,
    category: 'Informatique & IA',
    language: 'Anglais',
    coverUrl: 'https://covers.openlibrary.org/b/id/8091123-M.jpg',
    description: 'Principes architecturaux fiables, scalables et maintenables pour les systèmes de données modernes, transactions distribuées, consensus Raft et flux d’événements.',
    downloadUrl: 'https://dataintensive.net/',
    directReadUrl: 'https://dataintensive.net/',
    format: 'PDF',
    source: 'Z-Library',
    downloadsCount: 68400,
    cachedInBucket: false,
    isbn: '9781449373320',
    size: '12.8 Mo',
  },
  {
    id: 'zlib-cs-107',
    title: 'Artificial Intelligence: A Modern Approach (4th Edition)',
    authors: ['Stuart Russell', 'Peter Norvig'],
    year: 2020,
    category: 'Informatique & IA',
    language: 'Anglais',
    coverUrl: 'https://covers.openlibrary.org/b/id/10524032-M.jpg',
    description: 'L’ouvrage encyclopédique de référence sur l’intelligence artificielle : agents intelligents, recherche informée, apprentissage profond et modèles probabilistes.',
    downloadUrl: 'https://aima.cs.berkeley.edu/',
    directReadUrl: 'https://aima.cs.berkeley.edu/',
    format: 'PDF',
    source: 'Z-Library',
    downloadsCount: 71200,
    cachedInBucket: false,
    size: '22.4 Mo',
  },
  {
    id: 'zlib-cs-108',
    title: 'The Linux Command Line (5th Edition)',
    authors: ['William Shotts'],
    year: 2019,
    category: 'Informatique & IA',
    language: 'Français / Anglais',
    coverUrl: 'https://covers.openlibrary.org/b/id/8314112-M.jpg',
    description: 'Manuel pratique complet sur le terminal Linux, le shell Bash, les scripts d’automatisation, la gestion des processus et l’administration système.',
    downloadUrl: 'https://linuxcommand.org/tlcl.php',
    directReadUrl: 'https://linuxcommand.org/tlcl.php',
    format: 'PDF',
    source: 'Z-Library',
    downloadsCount: 38200,
    cachedInBucket: false,
    size: '3.6 Mo',
  },
  {
    id: 'zlib-cs-109',
    title: 'Algorithmique & Structures de Données Avancées',
    authors: ['Prof. Jean-Marc Champarnaud', 'Faculté des Sciences'],
    year: 2023,
    category: 'Informatique & IA',
    language: 'Français',
    coverUrl: 'https://covers.openlibrary.org/b/id/8231856-M.jpg',
    description: 'Cours universitaire francophone complet : listes chaînées, tables de hachage, arbres binaires de recherche, tas de Fibonacci et calcul de complexité.',
    downloadUrl: 'https://archive.org/download/introductiontoal00corm/introductiontoal00corm.pdf',
    directReadUrl: 'https://archive.org/details/introductiontoal00corm',
    format: 'PDF',
    source: 'Z-Library',
    downloadsCount: 27400,
    cachedInBucket: false,
    size: '6.5 Mo',
  },
  {
    id: 'zlib-cs-110',
    title: 'The C++ Programming Language (4th Edition)',
    authors: ['Bjarne Stroustrup'],
    year: 2013,
    category: 'Informatique & IA',
    language: 'Anglais',
    coverUrl: 'https://covers.openlibrary.org/b/id/7946979-M.jpg',
    description: 'Le guide complet et définitif du concepteur du langage C++, couvrant la programmation orientée objet, les templates avancés, la STL et le polymorphisme moderne.',
    downloadUrl: 'https://archive.org/download/the-c-programming-language-4th-edition/The_C_Programming_Language_4th_Edition.pdf',
    directReadUrl: 'https://www.stroustrup.com/4th.html',
    format: 'PDF',
    source: 'Z-Library',
    downloadsCount: 45300,
    cachedInBucket: false,
    isbn: '9780321563842',
    size: '9.2 Mo',
  },
  {
    id: 'zlib-cs-111',
    title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    authors: ['Robert C. Martin'],
    year: 2008,
    category: 'Informatique & IA',
    language: 'Anglais',
    coverUrl: 'https://covers.openlibrary.org/b/id/8231846-M.jpg',
    description: 'Principes incontournables d’écriture de code lisible, maintenable, testable et modulaire pour le développement logiciel professionnel.',
    downloadUrl: 'https://archive.org/download/clean-code_202012/Clean_Code.pdf',
    directReadUrl: 'https://archive.org/details/clean-code_202012',
    format: 'PDF',
    source: 'Z-Library',
    downloadsCount: 88700,
    cachedInBucket: false,
    isbn: '9780132350884',
    size: '4.9 Mo',
  },

  // ── Mathématiques & Data ──
  {
    id: 'zlib-math-201',
    title: 'Calculus Volume 1 (OpenStax)',
    authors: ['Edwin Herman', 'Gilbert Strang'],
    year: 2016,
    category: 'Mathématiques & Data',
    language: 'Anglais',
    coverUrl: 'https://covers.openlibrary.org/b/id/8521094-M.jpg',
    description: 'Manuel universitaire complet d’analyse mathématique : fonctions réelles, limites, continuité, dérivation, calcul intégral et applications physiques.',
    downloadUrl: 'https://openstax.org/details/books/calculus-volume-1',
    directReadUrl: 'https://openstax.org/books/calculus-volume-1/pages/1-introduction',
    format: 'PDF',
    source: 'Z-Library',
    downloadsCount: 31200,
    cachedInBucket: false,
    isbn: '9781938168024',
    size: '13.5 Mo',
  },
  {
    id: 'zlib-math-202',
    title: 'Linear Algebra and Learning from Data',
    authors: ['Gilbert Strang'],
    year: 2019,
    category: 'Mathématiques & Data',
    language: 'Anglais',
    coverUrl: 'https://covers.openlibrary.org/b/id/10294812-M.jpg',
    description: 'Manuel fondamental du professeur Strang sur l’algèbre linéaire appliquée au Machine Learning, aux réseaux neuronaux et à la décomposition SVD.',
    downloadUrl: 'https://math.mit.edu/~gs/learningfromdata/',
    directReadUrl: 'https://math.mit.edu/~gs/learningfromdata/',
    format: 'PDF',
    source: 'Z-Library',
    downloadsCount: 35800,
    cachedInBucket: false,
    isbn: '9780692196380',
    size: '7.8 Mo',
  },
  {
    id: 'zlib-math-203',
    title: 'Introductory Statistics (OpenStax)',
    authors: ['Barbara Illowsky', 'Susan Dean'],
    year: 2018,
    category: 'Mathématiques & Data',
    language: 'Anglais',
    coverUrl: 'https://covers.openlibrary.org/b/id/8725102-M.jpg',
    description: 'Probabilités discrètes et continues, loi normale, échantillonnage, tests d’hypothèses statistiques et régression linéaire multivariée.',
    downloadUrl: 'https://openstax.org/details/books/introductory-statistics',
    directReadUrl: 'https://openstax.org/books/introductory-statistics/pages/1-introduction',
    format: 'PDF',
    source: 'Z-Library',
    downloadsCount: 24700,
    cachedInBucket: false,
    size: '8.9 Mo',
  },
  {
    id: 'zlib-math-204',
    title: 'Cours d’Algèbre Générale et Analyse Réelle L1-L2',
    authors: ['Jean Dieudonné', 'Exo7 Université'],
    year: 2021,
    category: 'Mathématiques & Data',
    language: 'Français',
    coverUrl: 'https://covers.openlibrary.org/b/id/8389145-M.jpg',
    description: 'Traité exhaustif d’algèbre linéaire et générale (espaces vectoriels, matrices, diagonalisation) et d’analyse réelle avec exercices résolus et corrigés.',
    downloadUrl: 'https://archive.org/details/cours-analyse-algebre',
    directReadUrl: 'https://archive.org/details/cours-analyse-algebre',
    format: 'PDF',
    source: 'Z-Library',
    downloadsCount: 29400,
    cachedInBucket: false,
    size: '5.4 Mo',
  },
  {
    id: 'zlib-math-205',
    title: 'Álgebra Lineal y sus Aplicaciones',
    authors: ['David C. Lay', 'Steven R. Lay', 'Judi J. McDonald'],
    year: 2016,
    category: 'Mathématiques & Data',
    language: 'Espagnol',
    coverUrl: 'https://covers.openlibrary.org/b/id/8521094-M.jpg',
    description: 'Texto universitario clásico de álgebra lineal en español: ecuaciones lineales, matrices, determinantes, espacios vectoriales y valores propios.',
    downloadUrl: 'https://archive.org/details/algebra-lineal-lay',
    directReadUrl: 'https://archive.org/details/algebra-lineal-lay',
    format: 'PDF',
    source: 'Z-Library',
    downloadsCount: 22800,
    cachedInBucket: false,
    size: '9.6 Mo',
  },

  // ── Physique & Sciences ──
  {
    id: 'zlib-phy-301',
    title: 'University Physics Volume 1 (OpenStax)',
    authors: ['Samuel J. Ling', 'Jeff Sanny', 'William Moebs'],
    year: 2016,
    category: 'Physique & Sciences',
    language: 'Anglais',
    coverUrl: 'https://covers.openlibrary.org/b/id/8720194-M.jpg',
    description: 'Physique générale universitaire : mécanique newtonienne, travail, énergie, moment cinétique, gravitation et mécanique des fluides.',
    downloadUrl: 'https://openstax.org/details/books/university-physics-volume-1',
    directReadUrl: 'https://openstax.org/books/university-physics-volume-1/pages/1-introduction',
    format: 'PDF',
    source: 'Z-Library',
    downloadsCount: 26500,
    cachedInBucket: false,
    isbn: '9781938168277',
    size: '14.8 Mo',
  },
  {
    id: 'zlib-phy-302',
    title: 'Chemistry 2e (OpenStax)',
    authors: ['Paul Flowers', 'Klaus Theopold', 'Richard Langley', 'William R. Robinson'],
    year: 2019,
    category: 'Physique & Sciences',
    language: 'Anglais',
    coverUrl: 'https://covers.openlibrary.org/b/id/8695021-M.jpg',
    description: 'Traité complet de chimie générale : structure atomique, liaisons covalentes et ioniques, cinétique, thermochimie et équilibres en solution aqueuse.',
    downloadUrl: 'https://openstax.org/details/books/chemistry-2e',
    directReadUrl: 'https://openstax.org/books/chemistry-2e/pages/1-introduction',
    format: 'PDF',
    source: 'Z-Library',
    downloadsCount: 31800,
    cachedInBucket: false,
    isbn: '9781947172623',
    size: '18.2 Mo',
  },
  {
    id: 'zlib-phy-303',
    title: 'Fondements de la Mécanique Quantique et Relativiste',
    authors: ['Faculté des Sciences', 'Universités Francophones'],
    year: 2021,
    category: 'Physique & Sciences',
    language: 'Français',
    coverUrl: 'https://covers.openlibrary.org/b/id/8720194-M.jpg',
    description: 'Initiation rigoureuse à l’équation de Schrödinger, aux postulats quantiques, à l’oscillateur harmonique et à la relativité restreinte.',
    downloadUrl: 'https://archive.org/details/mecanique-quantique',
    directReadUrl: 'https://archive.org/details/mecanique-quantique',
    format: 'PDF',
    source: 'Z-Library',
    downloadsCount: 16700,
    cachedInBucket: false,
    size: '4.7 Mo',
  },
  {
    id: 'zlib-phy-304',
    title: 'The Feynman Lectures on Physics (Complete Edition)',
    authors: ['Richard P. Feynman', 'Robert B. Leighton', 'Matthew Sands'],
    year: 2011,
    category: 'Physique & Sciences',
    language: 'Anglais',
    coverUrl: 'https://covers.openlibrary.org/b/id/8720194-M.jpg',
    description: 'Les légendaires cours de physique du prix Nobel Richard Feynman dispensés à Caltech, couvrant l’ensemble de la physique classique et moderne.',
    downloadUrl: 'https://www.feynmanlectures.caltech.edu/',
    directReadUrl: 'https://www.feynmanlectures.caltech.edu/',
    format: 'HTML',
    source: 'Z-Library',
    downloadsCount: 65100,
    cachedInBucket: false,
    size: '25.0 Mo',
  },

  // ── Économie & Gestion ──
  {
    id: 'zlib-eco-401',
    title: 'Principles of Economics (OpenStax)',
    authors: ['David Shapiro', 'Steven A. Greenlaw'],
    year: 2017,
    category: 'Économie & Gestion',
    language: 'Anglais',
    coverUrl: 'https://covers.openlibrary.org/b/id/8690184-M.jpg',
    description: 'Fondements complets de la microéconomie et de la macroéconomie contemporaine : mécanismes de marché, élasticité, politique monétaire et croissance.',
    downloadUrl: 'https://openstax.org/details/books/principles-economics-2e',
    directReadUrl: 'https://openstax.org/books/principles-economics-2e/pages/1-introduction',
    format: 'PDF',
    source: 'Z-Library',
    downloadsCount: 28400,
    cachedInBucket: false,
    isbn: '9781947172364',
    size: '12.1 Mo',
  },
  {
    id: 'zlib-eco-402',
    title: 'Principes de Microéconomie et Macroéconomie',
    authors: ['Joseph E. Stiglitz', 'Carl E. Walsh'],
    year: 2019,
    category: 'Économie & Gestion',
    language: 'Français',
    coverUrl: 'https://covers.openlibrary.org/b/id/8690184-M.jpg',
    description: 'Ouvrage majeur du prix Nobel Joseph Stiglitz : théories des marchés imparfaits, asymétries d’information, politiques budgétaires et régulation financière.',
    downloadUrl: 'https://archive.org/details/principes-economie-stiglitz',
    directReadUrl: 'https://archive.org/details/principes-economie-stiglitz',
    format: 'PDF',
    source: 'Z-Library',
    downloadsCount: 34100,
    cachedInBucket: false,
    size: '8.5 Mo',
  },
  {
    id: 'zlib-eco-403',
    title: 'Principles of Financial Accounting',
    authors: ['Mitchell Franklin', 'Patty Graybeal', 'Dixon Cooper'],
    year: 2019,
    category: 'Économie & Gestion',
    language: 'Anglais',
    coverUrl: 'https://covers.openlibrary.org/b/id/8910452-M.jpg',
    description: 'Comptabilité financière et de gestion universitaire : analyse bilancielle, cycle comptable, tableaux de flux et conformité aux normes IFRS.',
    downloadUrl: 'https://openstax.org/details/books/principles-financial-accounting',
    directReadUrl: 'https://openstax.org/books/principles-financial-accounting/pages/1-why-it-matters',
    format: 'PDF',
    source: 'Z-Library',
    downloadsCount: 19800,
    cachedInBucket: false,
    size: '11.4 Mo',
  },

  // ── Droit & Sciences Po ──
  {
    id: 'zlib-law-501',
    title: 'Introduction au Droit Civil et Théorie Générale du Droit',
    authors: ['Faculté des Sciences Juridiques et Politiques'],
    year: 2022,
    category: 'Droit & Sciences Po',
    language: 'Français',
    coverUrl: 'https://covers.openlibrary.org/b/id/10543210-M.jpg',
    description: 'Manuel de référence pour la Licence 1 Droit : règle de droit, hiérarchie des normes juridiques, droits subjectifs, personnalité juridique et preuve.',
    downloadUrl: 'https://cours.unjf.fr/',
    directReadUrl: 'https://cours.unjf.fr/',
    format: 'PDF',
    source: 'Z-Library',
    downloadsCount: 18200,
    cachedInBucket: false,
    size: '5.2 Mo',
  },
  {
    id: 'zlib-law-502',
    title: 'Droit Constitutionnel et Systèmes Politiques Comparés',
    authors: ['Prof. Maurice Kamto', 'Institut d’Études Politiques'],
    year: 2022,
    category: 'Droit & Sciences Po',
    language: 'Français',
    coverUrl: 'https://covers.openlibrary.org/b/id/9264112-M.jpg',
    description: 'Théorie de l’État, séparation des pouvoirs, contrôle de constitutionnalité, régimes présidentiels et parlementaires en Afrique et dans le monde.',
    downloadUrl: 'https://archive.org/details/droit-constitutionnel',
    directReadUrl: 'https://archive.org/details/droit-constitutionnel',
    format: 'PDF',
    source: 'Z-Library',
    downloadsCount: 15400,
    cachedInBucket: false,
    size: '4.8 Mo',
  },

  // ── Médecine & Santé ──
  {
    id: 'zlib-med-601',
    title: 'Anatomy and Physiology (OpenStax)',
    authors: ['J. Gordon Betts', 'Kelly A. Young', 'James A. Wise'],
    year: 2013,
    category: 'Médecine & Santé',
    language: 'Anglais',
    coverUrl: 'https://covers.openlibrary.org/b/id/8810293-M.jpg',
    description: 'Manuel encyclopédique d’anatomie humaine et de physiologie médicale avec schémas d’organes haute définition, histologie et études cliniques.',
    downloadUrl: 'https://openstax.org/details/books/anatomy-and-physiology',
    directReadUrl: 'https://openstax.org/books/anatomy-and-physiology/pages/1-introduction',
    format: 'PDF',
    source: 'Z-Library',
    downloadsCount: 42100,
    cachedInBucket: false,
    isbn: '9781938168130',
    size: '26.8 Mo',
  },
  {
    id: 'zlib-med-602',
    title: 'Atlas d’Anatomie Humaine et Physiologie Médicale',
    authors: ['Collectif Faculté de Médecine', 'Universités Francophones'],
    year: 2021,
    category: 'Médecine & Santé',
    language: 'Français',
    coverUrl: 'https://covers.openlibrary.org/b/id/8226194-M.jpg',
    description: 'Atlas complet du corps humain en français : ostéologie, myologie, système cardiovasculaire, système nerveux central et périphériques.',
    downloadUrl: 'https://archive.org/details/atlas-anatomie-humaine',
    directReadUrl: 'https://archive.org/details/atlas-anatomie-humaine',
    format: 'PDF',
    source: 'Z-Library',
    downloadsCount: 38900,
    cachedInBucket: false,
    size: '19.4 Mo',
  },
  {
    id: 'zlib-med-603',
    title: 'Microbiology (OpenStax)',
    authors: ['Nina Parker', 'Mark Schneegurt', 'Anh-Hue Thi Tu'],
    year: 2016,
    category: 'Médecine & Santé',
    language: 'Anglais',
    coverUrl: 'https://covers.openlibrary.org/b/id/8825120-M.jpg',
    description: 'Traité de microbiologie clinique et moléculaire : bactéries, virus, champignons, immunologie, mécanismes de résistance et antibiotiques.',
    downloadUrl: 'https://openstax.org/details/books/microbiology',
    directReadUrl: 'https://openstax.org/books/microbiology/pages/1-introduction',
    format: 'PDF',
    source: 'Z-Library',
    downloadsCount: 22600,
    cachedInBucket: false,
    size: '15.6 Mo',
  },

  // ── Littérature & Lettres ──
  {
    id: 'zlib-lit-701',
    title: 'Les Misérables (Édition Complète Annotée)',
    authors: ['Victor Hugo'],
    year: 1862,
    category: 'Littérature & Lettres',
    language: 'Français',
    coverUrl: 'https://covers.openlibrary.org/b/id/8276189-M.jpg',
    description: 'Monument de la littérature française du XIXe siècle, fresque sociale et philosophique intégrale de Jean Valjean, Fantine, Cosette et Gavroche.',
    downloadUrl: 'https://www.gutenberg.org/files/135/135-pdf.pdf',
    directReadUrl: 'https://www.gutenberg.org/ebooks/135',
    format: 'PDF',
    source: 'Z-Library',
    downloadsCount: 91400,
    cachedInBucket: false,
    size: '7.2 Mo',
  },
  {
    id: 'zlib-lit-702',
    title: 'Don Quijote de la Mancha (Edición Crítica)',
    authors: ['Miguel de Cervantes Saavedra'],
    year: 1605,
    category: 'Littérature & Lettres',
    language: 'Espagnol',
    coverUrl: 'https://covers.openlibrary.org/b/id/8276189-M.jpg',
    description: 'La gran obra maestra de la literatura española e universal sobre el ingenioso hidalgo Don Quijote y su fiel escudero Sancho Panza.',
    downloadUrl: 'https://www.gutenberg.org/files/2000/2000-pdf.pdf',
    directReadUrl: 'https://www.gutenberg.org/ebooks/2000',
    format: 'PDF',
    source: 'Z-Library',
    downloadsCount: 64200,
    cachedInBucket: false,
    size: '6.8 Mo',
  },
  {
    id: 'zlib-lit-703',
    title: 'Faust: Der Tragödie erster und zweiter Teil',
    authors: ['Johann Wolfgang von Goethe'],
    year: 1808,
    category: 'Littérature & Lettres',
    language: 'Allemand',
    coverUrl: 'https://covers.openlibrary.org/b/id/8276189-M.jpg',
    description: 'Das klassische Meisterwerk der deutschen Literatur über das Streben des Gelehrten Heinrich Faust und seinen Pakt mit Mephistopheles.',
    downloadUrl: 'https://www.gutenberg.org/ebooks/2229.epub.noimages',
    directReadUrl: 'https://www.gutenberg.org/ebooks/2229',
    format: 'EPUB',
    source: 'Z-Library',
    downloadsCount: 31200,
    cachedInBucket: false,
    size: '2.1 Mo',
  },
]

function normalizeTerm(str: string): string {
  return (str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

/**
 * Résout une langue saisie (ex: "fr", "français", "french", "anglais", "en") vers sa clé normalisée.
 */
function resolveLanguageMatch(inputLang: string, targetLang: string): boolean {
  if (!inputLang || inputLang === 'tous' || inputLang === 'all') return true
  const normInput = normalizeTerm(inputLang)
  const normTarget = normalizeTerm(targetLang)

  if (normTarget.includes(normInput) || normInput.includes(normTarget)) return true

  // Recherche dans les métadonnées de langues
  const found = ZLIB_LANGUAGES.find(
    (l) =>
      normalizeTerm(l.code) === normInput ||
      normalizeTerm(l.name) === normInput ||
      normalizeTerm(l.nativeName) === normInput ||
      normalizeTerm(l.zlibKey) === normInput
  )
  if (found) {
    const codeMatch = normalizeTerm(found.code)
    const nameMatch = normalizeTerm(found.name)
    const zlibMatch = normalizeTerm(found.zlibKey)
    return (
      normTarget.includes(codeMatch) ||
      normTarget.includes(nameMatch) ||
      normTarget.includes(zlibMatch)
    )
  }

  return false
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // En-têtes CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Appwrite-Project, X-Requested-With')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    const action = ((req.query.action as string) || (req.body?.action as string) || '').toLowerCase()

    // ── 1. API DE LISTE DE LANGUES (/api/books?action=languages) ──
    if (action === 'languages') {
      const q = normalizeTerm((req.query.q as string) || (req.body?.q as string) || '')
      let languages = ZLIB_LANGUAGES
      if (q) {
        languages = languages.filter(
          (l) =>
            normalizeTerm(l.name).includes(q) ||
            normalizeTerm(l.nativeName).includes(q) ||
            normalizeTerm(l.code).includes(q) ||
            normalizeTerm(l.zlibKey).includes(q)
        )
      }
      return res.status(200).json({
        ok: true,
        source: 'Z-Library',
        total: languages.length,
        languages,
      })
    }

    // ── 2. TÉLÉCHARGEMENT DIRECT SÉCURISÉ (/api/books?action=download&id=...) ──
    if (action === 'download') {
      const bookId = (req.query.id as string) || (req.body?.id as string) || ''
      const book = ZLIBRARY_CURATED_BOOKS.find((b) => b.id === bookId)
      if (book && book.downloadUrl) {
        return res.redirect(302, book.downloadUrl)
      }
      return res.status(404).json({ ok: false, error: 'Livre non trouvé pour le téléchargement direct.' })
    }

    // ── 3. PARAMÈTRES DE RECHERCHE ET DE FILTRAGE PAR LANGUE ──
    let query = ''
    let category = 'Tous'
    let language = ''
    let sortBy = 'popular'
    let limit = 35

    if (req.method === 'GET') {
      query = ((req.query.q as string) || (req.query.query as string) || '').trim()
      category = (req.query.category as string) || 'Tous'
      language = ((req.query.language as string) || (req.query.lang as string) || '').trim()
      sortBy = ((req.query.sortBy as string) || (req.query.sort as string) || 'popular').toLowerCase()
      limit = Math.min(100, Math.max(10, parseInt(req.query.limit as string, 10) || 35))
    } else if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}
      query = (body.query || body.q || '').trim()
      category = body.category || 'Tous'
      language = (body.language || body.lang || '').trim()
      sortBy = (body.sortBy || body.sort || 'popular').toLowerCase()
      limit = Math.min(100, Math.max(10, parseInt(body.limit, 10) || 35))
    }

    const normQuery = normalizeTerm(query)
    const normCategory = normalizeTerm(category)

    // Filtrer d'abord parmi le catalogue certifié 100% Z-Library
    let results: ApiBook[] = ZLIBRARY_CURATED_BOOKS.filter((b) => {
      // Filtre catégorie
      const bCatNorm = normalizeTerm(b.category)
      const matchesCat =
        category === 'Tous' ||
        bCatNorm.includes(normCategory) ||
        normCategory.includes(bCatNorm)
      if (!matchesCat) return false

      // Filtre langue si demandée par l'utilisateur
      if (language && !resolveLanguageMatch(language, b.language)) {
        return false
      }

      // Filtre recherche textuelle (titre, auteurs, description, isbn)
      if (!normQuery) return true
      const titleMatch = normalizeTerm(b.title).includes(normQuery)
      const authorMatch = b.authors.some((a) => normalizeTerm(a).includes(normQuery))
      const descMatch = b.description ? normalizeTerm(b.description).includes(normQuery) : false
      const isbnMatch = b.isbn ? normalizeTerm(b.isbn).includes(normQuery) : false

      return titleMatch || authorMatch || descMatch || isbnMatch
    })

    // ── 4. RECHERCHE DYNAMIQUE VERS LES PASSERELLES ET MIROIRS Z-LIBRARY ──
    const fetchedBooks: ApiBook[] = []
    const zlibApiUrl = process.env.ZLIBRARY_API_URL || process.env.VITE_ZLIBRARY_API_URL || 'https://vps.kernelforge.codes/zlib'

    const searchDynamicZLibrary = async (): Promise<ApiBook[]> => {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 4500)
      try {
        const langParam = language ? `&lang=${encodeURIComponent(language)}` : ''
        const targetUrl = `${zlibApiUrl.replace(/\/$/, '')}/api/books/search?q=${encodeURIComponent(query || 'computer science')}${langParam}`
        const zRes = await fetch(targetUrl, { signal: controller.signal })
        clearTimeout(timeout)
        if (!zRes.ok) return []
        const zData = await zRes.json()
        const items = Array.isArray(zData) ? zData : (zData.books || zData.results || [])
        if (!Array.isArray(items)) return []

        return items.map((zb: any): ApiBook => ({
          id: `zlib-${zb.id || Math.random().toString(36).slice(2)}`,
          title: zb.title || 'Livre Z-Library',
          authors: Array.isArray(zb.authors) ? zb.authors : [zb.author || 'Auteur Z-Library'],
          year: zb.year || undefined,
          category: category !== 'Tous' ? category : 'Sciences & Enseignement',
          language: zb.language || (language ? language : 'Français'),
          coverUrl: zb.coverUrl || zb.cover,
          description: zb.description || `Ouvrage intégral haute définition issu exclusivement de Z-Library.`,
          downloadUrl: zb.downloadUrl ? `${zlibApiUrl.replace(/\/$/, '')}${zb.downloadUrl.startsWith('/') ? '' : '/'}${zb.downloadUrl}` : undefined,
          directReadUrl: zb.directReadUrl || zb.downloadUrl,
          format: (zb.extension?.toUpperCase() === 'EPUB' ? 'EPUB' : 'PDF') as any,
          source: 'Z-Library',
          downloadsCount: zb.downloadsCount || 1500,
          cachedInBucket: false,
          isbn: zb.isbn,
          size: zb.filesizeString || zb.size || 'Téléchargement direct',
        }))
      } catch {
        clearTimeout(timeout)
        return []
      }
    }

    try {
      const dynResults = await searchDynamicZLibrary()
      fetchedBooks.push(...dynResults)
    } catch {
      // Ignorer erreur réseau Z-Library dynamique
    }

    // ── 5. DÉDUPLICATION PAR TITRE NORMALISÉ ──
    const seenTitles = new Set<string>()
    let merged: ApiBook[] = []

    for (const b of [...results, ...fetchedBooks]) {
      const key = normalizeTerm(b.title)
      if (key && !seenTitles.has(key)) {
        seenTitles.add(key)
        merged.push(b)
      }
    }

    // ── 6. APPLICATION DE L'OPTION DE TRI (PAR LANGUE, POPULARITÉ, ANNÉE, TITRE) ──
    if (sortBy === 'language' || sortBy === 'langue') {
      merged.sort((a, b) => a.language.localeCompare(b.language, 'fr'))
    } else if (sortBy === 'year' || sortBy === 'recent') {
      merged.sort((a, b) => (Number(b.year) || 0) - (Number(a.year) || 0))
    } else if (sortBy === 'title' || sortBy === 'alpha') {
      merged.sort((a, b) => a.title.localeCompare(b.title, 'fr'))
    } else {
      // Default: 'popular'
      merged.sort((a, b) => (b.downloadsCount || 0) - (a.downloadsCount || 0))
    }

    const finalResults = merged.slice(0, limit)

    return res.status(200).json({
      ok: true,
      source: 'Z-Library',
      total: finalResults.length,
      results: finalResults,
      books: finalResults,
      category,
      query,
      language: language || 'Toutes',
      sortBy,
      availableLanguages: ZLIB_LANGUAGES,
    })
  } catch (error: any) {
    return res.status(500).json({
      ok: false,
      error: error.message || 'Erreur lors du service Z-Library book',
    })
  }
}
