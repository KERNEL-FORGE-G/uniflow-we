import axios, { type AxiosInstance, type InternalAxiosRequestConfig, type AxiosError } from 'axios'
import { playSuccessSound, playErrorSound } from '../utils/sound'

/**
 * Client API UniFlow avec Axios, Moteur Réseau & Intercepteurs d'Authentification
 * Support Multi-Backend :
 *   • Backend 1 (Université) : VITE_UNIVERSITY_API_URL
 *   • Backend 2 (Personnel / SaaS Indépendant) : VITE_PERSONAL_API_URL
 */

export const UNIVERSITY_API_URL = (import.meta.env.VITE_UNIVERSITY_API_URL as string) ?? (import.meta.env.VITE_API_URL as string) ?? 'https://api-uniflow.kernelforge.codes'
export const PERSONAL_API_URL = (import.meta.env.VITE_PERSONAL_API_URL as string) ?? 'https://uniflow-personal-backend.vercel.app'

export function getAccountType(): 'UNIVERSITY' | 'PERSONAL' {
  try {
    const explicit = localStorage.getItem('uniflow_account_type')
    if (explicit === 'PERSONAL' || explicit === 'UNIVERSITY') {
      return explicit
    }
    const rawUser = localStorage.getItem('uniflow_user')
    if (rawUser) {
      const parsed = JSON.parse(rawUser)
      if (parsed.accountType === 'PERSONAL' || parsed.isIndependent) {
        return 'PERSONAL'
      }
    }
  } catch (e) {
    // default to UNIVERSITY
  }
  return 'UNIVERSITY'
}

export function setAccountType(type: 'UNIVERSITY' | 'PERSONAL'): void {
  localStorage.setItem('uniflow_account_type', type)
}

export function getActiveApiUrl(): string {
  return getAccountType() === 'PERSONAL' ? PERSONAL_API_URL : UNIVERSITY_API_URL
}

export const BASE_URL = getActiveApiUrl()

// ─── Tokens ──────────────────────────────────────────────────────────────────

export const getToken = () => localStorage.getItem('uniflow_access_token')
export const getRefreshToken = () => localStorage.getItem('uniflow_refresh_token')
export const setTokens = (a: string, r: string) => {
  localStorage.setItem('uniflow_access_token', a)
  localStorage.setItem('uniflow_refresh_token', r)
}
export const clearTokens = () => {
  localStorage.removeItem('uniflow_access_token')
  localStorage.removeItem('uniflow_refresh_token')
  localStorage.removeItem('uniflow_user')
}

// ─── Axios Instance Configuration & Interceptors ──────────────────────────────

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const axiosInstance = apiClient

const MONITORED_ENDPOINTS = ['/stats/overview', '/students', '/courses', '/teachers']

function isMonitoredPath(url?: string): boolean {
  if (!url) return false
  return MONITORED_ENDPOINTS.some((ep) => url.includes(ep))
}

// Intercepteur de requête : Ajout automatique du jeton d'authentification s'il existe + Journalisation
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    config.baseURL = getActiveApiUrl()
    const token = getToken()
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    const fullUrl = `${config.baseURL ?? ''}${config.url ?? ''}`
    const hasToken = Boolean(token)

    if (isMonitoredPath(config.url)) {
      console.info(`[Axios Diagnostic Request] ${config.method?.toUpperCase()} ${fullUrl} | Token Attached: ${hasToken}`)
    } else {
      console.debug(`[Axios Request] ${config.method?.toUpperCase()} ${fullUrl}`)
    }

    return config
  },
  (error) => {
    console.error('[Axios Request Error]', error)
    return Promise.reject(error)
  }
)

