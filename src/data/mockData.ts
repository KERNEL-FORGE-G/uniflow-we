// ─── USERS ─────────────────────────────────────────────────────────────────
export const mockUsers = {
  student: {
    id: 'ETU-2022-0847',
    name: 'Emma Martin',
    email: 'emma.martin@uniflow.edu',
    phone: '+237 6 12 34 56 78',
    role: 'Étudiante',
    filiere: 'Informatique',
    niveau: 'Licence 2',
    birthdate: '15 mars 2003',
    address: 'Yaoundé, Cameroun',
    inscription: '12 septembre 2023',
    avatar: undefined as string | undefined,
    status: 'En ligne' as const,
  },
  delegate: {
    id: 'ETU-2022-0520',
    name: 'Lucas Dubois',
    email: 'lucas.dubois@uniflow.edu',
    phone: '+237 6 55 44 33 22',
    role: 'Délégué',
    filiere: 'Informatique',
    niveau: 'Licence 2',
    birthdate: '3 juin 2002',
    address: 'Yaoundé, Cameroun',
    inscription: '12 septembre 2023',
    avatar: undefined as string | undefined,
    status: 'En ligne' as const,
  },
  teacher: {
    id: 'ENS-2018-0042',
    name: 'Dr. Martin',
    email: 'dr.martin@uniflow.edu',
    phone: '+237 6 78 90 12 34',
    role: 'Enseignant',
    filiere: 'Informatique',
    niveau: 'L2 / L3',
    birthdate: '20 avril 1978',
    address: 'Yaoundé, Cameroun',
    inscription: '1er septembre 2018',
    avatar: undefined as string | undefined,
    status: 'En ligne' as const,
  },
}

// ─── COURSES ────────────────────────────────────────────────────────────────
export const mockCourses = [
  { id: 'INFO101', code: 'INFO101', title: 'Algorithmique', teacher: 'Pr. Martin', semester: 'Semestre 2', progress: 75, color: 'from-blue-600 to-blue-800', enrolled: 45, credits: 3, type: 'CM', status: 'En cours' as const },
  { id: 'INFO201', code: 'INFO201', title: 'Bases de données — Informatique', teacher: 'Dr. Benkacem', semester: 'Semestre 2', progress: 60, color: 'from-teal-600 to-teal-800', enrolled: 38, credits: 3, type: 'CM+TD', status: 'En cours' as const },
  { id: 'INFO301', code: 'INFO301', title: 'Réseaux informatiques', teacher: 'Dr. Dubois', semester: 'Semestre 2', progress: 45, color: 'from-purple-600 to-purple-800', enrolled: 52, credits: 3, type: 'CM+TP', status: 'En cours' as const },
  { id: 'INFO401', code: 'INFO401', title: 'Intelligence Artificielle', teacher: 'Pr. Lefèvre', semester: 'Semestre 4', progress: 80, color: 'from-indigo-600 to-indigo-800', enrolled: 41, credits: 4, type: 'CM', status: 'En cours' as const },
  { id: 'ECO101', code: 'ECO101', title: 'Économie', teacher: 'Pr. Leroy', semester: 'Semestre 1', progress: 55, color: 'from-orange-500 to-orange-700', enrolled: 120, credits: 2, type: 'CM', status: 'En cours' as const },
  { id: 'PHIL101', code: 'PHIL101', title: 'Philosophie', teacher: 'Pr. Bernard', semester: 'Semestre 1', progress: 30, color: 'from-emerald-600 to-emerald-800', enrolled: 34, credits: 2, type: 'CM', status: 'À venir' as const },
]

export const mockTeacherCourses = [
  { id: 'INFO101', code: 'INFO101', title: 'Algorithmique L2', students: 45, hours: '40h CM + 20h TD', progress: 90, color: 'from-blue-600 to-blue-800', room: 'Salle A204', schedule: '08:00 - 10:00' },
  { id: 'INFO201', code: 'INFO201', title: 'Bases de données L2', students: 38, hours: '30h CM + 15h TD', progress: 78, color: 'from-teal-600 to-teal-800', room: 'Salle B101', schedule: '14:00 - 16:00' },
  { id: 'INFO301', code: 'INFO301', title: 'Réseaux L3', students: 52, hours: '25h CM + 15h TP', progress: 60, color: 'from-purple-600 to-purple-800', room: 'Labo C205', schedule: '10:15 - 12:15' },
]

// ─── SCHEDULE ───────────────────────────────────────────────────────────────
export type EventType = 'CM' | 'TD' | 'TP' | 'Séminaire'
export interface ScheduleEvent {
  id: string; day: number; start: number; duration: number
  title: string; type: EventType; room: string; teacher: string; color: string
}
export const eventColors: Record<EventType, string> = {
  CM: 'bg-[#1e3a8a] text-white',
  TD: 'bg-[#0d9488] text-white',
  TP: 'bg-orange-500 text-white',
  Séminaire: 'bg-emerald-600 text-white',
}
export const mockScheduleEvents: ScheduleEvent[] = [
  { id: '1', day: 0, start: 0, duration: 2, title: 'Algorithmique', type: 'CM', room: 'Salle A204', teacher: 'Pr. Martin', color: 'bg-[#1e3a8a]' },
  { id: '2', day: 0, start: 2, duration: 1, title: 'Bases de données', type: 'TD', room: 'Salle B101', teacher: 'Dr. Benkacem', color: 'bg-[#0d9488]' },
  { id: '3', day: 1, start: 1, duration: 2, title: 'Algorithmique', type: 'TD', room: 'Salle A204', teacher: 'Pr. Martin', color: 'bg-[#0d9488]' },
  { id: '4', day: 1, start: 3, duration: 1, title: 'IA — Séminaire', type: 'Séminaire', room: 'Salle S202', teacher: 'Pr. Martin', color: 'bg-emerald-600' },
  { id: '5', day: 2, start: 2, duration: 2, title: 'Bases de données', type: 'TD', room: 'Salle B101', teacher: 'Dr. Benkacem', color: 'bg-[#0d9488]' },
  { id: '6', day: 3, start: 4, duration: 2, title: 'Réseaux — TP', type: 'TP', room: 'Salle Réseau C', teacher: 'Dr. Dubois', color: 'bg-orange-500' },
  { id: '7', day: 4, start: 0, duration: 2, title: 'Économie', type: 'CM', room: 'Salle EN5', teacher: 'Pr. Leroy', color: 'bg-[#1e3a8a]' },
  { id: '8', day: 4, start: 3, duration: 2, title: 'Réseaux — TP', type: 'TP', room: 'Salle Réseau C', teacher: 'Dr. Dubois', color: 'bg-orange-500' },
  { id: '9', day: 4, start: 5, duration: 1, title: 'Algorithmique', type: 'CM', room: 'Salle A204', teacher: 'Pr. Martin', color: 'bg-[#1e3a8a]' },
  { id: '10', day: 5, start: 1, duration: 2, title: 'Philosophie — Séminaire', type: 'Séminaire', room: 'Salle P207', teacher: 'Pr. Bernard', color: 'bg-emerald-600' },
]

// ─── ATTENDANCE ─────────────────────────────────────────────────────────────
export type AttendanceStatus = 'Régulier' | 'Attention' | 'Critique'
export interface AttendanceStudent {
  id: string; name: string; studentId: string
  present: number; absent: number; late: number
  rate: number; justified: number; status: AttendanceStatus
}
export const mockAttendanceStudents: AttendanceStudent[] = [
  { id: '1', name: 'Emma Martin',   studentId: '1405202401', present: 18, absent: 2, late: 1, rate: 90, justified: 1, status: 'Régulier' },
  { id: '2', name: 'Lucas Bernard', studentId: '1405202402', present: 17, absent: 2, late: 2, rate: 85, justified: 1, status: 'Régulier' },
  { id: '3', name: 'Chloé Dubois',  studentId: '1405202403', present: 14, absent: 3, late: 2, rate: 70, justified: 2, status: 'Attention' },
  { id: '4', name: 'Hugo Leroy',    studentId: '1405202404', present: 12, absent: 5, late: 3, rate: 60, justified: 2, status: 'Critique' },
  { id: '5', name: 'Sarah Benali',  studentId: '1405202405', present: 16, absent: 3, late: 1, rate: 80, justified: 2, status: 'Régulier' },
  { id: '6', name: 'Yasmine Khalil',studentId: '1405202406', present: 16, absent: 4, late: 2, rate: 75, justified: 1, status: 'Attention' },
]
export const mockAttendanceWeekly = [
  { week: 'S14', present: 85, group: 80 },
  { week: 'S15', present: 88, group: 82 },
  { week: 'S16', present: 82, group: 78 },
  { week: 'S17', present: 90, group: 86 },
  { week: 'S18', present: 87, group: 84 },
  { week: 'S19', present: 85, group: 81 },
  { week: 'S20', present: 87, group: 83 },
]