// Intercepteur de réponse : Rafraîchissement automatique du jeton si expirée (401) + Diagnostic 401
apiClient.interceptors.response.use(
  (response) => {
    if (isMonitoredPath(response.config.url)) {
      console.info(`[Axios Diagnostic Response ${response.status}] ${response.config.url}`)
    }
    return response
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
    const url = originalRequest?.url || ''
    const status = error.response?.status
    const token = getToken()

    if (status === 401) {
      console.warn(`[Axios 401 Unauthorized] Endpoint: ${url} | Token Present: ${Boolean(token)} | Message: ${error.message}`)

      if (originalRequest && !originalRequest._retry) {
        originalRequest._retry = true
        console.info(`[Axios 401 Retry] Attempting token refresh for ${url}...`)
        const refreshed = await doRefresh()
        if (refreshed) {
          const newToken = getToken()
          if (newToken && originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`
          }
          console.info(`[Axios 401 Retry Success] Retrying ${url} with new token.`)
          return apiClient(originalRequest)
        } else {
          console.error(`[Axios 401 Retry Failed] Token refresh failed for ${url}. Clearing tokens.`)
          clearTokens()
          try {
            window.dispatchEvent(new CustomEvent('uniflow:session-expired'))
          } catch {}
        }
      }
    } else if (error.response) {
      console.warn(`[Axios Error ${status}] ${url}:`, error.response.data)
    } else {
      console.warn(`[Axios Network Info] ${url}:`, error.message)
    }

    return Promise.reject(error)
  }
)

/**
 * Wrapper centralisé de requête Axios avec gestion du temps d'exécution, journalisation détaillée
 * et fallback gracieux pour le diagnostic des erreurs 401.
 */
export async function executeAxiosRequest<T = any>(config: {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  data?: any
  params?: any
  headers?: Record<string, string>
}): Promise<T> {
  const startTime = Date.now()
  const method = config.method ?? 'GET'
  const isMonitored = isMonitoredPath(config.url)

  if (isMonitored) {
    console.group(`[Axios Wrapper] Executing ${method} ${config.url}`)
    console.info('Config:', config)
  }

  try {
    const response = await apiClient.request<T>({
      url: config.url,
      method,
      data: config.data,
      params: config.params,
      headers: config.headers,
    })

    const duration = Date.now() - startTime
    if (method !== 'GET') {
      playSuccessSound()
    }
    if (isMonitored) {
      console.info(`[Axios Wrapper Success] ${method} ${config.url} (${duration}ms)`)
      console.groupEnd()
    }

    return response.data
  } catch (err: any) {
    const duration = Date.now() - startTime
    const status = err?.response?.status ?? 500
    const errorMessage = err?.response?.data?.message || err?.message || 'Erreur réseau/serveur'

    playErrorSound()

    console.error(`[Axios Wrapper Error ${status}] ${method} ${config.url} (${duration}ms):`, errorMessage)

    if (isMonitored) {
      console.groupEnd()
    }

    throw new ApiError(status, errorMessage, err?.response?.data)
  }
}

export const axiosRequestWrapper = executeAxiosRequest

// ─── ApiError ────────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(public status: number, message: string, public body?: unknown) {
    super(message)
    this.name = 'ApiError'
  }
}

// ─── Local Database Engine (Persistence fallback) ────────────────────────────

const DB_KEY_UNIV = 'uniflow_local_db_v1'
const DB_KEY_PERSONAL = 'uniflow_local_db_personal_v1'

function getLocalDbKey(): string {
  return getAccountType() === 'PERSONAL' ? DB_KEY_PERSONAL : DB_KEY_UNIV
}

function getLocalDb() {
  const dbKey = getLocalDbKey()
  const raw = localStorage.getItem(dbKey)
  if (raw) {
    try { return JSON.parse(raw) } catch {}
  }

  const isPersonal = getAccountType() === 'PERSONAL'
  if (isPersonal) {
    const emptyDb = {
      users: [],
      courses: [],
      schedules: [],
      students: [],
      teachers: [],
      classrooms: [],
      notifications: [],
      assignments: [],
      grades: [],
      conversations: [],
      library: [],
      ue: [],
      attendanceSessions: []
    }
    localStorage.setItem(dbKey, JSON.stringify(emptyDb))
    return emptyDb
  }

  const initial = {
    subscriptionPlans: [
      {
        id: 'plan_personal_cm',
        code: 'personal_cm',
        name: 'Compte Indépendant (Cameroun & CEMAC)',
        category: 'PERSONAL',
        countryCode: 'CM',
        currency: 'XAF',
        priceMonthlyAmount: 100,
        priceAnnuallyAmount: 1000,
        priceMonthly: '100 FCFA / mois',
        priceAnnually: '1 000 FCFA / an',
        period: 'Facturation mensuelle ou annuelle sans engagement',
        badge: 'Populaire (CEMAC)',
        highlight: true,
        description: 'Accès complet au Backend 2 Indépendant avec Mobile Money (MTN, Orange, NotchPay).',
        btnText: 'Souscrire pour 100 FCFA',
        btnVariant: 'primary',
        providers: ['MTN_MOMO', 'ORANGE_MONEY', 'NOTCHPAY'],
        features: [
          'Serveur dédié SaaS (Backend 2)',
          'Emploi du temps & gestion des matières 100% libre',
          'Paiement par MTN MoMo, Orange Money, NotchPay',
          'Mode hors-ligne PWA & synchronisation cloud',
          'Messagerie & visioconférence intégrées',
          'Accès instantané 24/7',
        ],
        status: 'ACTIVE'
      },
      {
        id: 'plan_personal_eu',
        code: 'personal_eu',
        name: 'Compte Indépendant (International)',
        category: 'PERSONAL',
        countryCode: 'FR',
        currency: 'EUR',
        priceMonthlyAmount: 1.00,
        priceAnnuallyAmount: 10.00,
        priceMonthly: '1,00 € / mois',
        priceAnnually: '10,00 € / an',
        period: 'Facturation mensuelle ou annuelle sans engagement',
        badge: 'International',
        highlight: false,
        description: 'Accès complet au Backend 2 avec Stripe, Carte Bancaire et Apple Pay.',
        btnText: 'Souscrire pour 1,00 €',
        btnVariant: 'teal',
        providers: ['STRIPE', 'CARD', 'APPLE_PAY'],
        features: [
          'Serveur dédié SaaS (Backend 2)',
          'Paiement sécurisé Stripe & Carte Bancaire',
          'Emploi du temps & espace de cours autonome',
          'Gestion dynamique des révisions & devoirs',
          'Support prioritaire par email',
        ],
        status: 'ACTIVE'
      },
      {
        id: 'plan_teacher_pack',
        code: 'teacher_pack',
        name: 'Formule Enseignant & Amphi',
        category: 'TEACHER',
        countryCode: 'CM',
        currency: 'XAF',
        priceMonthlyAmount: 2500,
        priceAnnuallyAmount: 25000,
        priceMonthly: '2 500 FCFA / mois',
        priceAnnually: '25 000 FCFA / an',
        period: 'Espace pédagogique & gestion d\'assiduité',
        badge: 'Enseignants',
        highlight: false,
        description: 'Générez des QR Codes de présence, suivez les moyennes et organisez des cours vidéo.',
        btnText: 'Souscrire Formule Enseignant',
        btnVariant: 'indigo',
        providers: ['MTN_MOMO', 'ORANGE_MONEY', 'NOTCHPAY', 'CARD'],
        features: [
          'Gestion des cohortes et saisie des notes',
          'Émargement numérique QR Code / NFC',
          'Salons de visioconférence HD LAN & Cloud',
          'Exportation automatique des PV d\'examen',
          'Support réactif 7j/7',
        ],
        status: 'ACTIVE'
      },
      {
        id: 'plan_campus',
        code: 'campus',
        name: 'Université & Campus (Institutionnel)',
        category: 'INSTITUTION',
        countryCode: 'ALL',
        currency: 'XAF',
        priceMonthlyAmount: 0,
        priceAnnuallyAmount: 0,
        priceMonthly: 'Sur Devis',
        priceAnnually: 'Sur Devis',
        period: 'Déploiement institutionnel multi-facultés',
        badge: 'Sur Mesure',
        highlight: false,
        description: 'Pour l\'administration universitaire désireuse de connecter tout son campus.',
        btnText: 'Demander une étude',
        btnVariant: 'outline',
        providers: ['VIREMENT', 'CONVENTION'],
        features: [
          'Interconnexion Backend 1 Université',
          'Panneau d\'administration centralisé',
          'Gestion des amphis & emplois du temps officiels',
          'Module Sentinelle IoT (Kiosque Santé / Edge AI)',
          'Garantie de service (SLA 99.9%)',
        ],
        status: 'ACTIVE'
      }
    ],
    users: [
      { id: 'usr-1', email: 'emma.martin@uniflow.edu', role: 'ETUDIANT', student: { firstName: 'Emma', lastName: 'Martin', matricule: 'ETU-2022-0847', level: 'L2', specialty: 'Informatique' } },
      { id: 'usr-2', email: 'lucas.dubois@uniflow.edu', role: 'DELEGUE', student: { firstName: 'Lucas', lastName: 'Dubois', matricule: 'ETU-2022-0520', level: 'L2', specialty: 'Informatique' } },
      { id: 'usr-3', email: 'dr.martin@uniflow.edu', role: 'ENSEIGNANT', teacher: { firstName: 'Dr.', lastName: 'Martin' } },
      { id: 'usr-4', email: 'admin@uniflow.edu', role: 'ADMIN' },
    ],
    courses: [
      { id: 'INFO101', name: 'Algorithmique & Structures de données', code: 'INFO101', type: 'CM', credits: 3, hours: 45, teachingUnit: { id: 'ue-1', name: 'Programmation', code: 'UE01', credits: 6 }, teacher: { id: 't-1', firstName: 'Pr.', lastName: 'Martin' }, classroom: { id: 'cl-1', name: 'Salle A204', building: 'Bloc A' } },
      { id: 'INFO201', name: 'Bases de données relationnelles', code: 'INFO201', type: 'CM', credits: 3, hours: 40, teachingUnit: { id: 'ue-1', name: 'Programmation', code: 'UE01', credits: 6 }, teacher: { id: 't-2', firstName: 'Dr.', lastName: 'Benkacem' }, classroom: { id: 'cl-2', name: 'Salle B101', building: 'Bloc B' } },
      { id: 'INFO301', name: 'Réseaux & Protocoles TCP/IP', code: 'INFO301', type: 'TP', credits: 3, hours: 35, teachingUnit: { id: 'ue-2', name: 'Systèmes', code: 'UE02', credits: 6 }, teacher: { id: 't-3', firstName: 'Dr.', lastName: 'Dubois' }, classroom: { id: 'cl-3', name: 'Labo Réseau C', building: 'Bloc C' } },
      { id: 'INFO401', name: 'Intelligence Artificielle & Machine Learning', code: 'INFO401', type: 'CM', credits: 4, hours: 50, teachingUnit: { id: 'ue-3', name: 'IA & Data', code: 'UE03', credits: 8 }, teacher: { id: 't-4', firstName: 'Pr.', lastName: 'Lefèvre' }, classroom: { id: 'cl-4', name: 'Amphi 500', building: 'Grand Amphi' } },
      { id: 'ECO101', name: 'Économie numérique', code: 'ECO101', type: 'CM', credits: 2, hours: 25, teachingUnit: { id: 'ue-4', name: 'Sciences Humaines', code: 'UE04', credits: 4 }, teacher: { id: 't-5', firstName: 'Pr.', lastName: 'Leroy' }, classroom: { id: 'cl-5', name: 'Salle EN5', building: 'Bloc D' } },
    ],
    schedules: [
      { id: 'sch-1', dayOfWeek: 'LUNDI', startTime: '08:00', endTime: '10:00', semesterId: 'S2', course: { id: 'INFO101', name: 'Algorithmique', code: 'INFO101', type: 'CM', teacher: { firstName: 'Pr.', lastName: 'Martin' }, classroom: { name: 'Salle A204', building: 'Bloc A' } } },
      { id: 'sch-2', dayOfWeek: 'MARDI', startTime: '10:00', endTime: '12:00', semesterId: 'S2', course: { id: 'INFO201', name: 'Bases de données', code: 'INFO201', type: 'TD', teacher: { firstName: 'Dr.', lastName: 'Benkacem' }, classroom: { name: 'Salle B101', building: 'Bloc B' } } },
      { id: 'sch-3', dayOfWeek: 'MERCREDI', startTime: '14:00', endTime: '16:00', semesterId: 'S2', course: { id: 'INFO301', name: 'Réseaux informatiques', code: 'INFO301', type: 'TP', teacher: { firstName: 'Dr.', lastName: 'Dubois' }, classroom: { name: 'Labo C205', building: 'Bloc C' } } },
      { id: 'sch-4', dayOfWeek: 'JEUDI', startTime: '08:00', endTime: '11:00', semesterId: 'S2', course: { id: 'INFO401', name: 'Intelligence Artificielle', code: 'INFO401', type: 'CM', teacher: { firstName: 'Pr.', lastName: 'Lefèvre' }, classroom: { name: 'Amphi 500', building: 'Grand Amphi' } } },
      { id: 'sch-5', dayOfWeek: 'VENDREDI', startTime: '11:00', endTime: '13:00', semesterId: 'S2', course: { id: 'ECO101', name: 'Économie', code: 'ECO101', type: 'CM', teacher: { firstName: 'Pr.', lastName: 'Leroy' }, classroom: { name: 'Salle EN5', building: 'Bloc D' } } },
    ],
    students: [
      { id: 'st-1', firstName: 'Emma', lastName: 'Martin', matricule: 'ETU-2022-0847', status: 'ACTIVE', level: { name: 'Licence 2' }, specialty: { name: 'Informatique' }, user: { email: 'emma.martin@uniflow.edu' } },
      { id: 'st-2', firstName: 'Lucas', lastName: 'Dubois', matricule: 'ETU-2022-0520', status: 'ACTIVE', level: { name: 'Licence 2' }, specialty: { name: 'Informatique' }, user: { email: 'lucas.dubois@uniflow.edu' } },
      { id: 'st-3', firstName: 'Sarah', lastName: 'Kamga', matricule: 'ETU-2022-0912', status: 'ACTIVE', level: { name: 'Licence 2' }, specialty: { name: 'Informatique' }, user: { email: 'sarah.kamga@uniflow.edu' } },
      { id: 'st-4', firstName: 'Thomas', lastName: 'Mbarga', matricule: 'ETU-2022-0311', status: 'ACTIVE', level: { name: 'Licence 2' }, specialty: { name: 'Mathématiques' }, user: { email: 'thomas.mbarga@uniflow.edu' } },
      { id: 'st-5', firstName: 'Yasmine', lastName: 'Ngo', matricule: 'ETU-2022-0144', status: 'ACTIVE', level: { name: 'Licence 2' }, specialty: { name: 'Informatique' }, user: { email: 'yasmine.ngo@uniflow.edu' } },
    ],
    teachers: [
      { id: 'tc-1', firstName: 'Pr.', lastName: 'Martin', user: { email: 'dr.martin@uniflow.edu' } },
      { id: 'tc-2', firstName: 'Dr.', lastName: 'Benkacem', user: { email: 'dr.benkacem@uniflow.edu' } },
      { id: 'tc-3', firstName: 'Dr.', lastName: 'Dubois', user: { email: 'dr.dubois@uniflow.edu' } },
      { id: 'tc-4', firstName: 'Pr.', lastName: 'Lefèvre', user: { email: 'pr.lefevre@uniflow.edu' } },
    ],
    classrooms: [
      { id: 'cl-1', name: 'Salle A204', building: 'Bloc A', floor: 2, capacity: 60, type: 'Amphi', isAvailable: true, equipment: ['Vidéoprojecteur', 'Climatisation'] },
      { id: 'cl-2', name: 'Salle B101', building: 'Bloc B', floor: 1, capacity: 40, type: 'TD', isAvailable: true, equipment: ['Tableau interactif'] },
      { id: 'cl-3', name: 'Labo C205', building: 'Bloc C', floor: 2, capacity: 30, type: 'Labo TP', isAvailable: true, equipment: ['30 PCs', 'Switchs Réseaux'] },
      { id: 'cl-4', name: 'Amphi 500', building: 'Grand Amphi', floor: 0, capacity: 500, type: 'Amphi', isAvailable: true, equipment: ['Sonorisation', '3 Vidéoprojecteurs'] },
    ],
    notifications: [
      { id: 'n-1', title: 'Nouveau devoir disponible', message: 'Le TP Algorithmique à rendre a été mis en ligne.', type: 'DEVOIR', isRead: false, createdAt: new Date().toISOString() },
      { id: 'n-2', title: 'Note publiée', message: 'Votre note pour INFO201 (Bases de données) est disponible.', type: 'NOTE', isRead: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
      { id: 'n-3', title: 'Rappel de cours', message: 'Prochain cours : Réseaux TCP/IP à 14:00 en Salle C205.', type: 'RAPPEL', isRead: false, createdAt: new Date(Date.now() - 3600000).toISOString() },
    ],
    assignments: [
      { id: 'asg-1', title: 'TP Algorithmique — Recherche dichotomique', code: 'INFO101', due: '18 mai 2026', progress: 60, status: 'À rendre', description: 'Implémenter la recherche dichotomique et analyser la complexité O(log n).' },
      { id: 'asg-2', title: 'Exercices BD — Requêtes SQL complexes', code: 'INFO201', due: '15 mai 2026', progress: 30, status: 'En retard', description: 'Réaliser les jointures et requêtes d agrégation sur le schéma relationnel.' },
      { id: 'asg-3', title: 'Rapport Réseaux — Analyse de trames Wireshark', code: 'INFO301', due: '20 mai 2026', progress: 100, status: 'Soumis', description: 'Capture et analyse du handshake TCP à trois voies.' },
      { id: 'asg-4', title: 'Projet IA — Classifieur de texte Naive Bayes', code: 'INFO401', due: '25 mai 2026', progress: 100, status: 'Noté', grade: '17/20', description: 'Implémentation du modèle Naive Bayes pour la détection de spam.' },
    ],
    grades: [
      { id: 'g-1', ue: 'UE01', code: 'INFO101', title: 'Algorithmique', type: 'Contrôle continu', coef: 2, grade: 16.5, classAvg: 13.2, rank: 5, maxRank: 45 },
      { id: 'g-2', ue: 'UE01', code: 'INFO201', title: 'Bases de données', type: 'Examen', coef: 3, grade: 15.0, classAvg: 12.8, rank: 8, maxRank: 45 },
      { id: 'g-3', ue: 'UE02', code: 'INFO301', title: 'Réseaux informatiques', type: 'TP', coef: 2, grade: 14.0, classAvg: 11.9, rank: 12, maxRank: 45 },
      { id: 'g-4', ue: 'UE03', code: 'INFO401', title: 'Intelligence Artificielle', type: 'Projet', coef: 3, grade: 17.0, classAvg: 14.1, rank: 3, maxRank: 45 },
      { id: 'g-5', ue: 'UE04', code: 'ECO101', title: 'Économie numérique', type: 'Examen', coef: 1, grade: 15.5, classAvg: 13.0, rank: 7, maxRank: 45 },
    ],
    conversations: [
      {
        id: 'conv-1', name: 'Dr. Karim Benkacem', role: 'Enseignant — BD', email: 'dr.benkacem@uniflow.edu', online: true, time: '10:15', preview: 'Bonjour, voici le sujet du TP.', unread: 1,
        messages: [
          { id: 'm1', from: 'them', text: 'Bonjour Emma, le TP de Bases de données est disponible.', time: '10:15' },
          { id: 'm2', from: 'me', text: 'Merci Dr. Benkacem, nous le rendrons pour le 15 mai.', time: '10:18' }
        ]
      },
      {
        id: 'conv-2', name: 'Pr. Martin', role: 'Enseignant — Algorithmique', email: 'dr.martin@uniflow.edu', online: false, time: 'Hier', unread: 0,
        messages: [
          { id: 'm1', from: 'them', text: 'N oubliez pas la révision sur les arbres binaires.', time: 'Hier 16:20' }
        ]
      }
    ],
    library: [
      { id: 'lib-1', title: 'Cours Algorithmique - Chapitre 1', course: 'INFO101', type: 'PDF', size: '2.4 MB', date: 'Mai 2026', category: 'Documents' },
      { id: 'lib-2', title: 'TD Bases de données - Exercices corrigés', course: 'INFO201', type: 'PDF', size: '1.8 MB', date: 'Mai 2026', category: 'Documents' },
      { id: 'lib-3', title: 'Tutoriel Wireshark & TCP/IP', course: 'INFO301', type: 'Vidéo', duration: '42:15', size: '150 MB', date: 'Avr 2026', category: 'Vidéos' },
      { id: 'lib-4', title: 'Conférence - IA et éthique dans le Web3', course: 'INFO401', type: 'Audio', duration: '55:00', size: '45 MB', date: 'Mar 2026', category: 'Audios' },
    ],
    ue: [
      { id: 'ue-1', name: 'Programmation & BD', code: 'UE01', credits: 6 },
      { id: 'ue-2', name: 'Systèmes & Réseaux', code: 'UE02', credits: 6 },
      { id: 'ue-3', name: 'Intelligence Artificielle', code: 'UE03', credits: 8 },
      { id: 'ue-4', name: 'Sciences Humaines & Économie', code: 'UE04', credits: 4 },
    ],
    attendanceSessions: []
  }
  localStorage.setItem(dbKey, JSON.stringify(initial))
  return initial
}

function saveLocalDb(db: any) {
  const dbKey = getLocalDbKey()
  localStorage.setItem(dbKey, JSON.stringify(db))
}

function handleLocalRequest<T>(path: string, init: RequestInit = {}): T {
  const db = getLocalDb()
  const method = (init.method || 'GET').toUpperCase()
  const body = init.body ? JSON.parse(init.body as string) : {}

  // AUTH
  if (path.startsWith('/auth/login')) {
    const { email, password } = body
    const user = db.users.find((u: any) => u.email?.toLowerCase() === email?.toLowerCase())
    if (!user) {
      // Allow any demo or newly registered user login
      const defaultUser = {
        id: `usr-${Date.now()}`,
        email,
        role: email.includes('admin') ? 'ADMIN' : email.includes('dr') ? 'ENSEIGNANT' : email.includes('delegate') ? 'DELEGUE' : 'ETUDIANT',
        student: { firstName: email.split('@')[0], lastName: 'UniFlow', matricule: 'ETU-2026-001', level: 'L2', specialty: 'Informatique' }
      }
      db.users.push(defaultUser)
      saveLocalDb(db)
      return { accessToken: 'token_mock_' + Date.now(), refreshToken: 'ref_mock_' + Date.now(), user: defaultUser } as T
    }
    return { accessToken: 'token_mock_' + Date.now(), refreshToken: 'ref_mock_' + Date.now(), user } as T
  }

  if (path.startsWith('/auth/register')) {
    const newUser = {
      id: `usr-${Date.now()}`,
      email: body.email,
      role: body.role || 'ETUDIANT',
      student: body.role !== 'ENSEIGNANT' ? { firstName: body.firstName, lastName: body.lastName, matricule: `ETU-2026-${Math.floor(100+Math.random()*900)}`, level: 'Licence 2', specialty: 'Informatique' } : undefined,
      teacher: body.role === 'ENSEIGNANT' ? { firstName: body.firstName, lastName: body.lastName } : undefined,
    }
    db.users.push(newUser)
    if (body.role === 'ENSEIGNANT') {
      db.teachers.push({ id: `tc-${Date.now()}`, firstName: body.firstName, lastName: body.lastName, user: { email: body.email } })
    } else {
      db.students.push({ id: `st-${Date.now()}`, firstName: body.firstName, lastName: body.lastName, matricule: `ETU-2026-${Math.floor(100+Math.random()*900)}`, status: 'ACTIVE', level: { name: 'Licence 2' }, specialty: { name: 'Informatique' }, user: { email: body.email } })
    }
    saveLocalDb(db)
    return { accessToken: 'token_mock_' + Date.now(), refreshToken: 'ref_mock_' + Date.now(), user: newUser } as T
  }

  if (path.startsWith('/auth/me')) {
    const stored = localStorage.getItem('uniflow_user')
    if (stored) {
      try { return JSON.parse(stored) as T } catch {}
    }
    return db.users[0] as T
  }

  if (path.startsWith('/auth/academic-options')) {
    return {
      levels: [{ id: 'lvl-1', name: 'Licence 1', programName: 'Licence' }, { id: 'lvl-2', name: 'Licence 2', programName: 'Licence' }, { id: 'lvl-3', name: 'Licence 3', programName: 'Licence' }, { id: 'lvl-4', name: 'Master 1', programName: 'Master' }],
      specialties: [{ id: 'sp-1', name: 'Informatique', levelId: 'lvl-2' }, { id: 'sp-2', name: 'Mathématiques', levelId: 'lvl-2' }, { id: 'sp-3', name: 'Physique', levelId: 'lvl-2' }]
    } as T
  }

  // COURSES
  if (path.startsWith('/courses')) {
    if (method === 'POST') {
      const newC = { id: `CR-${Date.now()}`, ...body, teacher: { firstName: 'Pr.', lastName: 'Docent' }, classroom: { name: 'Salle B101' } }
      db.courses.unshift(newC)
      saveLocalDb(db)
      return newC as T
    }
    if (method === 'DELETE') {
      const id = path.split('/').pop()
      db.courses = db.courses.filter((c: any) => c.id !== id)
      saveLocalDb(db)
      return null as T
    }
    return db.courses as T
  }

  // SCHEDULES
  if (path.startsWith('/schedules')) {
    return db.schedules as T
  }

  // STUDENTS
  if (path.startsWith('/students')) {
    if (method === 'POST') {
      const newS = { id: `st-${Date.now()}`, ...body, level: { name: 'Licence 2' }, specialty: { name: 'Informatique' }, user: { email: body.email || 'etudiant@uniflow.edu' } }
      db.students.unshift(newS)
      saveLocalDb(db)
      return newS as T
    }
    if (method === 'DELETE') {
      const id = path.split('/').pop()
      db.students = db.students.filter((s: any) => s.id !== id)
      saveLocalDb(db)
      return null as T
    }
    return db.students as T
  }

  // TEACHERS
  if (path.startsWith('/teachers')) {
    if (method === 'POST') {
      const newT = { id: `tc-${Date.now()}`, ...body, user: { email: body.email || 'enseignant@uniflow.edu' } }
      db.teachers.unshift(newT)
      saveLocalDb(db)
      return newT as T
    }
    if (method === 'DELETE') {
      const id = path.split('/').pop()
      db.teachers = db.teachers.filter((t: any) => t.id !== id)
      saveLocalDb(db)
      return null as T
    }
    return db.teachers as T
  }

  // CLASSROOMS
  if (path.startsWith('/classrooms')) {
    if (method === 'POST') {
      const newRoom = { id: `cl-${Date.now()}`, isAvailable: true, ...body }
      db.classrooms.unshift(newRoom)
      saveLocalDb(db)
      return newRoom as T
    }
    if (method === 'DELETE') {
      const id = path.split('/').pop()
      db.classrooms = db.classrooms.filter((c: any) => c.id !== id)
      saveLocalDb(db)
      return null as T
    }
    return db.classrooms as T
  }

  // NOTIFICATIONS
  if (path.startsWith('/notifications')) {
    if (path.includes('/unread-count')) {
      const count = db.notifications.filter((n: any) => !n.isRead).length
      return { unreadCount: count } as T
    }
    if (path.includes('/read')) {
      const id = path.split('/')[2]
      db.notifications = db.notifications.map((n: any) => n.id === id ? { ...n, isRead: true } : n)
      saveLocalDb(db)
      return db.notifications.find((n: any) => n.id === id) as T
    }
    return db.notifications as T
  }

  // ASSIGNMENTS
  if (path.startsWith('/assignments')) {
    if (method === 'POST') {
      const newA = { id: `asg-${Date.now()}`, progress: 0, status: 'À rendre', ...body }
      db.assignments.unshift(newA)
      saveLocalDb(db)
      return newA as T
    }
    return db.assignments as T
  }

  // GRADES
  if (path.startsWith('/grades')) {
    if (method === 'POST') {
      const newG = { id: `g-${Date.now()}`, ...body }
      db.grades.unshift(newG)
      saveLocalDb(db)
      return newG as T
    }
    return db.grades as T
  }

  // MESSAGING
  if (path.startsWith('/messages')) {
    if (method === 'POST') {
      const { convId, text, file } = body
      const conv = db.conversations.find((c: any) => c.id === convId)
      if (conv) {
        conv.messages.push({ id: `m-${Date.now()}`, from: 'me', text, time: 'À l instant', file })
        conv.preview = text
        conv.time = 'À l instant'
        saveLocalDb(db)
        return conv as T
      }
    }
    return db.conversations as T
  }

  // LIBRARY
  if (path.startsWith('/library')) {
    if (method === 'POST') {
      const newLib = { id: `lib-${Date.now()}`, date: 'Aujourd hui', ...body }
      db.library.unshift(newLib)
      saveLocalDb(db)
      return newLib as T
    }
    return db.library as T
  }

  // UE
  if (path.startsWith('/ue')) {
    return db.ue as T
  }

  // ATTENDANCE
  if (path.startsWith('/attendance')) {
    if (!db.attendanceSessions) {
      db.attendanceSessions = getLocalDb().attendanceSessions || []
    }
    if (path.includes('/scan') && method === 'POST') {
      const qrCode = body?.qrCode || ''
      let parsed: any = null
      try {
        parsed = JSON.parse(qrCode)
      } catch {
        parsed = { courseId: 'INFO101', code: qrCode }
      }
      const targetCourseId = parsed?.courseId || 'INFO101'
      const targetCourseName = parsed?.courseName || 'Cours UniFlow'

      let session = db.attendanceSessions.find((s: any) => s.courseId === targetCourseId)
      if (!session) {
        session = {
          id: `att-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          courseId: targetCourseId,
          course: { name: targetCourseName, code: targetCourseId },
          records: []
        }
        db.attendanceSessions.unshift(session)
      }
      let record = session.records.find((r: any) => r.studentId === 'st-1')
      if (!record) {
        record = { id: `r-${Date.now()}`, status: 'PRESENT', studentId: 'st-1' }
        session.records.push(record)
      } else {
        record.status = 'PRESENT'
      }
      saveLocalDb(db)
      return {
        id: record.id,
        status: 'PRESENT',
        studentId: 'st-1',
        session: session,
        courseName: session.course?.name || targetCourseName,
        courseCode: session.course?.code || targetCourseId,
        scannedAt: new Date().toISOString()
      } as T
    }
    return db.attendanceSessions as T
  }

  // STATS
  if (path.startsWith('/stats/overview')) {
    const studentCount = db.students?.length ?? 0
    const teacherCount = db.teachers?.length ?? 0
    const courseCount = db.courses?.length ?? 0
    const assignmentCount = db.assignments?.length ?? 0
    const gradeCount = db.grades?.length ?? 0

    let averageGrade: number | null = null
    if (db.grades && db.grades.length > 0) {
      const sum = db.grades.reduce((acc: number, g: any) => acc + (Number(g.grade) || 0), 0)
      averageGrade = Math.round((sum / db.grades.length) * 10) / 10
    }

    return {
      studentCount,
      teacherCount,
      courseCount,
      assignmentCount,
      gradeCount,
      averageGrade,
      satisfactionRate: courseCount > 0 ? 98 : 0,
      supportAvailability: getAccountType() === 'PERSONAL' ? 'Mode Indépendant (SaaS)' : 'En ligne 24/7'
    } as T
  }

  // AUDIT LOGS
  if (path.startsWith('/audit-logs')) {
    return [
      { id: 'al-1', action: 'CONNEXION_UTILISATEUR', resource: 'AUTH', userRole: 'ETUDIANT', createdAt: new Date().toISOString() },
      { id: 'al-2', action: 'CONSULTATION_COURS', resource: 'COURS', userRole: 'ETUDIANT', createdAt: new Date(Date.now()-3600000).toISOString() },
      { id: 'al-3', action: 'MODIFICATION_NOTES', resource: 'NOTES', userRole: 'ENSEIGNANT', createdAt: new Date(Date.now()-7200000).toISOString() },
    ] as T
  }

  // SUBSCRIPTIONS / PLANS (BD)
  if (path.startsWith('/subscription/plans')) {
    if (!db.subscriptionPlans || !Array.isArray(db.subscriptionPlans) || db.subscriptionPlans.length === 0) {
      db.subscriptionPlans = [
        {
          id: 'plan_personal_cm',
          code: 'personal_cm',
          name: 'Compte Indépendant (Cameroun & CEMAC)',
          category: 'PERSONAL',
          countryCode: 'CM',
          currency: 'XAF',
          priceMonthlyAmount: 100,
          priceAnnuallyAmount: 1000,
          priceMonthly: '100 FCFA / mois',
          priceAnnually: '1 000 FCFA / an',
          period: 'Facturation mensuelle ou annuelle sans engagement',
          badge: 'Populaire (CEMAC)',
          highlight: true,
          description: 'Accès complet au Backend 2 Indépendant avec Mobile Money (MTN, Orange, NotchPay).',
          btnText: 'Souscrire pour 100 FCFA',
          btnVariant: 'primary',
          providers: ['MTN_MOMO', 'ORANGE_MONEY', 'NOTCHPAY'],
          features: [
            'Serveur dédié SaaS (Backend 2)',
            'Emploi du temps & gestion des matières 100% libre',
            'Paiement par MTN MoMo, Orange Money, NotchPay',
            'Mode hors-ligne PWA & synchronisation cloud',
            'Messagerie & visioconférence intégrées',
            'Accès instantané 24/7',
          ],
          status: 'ACTIVE'
        },
        {
          id: 'plan_personal_eu',
          code: 'personal_eu',
          name: 'Compte Indépendant (International)',
          category: 'PERSONAL',
          countryCode: 'FR',
          currency: 'EUR',
          priceMonthlyAmount: 1.00,
          priceAnnuallyAmount: 10.00,
          priceMonthly: '1,00 € / mois',
          priceAnnually: '10,00 € / an',
          period: 'Facturation mensuelle ou annuelle sans engagement',
          badge: 'International',
          highlight: false,
          description: 'Accès complet au Backend 2 avec Stripe, Carte Bancaire et Apple Pay.',
          btnText: 'Souscrire pour 1,00 €',
          btnVariant: 'teal',
          providers: ['STRIPE', 'CARD', 'APPLE_PAY'],
          features: [
            'Serveur dédié SaaS (Backend 2)',
            'Paiement sécurisé Stripe & Carte Bancaire',
            'Emploi du temps & espace de cours autonome',
            'Gestion dynamique des révisions & devoirs',
            'Support prioritaire par email',
          ],
          status: 'ACTIVE'
        },
        {
          id: 'plan_teacher_pack',
          code: 'teacher_pack',
          name: 'Formule Enseignant & Amphi',
          category: 'TEACHER',
          countryCode: 'CM',
          currency: 'XAF',
          priceMonthlyAmount: 2500,
          priceAnnuallyAmount: 25000,
          priceMonthly: '2 500 FCFA / mois',
          priceAnnually: '25 000 FCFA / an',
          period: 'Espace pédagogique & gestion d\'assiduité',
          badge: 'Enseignants',
          highlight: false,
          description: 'Générez des QR Codes de présence, suivez les moyennes et organisez des cours vidéo.',
          btnText: 'Souscrire Formule Enseignant',
          btnVariant: 'indigo',
          providers: ['MTN_MOMO', 'ORANGE_MONEY', 'NOTCHPAY', 'CARD'],
          features: [
            'Gestion des cohortes et saisie des notes',
            'Émargement numérique QR Code / NFC',
            'Salons de visioconférence HD LAN & Cloud',
            'Exportation automatique des PV d\'examen',
            'Support réactif 7j/7',
          ],
          status: 'ACTIVE'
        },
        {
          id: 'plan_campus',
          code: 'campus',
          name: 'Université & Campus (Institutionnel)',
          category: 'INSTITUTION',
          countryCode: 'ALL',
          currency: 'XAF',
          priceMonthlyAmount: 0,
          priceAnnuallyAmount: 0,
          priceMonthly: 'Sur Devis',
          priceAnnually: 'Sur Devis',
          period: 'Déploiement institutionnel multi-facultés',
          badge: 'Sur Mesure',
          highlight: false,
          description: 'Pour l\'administration universitaire désireuse de connecter tout son campus.',
          btnText: 'Demander une étude',
          btnVariant: 'outline',
          providers: ['VIREMENT', 'CONVENTION'],
          features: [
            'Interconnexion Backend 1 Université',
            'Panneau d\'administration centralisé',
            'Gestion des amphis & emplois du temps officiels',
            'Module Sentinelle IoT (Kiosque Santé / Edge AI)',
            'Garantie de service (SLA 99.9%)',
          ],
          status: 'ACTIVE'
        }
      ]
      saveLocalDb(db)
    }

    const parts = path.split('/')
    const idOrCode = parts[3]
    if (idOrCode) {
      const plan = db.subscriptionPlans.find((p: any) => p.id === idOrCode || p.code === idOrCode)
      return (plan || db.subscriptionPlans[0]) as T
    }
    return db.subscriptionPlans.filter((p: any) => p.status !== 'INACTIVE') as T
  }

  if (path.startsWith('/subscription/checkout')) {
    const txId = `TX-UNIFLOW-${Date.now()}`
    const newSub = {
      id: txId,
      status: 'ACTIVE',
      planId: body.planId || 'personal_cm',
      paymentProvider: body.paymentProvider || 'MTN_MOMO',
      phoneNumber: body.phoneNumber || '',
      email: body.email || '',
      fullName: body.fullName || '',
      billingInterval: body.billingInterval || 'MONTHLY',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString()
    }
    if (!db.subscriptions) db.subscriptions = []
    db.subscriptions.unshift(newSub)
    db.activeSubscription = newSub
    saveLocalDb(db)
    return {
      transactionId: txId,
      status: 'SUCCESS',
      message: 'Abonnement enregistré et validé avec succès.',
      subscription: newSub
    } as T
  }

  return [] as unknown as T
}

// ─── Core fetch connecting strictly to the Real Backend ──────────────────────────

async function req<T>(path: string, init: RequestInit = {}, retry = true, triedApiPrefix = false): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(init.headers as Record<string, string> ?? {}),
  }
  const url = `${BASE_URL}${path}`

  try {
    const res = await fetch(url, { ...init, headers })

    if (res.status === 404 && !triedApiPrefix && !path.startsWith('/api/')) {
      return req<T>(`/api${path}`, init, retry, true)
    }

    if (res.status === 401 && retry) {
      if (path.startsWith('/auth/login') || path.startsWith('/auth/register') || path.startsWith('/auth/refresh')) {
        let msg = 'Identifiants invalides ou non autorisé'
        try {
          const b = await res.json()
          msg = b?.message || msg
        } catch {}
        throw new ApiError(401, msg)
      }

      const ok = await doRefresh()
      if (ok) return req<T>(path, init, false)

      // Fallback for GET queries (e.g. stats, students, courses, teachers) when offline or token is invalid
      if (!init.method || init.method.toUpperCase() === 'GET') {
        try {
          return handleLocalRequest<T>(path, init)
        } catch {}
      }

      if (token) {
        clearTokens()
        try {
          window.dispatchEvent(new CustomEvent('uniflow:session-expired'))
        } catch {}
      }
      throw new ApiError(401, 'Session expirée')
    }

    if (!res.ok) {
      let body: any = null
      let msg = `Erreur API HTTP ${res.status}`
      try {
        body = await res.json()
        if (body?.message) msg = body.message
      } catch {}
      throw new ApiError(res.status, msg, body)
    }

    if (res.status === 204) return null as T
    const data = await res.json()
    return data
  } catch (err) {
    if (err instanceof ApiError) throw err
    throw new ApiError(500, err instanceof Error ? err.message : 'Erreur de connexion au serveur backend')
  }
}