// ─── DELEGATE ROLL CALL ─────────────────────────────────────────────────────
export type RollStatus = 'Présent' | 'Absent' | 'Late' | 'Excusé'
export interface RollStudent {
  id: string; name: string; email: string; status: RollStatus
}
export const mockRollStudents: RollStudent[] = [
  { id: 'ETU-0847', name: 'Emma Martin',   email: 'emma.martin@uniflow.edu',   status: 'Présent' },
  { id: 'ETU-0848', name: 'Lucas Dubois',  email: 'lucas.dubois@uniflow.edu',  status: 'Présent' },
  { id: 'ETU-0849', name: 'Sarah Kamga',   email: 'sarah.kamga@uniflow.edu',   status: 'Absent' },
  { id: 'ETU-0850', name: 'Thomas Mbarga', email: 'thomas.mbarga@uniflow.edu', status: 'Late' },
  { id: 'ETU-0851', name: 'Yasmine Ngo',   email: 'yasmine.ngo@uniflow.edu',   status: 'Présent' },
]

// ─── GRADES ─────────────────────────────────────────────────────────────────
export const mockGrades = [
  { ue: 'INFO201', title: 'Algorithmique',        type: 'Contrôle continu', coef: 2, grade: 19, classAvg: 13.5, rank: 8,  maxRank: 45 },
  { ue: 'INFO102', title: 'Bases de données',     type: 'Examen',           coef: 3, grade: 14, classAvg: 12.8, rank: 12, maxRank: 45 },
  { ue: 'INFO301', title: 'Réseaux',              type: 'TP',               coef: 2, grade: 13, classAvg: 11.6, rank: 15, maxRank: 45 },
  { ue: 'ECO101',  title: 'Économie',             type: 'TP',               coef: 1, grade: 17, classAvg: 13.1, rank: 4,  maxRank: 45 },
  { ue: 'MATH101', title: 'Mathématiques',        type: 'Examen',           coef: 3, grade: 12, classAvg: 10.9, rank: 18, maxRank: 45 },
  { ue: 'INFO302', title: 'Développement Web',    type: 'Projet',           coef: 2, grade: 16, classAvg: 14.7, rank: 6,  maxRank: 45 },
  { ue: 'LANG101', title: 'Anglais',              type: 'Contrôle continu', coef: 1, grade: 15, classAvg: 13.1, rank: 9,  maxRank: 45 },
]
export const mockGradesEvolution = [
  { sem: 'S1 2022', personal: 12.5, classAvg: 11.8 },
  { sem: 'S2 2022', personal: 13.2, classAvg: 12.1 },
  { sem: 'S1 2023', personal: 14.0, classAvg: 12.5 },
  { sem: 'S2 2023', personal: 14.8, classAvg: 13.0 },
  { sem: 'S1 2024', personal: 14.6, classAvg: 13.2 },
]
export const mockRadarData = [
  { skill: 'Communication', value: 75 },
  { skill: 'Programmation', value: 90 },
  { skill: 'Conception',    value: 80 },
  { skill: 'Analyse',       value: 85 },
  { skill: 'Travail Éq.',   value: 70 },
]