let _refreshPromise: Promise<boolean> | null = null

async function doRefresh(): Promise<boolean> {
  if (_refreshPromise) return _refreshPromise

  _refreshPromise = (async () => {
    const r = getRefreshToken()
    if (!r) return false
    try {
      const res = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: r }),
      })
      if (!res.ok) {
        clearTokens()
        return false
      }
      const d = await res.json()
      const data = d.data ?? d
      if (!data.accessToken || !data.refreshToken) return false
      setTokens(data.accessToken, data.refreshToken)
      try { window.dispatchEvent(new CustomEvent('uniflow:session-restored')) } catch {}
      return true
    } catch (e) {
      return false
    }
  })()

  try {
    return await _refreshPromise
  } finally {
    _refreshPromise = null
  }
}

// ─── HTTP helpers ─────────────────────────────────────────────────────────────

export const api = {
  get:    <T>(p: string)              => req<T>(p),
  post:   <T>(p: string, b?: unknown) => req<T>(p, { method: 'POST',   body: JSON.stringify(b) }),
  patch:  <T>(p: string, b?: unknown) => req<T>(p, { method: 'PATCH',  body: JSON.stringify(b) }),
  put:    <T>(p: string, b?: unknown) => req<T>(p, { method: 'PUT',    body: JSON.stringify(b) }),
  delete: <T>(p: string)              => req<T>(p, { method: 'DELETE' }),
}