// ─── ASSIGNMENTS ─────────────────────────────────────────────────────────────
export type AssignmentStatus = 'À rendre' | 'En retard' | 'Soumis' | 'Noté'
export interface Assignment {
  id: string; title: string; code: string; due: string
  progress: number; status: AssignmentStatus; grade?: string
}
export const mockAssignments: Assignment[] = [
  { id: '1', title: 'TP Algorithmique — Recherche dichotomique', code: 'INFO201', due: '18 mai 2024', progress: 60, status: 'À rendre' },
  { id: '2', title: 'Exercices Bases de données — Requêtes SQL',  code: 'INFO102', due: '15 mai 2024', progress: 30, status: 'En retard' },
  { id: '3', title: 'Rapport Réseaux — Protocole TCP/IP',         code: 'INFO301', due: '20 mai 2024', progress: 100, status: 'Soumis' },
  { id: '4', title: 'Quiz Économie — Microéconomie',              code: 'ECO101',  due: '12 mai 2024', progress: 100, status: 'Noté', grade: '16/20' },
  { id: '5', title: 'TP Développement Web — SPA React',           code: 'INFO302', due: '25 mai 2024', progress: 20, status: 'À rendre' },
]

// ─── MESSAGES ────────────────────────────────────────────────────────────────
export interface Message {
  id: string; from: 'me' | 'them'; text: string; time: string; file?: string
}
export interface Conversation {
  id: string; name: string; role: string; preview: string
  time: string; unread: number; online: boolean; messages: Message[]
}
export const mockConversations: Conversation[] = [
  {
    id: 'c1', name: 'Dr. Karim Benkacem', role: 'Enseignant — Informatique',
    preview: 'Bonjour Emma, voici le TP Algo', time: '10:15', unread: 2, online: true,
    messages: [
      { id: 'm1', from: 'them', text: 'Bonjour Emma,', time: '10:15' },
      { id: 'm2', from: 'them', text: 'Pouvez-vous me renvoyer votre TP ?', time: '10:15' },
      { id: 'm3', from: 'me',   text: 'Bonjour Dr. Benkacem, bien sûr, je vous l\'envoie dans quelques minutes.', time: '10:17' },
      { id: 'm4', from: 'them', text: 'Merci beaucoup !', time: '10:18' },
      { id: 'm5', from: 'me',   text: 'Voici le fichier demandé.', time: '10:20', file: 'TP_Algo.docx — 1.2 Mo' },
    ],
  },
  {
    id: 'c2', name: 'Prof. Martin', role: 'Enseignant — Algorithmique',
    preview: 'L\'examen est reporté au vendredi', time: '2h', unread: 0, online: false,
    messages: [
      { id: 'm1', from: 'them', text: 'Bonjour à tous, l\'examen de vendredi est reporté.', time: 'Hier 14:00' },
      { id: 'm2', from: 'me',   text: 'Merci pour l\'information, Professeur.', time: 'Hier 14:05' },
    ],
  },
  {
    id: 'c3', name: 'Sarah K.', role: 'Étudiante — L2 Info',
    preview: 'Tu as les notes de l\'Algo ?', time: 'Hier', unread: 1, online: true,
    messages: [
      { id: 'm1', from: 'them', text: 'Salut ! Tu as les notes de l\'Algo ?', time: 'Hier 18:30' },
      { id: 'm2', from: 'me',   text: 'Oui je t\'envoie ça !', time: 'Hier 18:32' },
    ],
  },
  {
    id: 'c4', name: 'Lucas D.', role: 'Délégué — L2 Info',
    preview: 'Rappel : réunion délégués demain 13h', time: 'Lun', unread: 0, online: false,
    messages: [
      { id: 'm1', from: 'them', text: 'Rappel : réunion des délégués demain à 13h salle C102.', time: 'Lun 09:00' },
    ],
  },
  {
    id: 'c5', name: 'Équipe Projet', role: 'Groupe — INFO302',
    preview: 'Amine R.: On se retrouve en salle B204', time: 'Dim', unread: 3, online: false,
    messages: [
      { id: 'm1', from: 'them', text: 'Groupe : on se retrouve en salle B204 pour le projet.', time: 'Dim 10:00' },
      { id: 'm2', from: 'me',   text: 'Ok, je serai là !', time: 'Dim 10:05' },
    ],
  },
]

// ─── NOTIFICATIONS ───────────────────────────────────────────────────────────
export type NotifType = 'annonce' | 'devoir' | 'video' | 'system' | 'absence' | 'note'
export interface Notification {
  id: string; type: NotifType; title: string; sender: string
  time: string; unread: boolean; content: string
}
export const mockNotifications: Notification[] = [
  { id: 'n1', type: 'annonce', title: 'Annonce importante',       sender: 'Admin UniFlow',  time: 'il y a 5 min', unread: true,
    content: 'Changement de salle pour le cours d\'Algo de demain (14/05) : Amphi B → Salle B102.\n\nBonjour à tous,\n\nNous vous informons que le cours d\'Algorithmique prévu demain mardi 14 mai à 10:00 aura lieu en Salle B102 au lieu de l\'Amphi B.\n\nMerci de votre compréhension.\nL\'équipe pédagogique' },
  { id: 'n2', type: 'devoir',  title: 'Nouveau devoir',           sender: 'Dr. Benkacem',   time: 'il y a 1h', unread: true,
    content: 'TP Bases de données — À rendre avant le 20/05 à 23:59.\n\nConsignes : Réaliser les exercices SQL du chapitre 4 (jointures complexes). Rendre un fichier .sql commenté sur la plateforme.' },
  { id: 'n3', type: 'video',   title: 'Visioconférence dans 30 min', sender: 'Pr. Martin', time: 'il y a 2h', unread: false,
    content: 'Algorithmique — Session en ligne à 14h00.\n\nLien : https://app.uniflow.edu/visio/algo-l2\nCode d\'accès : ALGO2024' },
  { id: 'n4', type: 'absence', title: 'Absence justifiée',        sender: 'Admin',          time: 'Hier', unread: false,
    content: 'Votre absence du 10/05 a été justifiée. Statut mis à jour dans votre dossier.' },
  { id: 'n5', type: 'system',  title: 'Nouvelle annonce système', sender: 'Admin UniFlow',  time: 'Lundi', unread: true,
    content: 'Maintenance prévue le 20/06 de 02:00 à 04:00. La plateforme sera inaccessible durant cette période.' },
  { id: 'n6', type: 'note',    title: 'Note publiée',             sender: 'Pr. Leroy',      time: 'Il y a 3j', unread: false,
    content: 'Votre note pour le TP Économie a été publiée : 17/20. Bravo pour votre excellent travail !' },
]

// ─── TEACHER STUDENTS ────────────────────────────────────────────────────────
export interface TeacherStudent {
  id: string; name: string; cc: number; exam: number; locked: boolean
}
export const mockTeacherStudents: TeacherStudent[] = [
  { id: 'ETU-0847', name: 'Emma Martin',    cc: 16.5, exam: 15, locked: true },
  { id: 'ETU-0848', name: 'Lucas Bernard',  cc: 14.0, exam: 13, locked: true },
  { id: 'ETU-0849', name: 'Sophie Durand',  cc: 12.5, exam: 11, locked: false },
  { id: 'ETU-0850', name: 'Ahmed Ali',      cc: 9.0,  exam: 7,  locked: false },
  { id: 'ETU-0851', name: 'Marie Fontaine', cc: 18.0, exam: 17, locked: true },
  { id: 'ETU-0852', name: 'Paul Nguyen',    cc: 11.5, exam: 10, locked: false },
]

// ─── TEACHER RESOURCES ──────────────────────────────────────────────────────
export interface TeacherResource {
  id: number; name: string; type: string; size: string; date: string; courseId: string
}
export const mockResources: TeacherResource[] = [
  { id: 1, name: 'Syllabus_INFO101_v2.pdf',           type: 'Syllabus', size: '2.4 Mo', date: '10 avr. 2024', courseId: 'INFO101' },
  { id: 2, name: 'TP1_Structures_Lineaires.pdf',       type: 'TP',      size: '1.2 Mo', date: '25 avr. 2024', courseId: 'INFO101' },
  { id: 3, name: 'Support_Cours_Arbres_Graphes.pdf',   type: 'Cours',   size: '4.8 Mo', date: 'Aujourd\'hui', courseId: 'INFO101' },
  { id: 4, name: 'TD1_Requetes_SQL.pdf',               type: 'TD',      size: '0.9 Mo', date: '5 mai 2024',   courseId: 'INFO201' },
]