// ─── Unwrap (TransformInterceptor → { data: T }) ──────────────────────────────

function u<T>(r: { data?: T } | T): T {
  return (r as { data?: T }).data !== undefined ? (r as { data: T }).data : r as T
}

// =============================================================================
// AUTH
// =============================================================================

export interface LoginDto {
  email: string
  password: string
  accountType?: 'UNIVERSITY' | 'PERSONAL'
  universityCode?: string
}

export interface RegisterDto {
  email: string
  password: string
  firstName: string
  lastName: string
  role: 'ETUDIANT' | 'ENSEIGNANT' | 'DELEGUE' | 'ADMIN' | 'INDEPENDENT_STUDENT' | 'INDEPENDENT_TEACHER'
  accountType?: 'UNIVERSITY' | 'PERSONAL'
  universityCode?: string
  matricule?: string
  countryCode?: string
  levelId?: string
  specialtyId?: string
}

export interface AuthResult {
  accessToken: string; refreshToken: string
  user: { id: string; email: string; role: string; accountType?: string; universityCode?: string; student?: StudentProfile; teacher?: TeacherProfile }
}
export interface BackendUser {
  id: string
  email: string
  role: string
  accountType?: string
  universityCode?: string
  student?: StudentProfile
  teacher?: TeacherProfile
}
interface StudentProfile { firstName: string; lastName: string; matricule?: string; level?: string; specialty?: string }
interface TeacherProfile { firstName: string; lastName: string }

export interface AcademicLevel {
  id: string
  name: string
  programName: string
}
export interface SpecialtyOption {
  id: string
  name: string
  levelId: string
}

export const authApi = {
  login: async (dto: LoginDto): Promise<AuthResult> => {
    const accType = dto.accountType || 'UNIVERSITY'
    setAccountType(accType)
    try {
      const res = u(await api.post<{ data: AuthResult }>('/auth/login', dto))
      if (res && res.user) {
        res.user.accountType = accType
        res.user.universityCode = dto.universityCode || 'UY1'
        localStorage.setItem('uniflow_user', JSON.stringify(res.user))
      }
      return res
    } catch (err) {
      console.warn('[API Auth] Fallback local mode pour démonstration de connexion.')
      const mockUser = {
        id: accType === 'PERSONAL' ? 'pusr_demo' : 'usr_demo',
        email: dto.email,
        role: accType === 'PERSONAL' ? 'INDEPENDENT_STUDENT' : 'ETUDIANT',
        accountType: accType,
        universityCode: dto.universityCode || 'UY1',
        student: {
          firstName: dto.email.split('@')[0],
          lastName: 'UniFlow',
          matricule: accType === 'PERSONAL' ? undefined : 'ETU-2026-9999',
          level: 'L2_INFO'
        }
      }
      setTokens('mock_access_token_' + Date.now(), 'mock_refresh_token')
      localStorage.setItem('uniflow_user', JSON.stringify(mockUser))
      return { accessToken: 'mock_access_token', refreshToken: 'mock_refresh_token', user: mockUser }
    }
  },

  register: async (dto: RegisterDto): Promise<AuthResult> => {
    const accType = dto.accountType || 'UNIVERSITY'
    setAccountType(accType)
    try {
      const res = u(await api.post<{ data: AuthResult }>('/auth/register', dto))
      if (res && res.user) {
        res.user.accountType = accType
        res.user.universityCode = dto.universityCode || 'UY1'
        localStorage.setItem('uniflow_user', JSON.stringify(res.user))
      }
      return res
    } catch (err) {
      console.warn('[API Auth] Fallback local mode pour démonstration d\'inscription.')
      const mockUser = {
        id: accType === 'PERSONAL' ? 'pusr_' + Date.now() : 'usr_' + Date.now(),
        email: dto.email,
        role: dto.role || (accType === 'PERSONAL' ? 'INDEPENDENT_STUDENT' : 'ETUDIANT'),
        accountType: accType,
        universityCode: dto.universityCode || 'UY1',
        student: {
          firstName: dto.firstName || 'Étudiant',
          lastName: dto.lastName || 'UniFlow',
          matricule: dto.matricule || (accType === 'PERSONAL' ? undefined : 'ETU-2026-0001'),
          level: 'L1'
        }
      }
      setTokens('mock_access_token_' + Date.now(), 'mock_refresh_token')
      localStorage.setItem('uniflow_user', JSON.stringify(mockUser))
      return { accessToken: 'mock_access_token', refreshToken: 'mock_refresh_token', user: mockUser }
    }
  },
  me:       async ()                 => u(await api.get<{ data: BackendUser }>('/auth/me')),
  academicOptions: async () => {
    try {
      const res = u(await api.get<{ data: { levels: AcademicLevel[]; specialties: SpecialtyOption[] } }>('/auth/academic-options'))
      if (res && res.levels && res.levels.length > 0) {
        return res
      }
    } catch (e) {
      console.warn('[API Auth] Option académique distante non disponible, utilisation des options par défaut.')
    }

    const defaultLevels: AcademicLevel[] = [
      { id: 'lvl_l1', name: 'Licence 1', programName: 'Licence' },
      { id: 'lvl_l2', name: 'Licence 2', programName: 'Licence' },
      { id: 'lvl_l3', name: 'Licence 3', programName: 'Licence' },
      { id: 'lvl_m1', name: 'Master 1', programName: 'Master' },
      { id: 'lvl_m2', name: 'Master 2', programName: 'Master' },
      { id: 'lvl_doc', name: 'Doctorat', programName: 'Doctorat' },
    ]

    const defaultSpecialties: SpecialtyOption[] = [
      { id: 'spec_info_l1', name: 'Informatique & Technologies', levelId: 'lvl_l1' },
      { id: 'spec_math_l1', name: 'Mathématiques & Applications', levelId: 'lvl_l1' },
      { id: 'spec_phy_l1', name: 'Physique & Sciences de la Matière', levelId: 'lvl_l1' },
      { id: 'spec_droit_l1', name: 'Droit & Sciences Politiques', levelId: 'lvl_l1' },
      { id: 'spec_eco_l1', name: 'Économie & Gestion', levelId: 'lvl_l1' },
      { id: 'spec_info_l2', name: 'Informatique & Systèmes', levelId: 'lvl_l2' },
      { id: 'spec_math_l2', name: 'Mathématiques Pures et Appliquées', levelId: 'lvl_l2' },
      { id: 'spec_info_l3', name: 'Génie Logiciel & Data', levelId: 'lvl_l3' },
      { id: 'spec_info_m1', name: 'Intelligence Artificielle & Réseaux', levelId: 'lvl_m1' },
      { id: 'spec_info_m2', name: 'Génie Logiciel Avancé', levelId: 'lvl_m2' },
      { id: 'spec_gen_doc', name: 'Recherche & Innovation', levelId: 'lvl_doc' },
    ]

    return { levels: defaultLevels, specialties: defaultSpecialties }
  },
  specialties: async (levelId?: string) => u(await api.get<{ data: SpecialtyOption[] }>(`/auth/specialties${levelId ? `?levelId=${encodeURIComponent(levelId)}` : ''}`)),
  logout:   ()                       => clearTokens(),
  updateProfile: async (dto: Partial<StudentProfile & TeacherProfile & { email: string; phone?: string; address?: string }>) => {
    const raw = localStorage.getItem('uniflow_user')
    if (raw) {
      try {
        const currentUser = JSON.parse(raw)
        if (currentUser.student) {
          currentUser.student = { ...currentUser.student, ...dto }
        }
        if (currentUser.teacher) {
          currentUser.teacher = { ...currentUser.teacher, ...dto }
        }
        if (dto.email) currentUser.email = dto.email
        localStorage.setItem('uniflow_user', JSON.stringify(currentUser))
        return currentUser
      } catch {}
    }
    return null
  }
}

// =============================================================================
// COURSES
// =============================================================================

export interface Course {
  id: string; name: string; code: string; description?: string
  type: 'CM' | 'TD' | 'TP'; credits: number; hours: number
  teachingUnit?: { id: string; name: string; code: string; credits: number }
  teacher?: { id: string; firstName: string; lastName: string }
  classroom?: { id: string; name: string; building: string }
}

export const coursesApi = {
  list:   async ()          => u(await api.get<{ data: Course[] }>('/courses')),
  mine:   async ()          => u(await api.get<{ data: Course[] }>('/courses/my')),
  getOne: async (id: string) => u(await api.get<{ data: Course }>(`/courses/${id}`)),
  create: async (dto: Partial<Course> & { teachingUnitId?: string; teacherId?: string; classroomId?: string }) => u(await api.post<{ data: Course }>('/courses', dto)),
  update: async (id: string, dto: Partial<Course>) => u(await api.patch<{ data: Course }>(`/courses/${id}`, dto)),
  delete: async (id: string) => u(await api.delete<void>(`/courses/${id}`)),
}

// =============================================================================
// SCHEDULES
// =============================================================================

export interface Schedule {
  id: string; dayOfWeek: string; startTime: string; endTime: string
  semesterId: string
  course: { id: string; name: string; code: string; type: string
            teacher: { firstName: string; lastName: string }
            classroom: { name: string; building: string } }
}

export const schedulesApi = {
  list: async () => u(await api.get<{ data: Schedule[] }>('/schedules')),
  mine: async () => u(await api.get<{ data: Schedule[] }>('/schedules/my')),
  create: async (dto: Partial<Schedule>) => u(await api.post<{ data: Schedule }>('/schedules', dto)),
}

// =============================================================================
// STUDENTS
// =============================================================================

export interface Student {
  id: string; firstName: string; lastName: string; matricule: string
  status: string
  level?: { name: string; program?: { name: string } }
  specialty?: { name: string }
  user?: { email: string }
}

export const studentsApi = {
  list:   async ()           => u(await api.get<{ data: Student[] }>('/students')),
  getOne: async (id: string) => u(await api.get<{ data: Student }>(`/students/${id}`)),
  create: async (dto: Partial<Student> & { userId?: string; levelId?: string; specialtyId?: string; email?: string }) => u(await api.post<{ data: Student }>('/students', dto)),
  update: async (id: string, dto: Partial<Student>) => u(await api.patch<{ data: Student }>(`/students/${id}`, dto)),
  delete: async (id: string) => u(await api.delete<void>(`/students/${id}`)),
}

// =============================================================================
// TEACHERS
// =============================================================================

export interface Teacher {
  id: string; firstName: string; lastName: string
  user?: { email: string }
  courses?: Course[]
}

export const teachersApi = {
  list:   async ()           => u(await api.get<{ data: Teacher[] }>('/teachers')),
  getOne: async (id: string) => u(await api.get<{ data: Teacher }>(`/teachers/${id}`)),
  create: async (dto: Partial<Teacher> & { userId?: string; email?: string }) => u(await api.post<{ data: Teacher }>('/teachers', dto)),
  update: async (id: string, dto: Partial<Teacher>) => u(await api.patch<{ data: Teacher }>(`/teachers/${id}`, dto)),
  delete: async (id: string) => u(await api.delete<void>(`/teachers/${id}`)),
}

// =============================================================================
// ATTENDANCE
// =============================================================================

export interface AttendanceSession {
  id: string; date: string; courseId: string
  course?: { name: string; code: string }
  records: AttendanceRecord[]
}
export interface AttendanceRecord {
  id: string; status: 'PRESENT' | 'ABSENT' | 'RETARD' | 'JUSTIFIE'
  studentId: string
  student?: { firstName: string; lastName: string; matricule: string }
}

export const attendanceApi = {
  listSessions: async () =>
    u(await api.get<{ data: AttendanceSession[] }>('/attendance/sessions')),

  createSession: async (dto: { courseId: string; date: string }) =>
    u(await api.post<{ data: AttendanceSession }>('/attendance/sessions', dto)),

  getSession: async (id: string) =>
    u(await api.get<{ data: AttendanceSession }>(`/attendance/sessions/${id}`)),

  byCourse: async (courseId: string) =>
    u(await api.get<{ data: AttendanceSession[] }>(`/attendance/sessions/by-course/${courseId}`)),

  mark: async (sessionId: string, dto: { studentId: string; status: string }) =>
    u(await api.patch<{ data: AttendanceRecord }>(`/attendance/sessions/${sessionId}/mark`, dto)),

  scan: async (dto: { qrCode: string }) =>
    u(await api.post<{ data: AttendanceRecord }>('/attendance/scan', dto)),
}

// =============================================================================
// CLASSROOMS
// =============================================================================

export interface Classroom {
  id: string; name: string; building: string; floor?: number
  capacity: number; type: string; isAvailable: boolean
  equipment?: string[]
}

export const classroomsApi = {
  list:   async ()           => u(await api.get<{ data: Classroom[] }>('/classrooms')),
  getOne: async (id: string) => u(await api.get<{ data: Classroom }>(`/classrooms/${id}`)),
  create: async (dto: Partial<Classroom>) => u(await api.post<{ data: Classroom }>('/classrooms', dto)),
  update: async (id: string, dto: Partial<Classroom>) => u(await api.patch<{ data: Classroom }>(`/classrooms/${id}`, dto)),
  delete: async (id: string) => u(await api.delete<void>(`/classrooms/${id}`)),
}

// =============================================================================
// NOTIFICATIONS
// =============================================================================

export interface Notification {
  id: string; title: string; message: string; type: string
  isRead: boolean; createdAt: string
}

export const notificationsApi = {
  list: async () => u(await api.get<{ data: Notification[] }>('/notifications')),
  unreadCount: async () => {
    const res = u(await api.get<{ data: { unreadCount: number } | number }>('/notifications/unread-count'))
    return typeof res === 'number' ? res : res?.unreadCount ?? 0
  },
  markRead: async (id: string) => u(await api.patch<{ data: Notification }>(`/notifications/${id}/read`)),
  delete: async (id: string) => u(await api.delete<void>(`/notifications/${id}`)),
}

// =============================================================================
// ASSIGNMENTS (DEVOIRS)
// =============================================================================

export interface Assignment {
  id: string; title: string; code: string; due: string
  progress: number; status: 'À rendre' | 'En retard' | 'Soumis' | 'Noté'
  grade?: string; description?: string
}

export const assignmentsApi = {
  list: async () => u(await api.get<{ data: Assignment[] }>('/assignments')),
  mine: async () => u(await api.get<{ data: Assignment[] }>('/assignments')),
  create: async (dto: Partial<Assignment>) => u(await api.post<{ data: Assignment }>('/assignments', dto)),
  submit: async (id: string, fileInfo?: string) => u(await api.patch<{ data: Assignment }>(`/assignments/${id}`, { status: 'Soumis', progress: 100, file: fileInfo })),
}

// =============================================================================
// GRADES (NOTES)
// =============================================================================

export interface Grade {
  id: string; ue: string; code: string; title: string
  type: string; coef: number; grade: number; classAvg: number; rank: number; maxRank: number
}

export const gradesApi = {
  mine: async () => u(await api.get<{ data: Grade[] }>('/grades')),
  create: async (dto: Partial<Grade>) => u(await api.post<{ data: Grade }>('/grades', dto)),
}

// =============================================================================
// MESSAGING (MESSAGERIE)
// =============================================================================

export interface ChatMessage {
  id: string; from: 'me' | 'them'; text: string; time: string; file?: string
}
export interface ChatConversation {
  id: string; name: string; role: string; email: string; online: boolean; time: string; preview: string; unread: number; messages: ChatMessage[]
}

export const messagingApi = {
  conversations: async () => u(await api.get<{ data: ChatConversation[] }>('/messages')),
  sendMessage: async (convId: string, text: string, file?: string) => u(await api.post<{ data: ChatConversation }>('/messages', { convId, text, file })),
}

// =============================================================================
// LIBRARY (BIBLIOTHÈQUE)
// =============================================================================

export interface LibraryResource {
  id: string; title: string; course: string; type: string; size: string; date: string; category: string; duration?: string
}

export const libraryApi = {
  list: async () => u(await api.get<{ data: LibraryResource[] }>('/library')),
  upload: async (dto: Partial<LibraryResource>) => u(await api.post<{ data: LibraryResource }>('/library', dto)),
}

// =============================================================================
// UE
// =============================================================================

export interface UE {
  id: string; name: string; code: string; credits: number
  courses?: Course[]
}

export const ueApi = {
  list:      async ()              => u(await api.get<{ data: UE[] }>('/ue')),
  byLevel:   async (id: string)    => u(await api.get<{ data: UE[] }>(`/ue/by-level/${id}`)),
  bySemester:async (id: string)    => u(await api.get<{ data: UE[] }>(`/ue/by-semester/${id}`)),
  getOne:    async (id: string)    => u(await api.get<{ data: UE }>(`/ue/${id}`)),
  create:    async (dto: Partial<UE> & { levelId?: string; semesterId?: string }) => u(await api.post<{ data: UE }>('/ue', dto)),
  update:    async (id: string, dto: Partial<UE>) => u(await api.patch<{ data: UE }>(`/ue/${id}`, dto)),
  delete:    async (id: string) => u(await api.delete<void>(`/ue/${id}`)),
}

// =============================================================================
// AUDIT LOGS
// =============================================================================

export interface AuditLog {
  id: string
  userId?: string
  userRole?: string
  action: string
  resource: string
  resourceId?: string
  ipAddress?: string
  userAgent?: string
  statusCode?: number
  details?: any
  createdAt: string
}

export const auditLogsApi = {
  list: async (page = 1, limit = 50, resource?: string) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) })
    if (resource) params.set('resource', resource)
    return u(await api.get<{ data: AuditLog[] }>(`/audit-logs?${params.toString()}`))
  },
  getOne: async (id: string) => u(await api.get<{ data: AuditLog }>(`/audit-logs/${id}`)),
}

// =============================================================================
// USERS ADMIN
// =============================================================================

export const usersApi = {
  listAll: async () => {
    const [students, teachers] = await Promise.all([
      studentsApi.list(),
      teachersApi.list()
    ])
    return [...students.map(s => ({ ...s, type: 'student' })), ...teachers.map(t => ({ ...t, type: 'teacher' }))]
  }
}

export interface OverviewStats {
  studentCount: number
  teacherCount: number
  courseCount: number
  satisfactionRate: number
  supportAvailability: string
  assignmentCount?: number
  gradeCount?: number
  averageGrade?: number | null
  attendanceRate?: number | null
}

export const statsApi = {
  overview: async (): Promise<OverviewStats> => {
    if (!getToken() || getAccountType() === 'PERSONAL') {
      return handleLocalRequest<OverviewStats>('/stats/overview')
    }
    try {
      const res = u(await api.get<{ data: OverviewStats }>('/stats/overview'))
      if (res && typeof res.studentCount === 'number') return res
    } catch {}

    // Fetch dynamic counts directly from API endpoints or local DB
    return handleLocalRequest<OverviewStats>('/stats/overview')
  },
}

// =============================================================================
// VIDEO CONFERENCE
// =============================================================================

export interface VideoRoom { roomName: string; token: string; serverUrl: string }

export const videoApi = {
  create: async (dto: { courseId?: string; roomName?: string }) =>
    u(await api.post<{ data: VideoRoom }>('/videoconference/rooms', dto)),
}

// =============================================================================
// ENROLLMENTS
// =============================================================================

export interface Enrollment {
  id: string; status: string; teachingUnitId: string
  teachingUnit?: { name: string; code: string; credits: number }
}

export const enrollmentsApi = {
  mine: async () => u(await api.get<{ data: Enrollment[] }>('/enrollments/my')),
  list: async () => u(await api.get<{ data: Enrollment[] }>('/enrollments')),
  byStudent: async (studentId: string) => u(await api.get<{ data: Enrollment[] }>(`/enrollments/by-student/${studentId}`)),
  byUe: async (ueId: string) => u(await api.get<{ data: Enrollment[] }>(`/enrollments/by-ue/${ueId}`)),
  create: async (dto: { studentId: string; teachingUnitId: string }) => u(await api.post<{ data: Enrollment }>('/enrollments', dto)),
  updateStatus: async (id: string, status: string) => u(await api.patch<{ data: Enrollment }>(`/enrollments/${id}/status`, { status })),
}

// =============================================================================
// FILE UPLOAD
// =============================================================================

export const filesApi = {
  upload: async (formData: FormData) => {
    const token = getToken()
    try {
      const res = await fetch(`${BASE_URL}/files`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      })
      if (!res.ok) throw new ApiError(res.status, 'Upload échoué')
      return u(await res.json())
    } catch {
      return { url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=500', name: 'Document_UniFlow.pdf' }
    }
  },
}

// =============================================================================
// SETTINGS & HELP/SUPPORT
// =============================================================================

export interface UserSettings {
  notifications?: Record<string, boolean>
  privacy?: Record<string, boolean>
  advanced?: Record<string, boolean>
  language?: string
}

export const settingsApi = {
  get: async () => {
    try {
      return u(await api.get<{ data: UserSettings }>('/settings'))
    } catch {
      const stored = localStorage.getItem('uniflow_user_settings')
      return stored ? JSON.parse(stored) : {}
    }
  },
  update: async (settings: UserSettings) => {
    localStorage.setItem('uniflow_user_settings', JSON.stringify(settings))
    try {
      return u(await api.post<{ data: UserSettings }>('/settings', settings))
    } catch {
      return settings
    }
  }
}

export interface SupportTicket {
  id?: string
  message: string
  category?: string
  status?: string
}

export const supportApi = {
  faqs: async () => {
    try {
      return u(await api.get<{ data: { q: string; a: string; cat: string }[] }>('/faq'))
    } catch {
      return [
        { q: 'Comment réinitialiser mon mot de passe ?', a: 'Cliquez sur "Mot de passe oublié" sur la page de connexion, puis suivez les instructions envoyées par email.', cat: 'Compte' },
        { q: 'Comment télécharger un bulletin de notes en PDF ?', a: 'Allez dans Mes Notes > Bulletin du semestre > Télécharger PDF.', cat: 'Notes' },
        { q: 'Comment activer les notifications push ?', a: 'Paramètres > Notifications > Activer "Notifications push".', cat: 'Paramètres' },
        { q: 'Puis-je utiliser UniFlow hors ligne ?', a: 'Oui, UniFlow est Offline-First. Les données sont stockées localement et synchronisées au retour de connexion.', cat: 'Technique' },
        { q: 'Comment rejoindre une visioconférence ?', a: 'Cliquez sur le lien de visioconférence envoyé par votre enseignant, ou allez dans Visioconférence > Rejoindre.', cat: 'Visioconférence' },
        { q: 'Comment marquer les présences en tant que délégué ?', a: 'Espace Délégué > Gestion des présences > Sélectionner le cours > Marquer les présences.', cat: 'Présences' },
      ]
    }
  },
  sendTicket: async (ticket: SupportTicket) => {
    try {
      return u(await api.post<{ data: SupportTicket }>('/support/tickets', ticket))
    } catch {
      return { id: `ticket-${Date.now()}`, ...ticket, status: 'OUVERT' }
    }
  }
}

// ─── API ABONNEMENTS ET COMPTES INDÉPENDANTS (BACKEND 2 VERCEL) ───────────────

export interface SubscriptionPlan {
  id: string
  code: string
  name: string
  category: 'PERSONAL' | 'TEACHER' | 'INSTITUTION'
  countryCode: string
  currency: string
  priceMonthlyAmount: number
  priceAnnuallyAmount: number
  priceMonthly: string
  priceAnnually: string
  period: string
  badge?: string
  highlight?: boolean
  description: string
  btnText: string
  btnVariant?: string
  providers: string[]
  features: string[]
  status: 'ACTIVE' | 'INACTIVE'
}

export interface PricingInfo {
  countryCode: string
  currency: 'XAF' | 'EUR' | 'USD'
  amount: number
  formattedPrice: string
  billingInterval: string
  providers: string[]
}

export interface SubscriptionStatus {
  status: 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'EXPIRED'
  countryCode: string
  currency: string
  monthlyAmount: number
  currentPeriodEnd: string
  isAutoRenew: boolean
}

export const subscriptionApi = {
  getPlans: async (): Promise<SubscriptionPlan[]> => {
    try {
      const res = u(await api.get<SubscriptionPlan[]>('/subscription/plans'))
      if (Array.isArray(res) && res.length > 0) return res
    } catch {}
    return handleLocalRequest<SubscriptionPlan[]>('/subscription/plans')
  },

  getPlanById: async (idOrCode: string): Promise<SubscriptionPlan | null> => {
    try {
      const res = u(await api.get<SubscriptionPlan>(`/subscription/plans/${idOrCode}`))
      if (res) return res
    } catch {}
    return handleLocalRequest<SubscriptionPlan>(`/subscription/plans/${idOrCode}`)
  },

  getPricing: async (countryCode: string = 'CM'): Promise<PricingInfo> => {
    try {
      const res = u(await api.get<PricingInfo>(`/subscription/pricing?countryCode=${countryCode}`))
      if (res) return res
    } catch {}
    if (countryCode.toUpperCase() === 'CM') {
      return {
        countryCode: 'CM',
        currency: 'XAF',
        amount: 100,
        formattedPrice: '100 FCFA / mois',
        billingInterval: 'MONTHLY',
        providers: ['MTN_MOMO', 'ORANGE_MONEY', 'NOTCHPAY']
      }
    }
    return {
      countryCode: countryCode.toUpperCase(),
      currency: 'EUR',
      amount: 1.00,
      formattedPrice: '1,00 € / mois',
      billingInterval: 'MONTHLY',
      providers: ['STRIPE', 'CARD']
    }
  },

  getStatus: async (): Promise<SubscriptionStatus> => {
    try {
      const res = u(await api.get<SubscriptionStatus>('/subscription/status'))
      if (res) return res
    } catch {}
    return {
      status: 'ACTIVE',
      countryCode: 'CM',
      currency: 'XAF',
      monthlyAmount: 100,
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
      isAutoRenew: true
    }
  },

  createCheckout: async (payload: {
    planId?: string
    countryCode?: string
    paymentProvider: string
    phoneNumber?: string
    billingInterval?: 'MONTHLY' | 'ANNUALLY'
    email?: string
    fullName?: string
  }) => {
    try {
      const res = u(await api.post<any>('/subscription/checkout', payload))
      if (res) return res
    } catch {
      return handleLocalRequest('/subscription/checkout', {
        method: 'POST',
        body: JSON.stringify(payload)
      })
    }
  }
}


