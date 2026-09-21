/**
 * Calculs purs du tableau de bord (web), testés sans DOM.
 *
 * Les encarts « Aujourd'hui », « Taux de présence — 6 dernières semaines »,
 * « Distribution des notes » et « Activité récente » étaient branchés sur des
 * tableaux vides codés en dur : la salle ICT4D L1 de démonstration affichait
 * « Aucun cours planifié aujourd'hui » un lundi avec deux séances au planning,
 * et « Aucune note » avec dix-huit évaluations. Tout part maintenant des
 * données Appwrite déjà chargées par les API du client.
 */

const WEEKDAYS_FR = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']

/** « Lundi », « LUNDI », « lundi » ou « Mercredi » → clé comparable sans accent. */
export function weekdayKey(value: string | null | undefined): string {
  return (value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase()
}

export function weekdayKeyOf(date: Date): string {
  return WEEKDAYS_FR[date.getDay()]
}

export interface ScheduleLike {
  dayOfWeek: string
  startTime: string
  endTime: string
  course: { name: string; code: string; type?: string; classroom?: { name?: string; building?: string } }
}

export interface TodayEvent {
  time: string
  title: string
  room: string
  type: string
}

/** Séances du jour, triées par heure de début. */
export function todaysSessions(schedules: ScheduleLike[], now: Date = new Date()): TodayEvent[] {
  const today = weekdayKeyOf(now)
  return schedules
    .filter((item) => weekdayKey(item.dayOfWeek) === today)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
    .map((item) => ({
      time: item.startTime,
      title: `${item.course.code} — ${item.course.name}`.trim(),
      room: [item.course.classroom?.name, item.course.classroom?.building].filter(Boolean).join(' · ') || 'Salle à confirmer',
      type: (item.course.type || 'CM').toUpperCase(),
    }))
}

/** Jours du mois (1..31) où l'emploi du temps hebdomadaire a au moins une séance. */
export function eventDaysInMonth(schedules: ScheduleLike[], year: number, monthIndex: number): number[] {
  const weekdays = new Set(schedules.map((item) => weekdayKey(item.dayOfWeek)))
  if (weekdays.size === 0) return []
  const total = new Date(year, monthIndex + 1, 0).getDate()
  const days: number[] = []
  for (let day = 1; day <= total; day += 1) {
    if (weekdays.has(weekdayKeyOf(new Date(year, monthIndex, day)))) days.push(day)
  }
  return days
}

export interface GradeLike {
  grade: number
  maxScore?: number
  title?: string
  type?: string
}

export interface DistributionSlice {
  name: string
  value: number
  color: string
}

const BANDS: Array<{ name: string; min: number; color: string }> = [
  { name: 'Excellent (≥ 16)', min: 16, color: '#0d9488' },
  { name: 'Bien (14–16)', min: 14, color: '#1e3a8a' },
  { name: 'Assez bien (12–14)', min: 12, color: '#7c3aed' },
  { name: 'Passable (10–12)', min: 10, color: '#d97706' },
  { name: 'Insuffisant (< 10)', min: -Infinity, color: '#dc2626' },
]

/** Note ramenée sur 20 quel que soit le barème (quiz sur 7, TP sur 10…). */
export function scoreOn20(grade: GradeLike): number {
  const max = grade.maxScore && grade.maxScore > 0 ? grade.maxScore : 20
  return (Number(grade.grade) / max) * 20
}

/** Répartition en pourcentages (somme 100, arrondis compensés sur la plus grande part). */
export function gradeDistribution(grades: GradeLike[]): DistributionSlice[] {
  if (grades.length === 0) return []
  const counts = BANDS.map(() => 0)
  for (const grade of grades) {
    const on20 = scoreOn20(grade)
    const index = BANDS.findIndex((band) => on20 >= band.min)
    counts[index === -1 ? BANDS.length - 1 : index] += 1
  }
  const raw = counts.map((count) => (count / grades.length) * 100)
  const rounded = raw.map(Math.round)
  const drift = 100 - rounded.reduce((sum, value) => sum + value, 0)
  if (drift !== 0) rounded[rounded.indexOf(Math.max(...rounded))] += drift
  return BANDS.map((band, index) => ({ name: band.name, value: rounded[index], color: band.color })).filter((slice) => slice.value > 0)
}

export interface TeacherAveragePoint {
  week: string
  average: number
}

/** Moyenne /20 par évaluation (CC, TP, examen…), dans l'ordre d'apparition — l'axe du graphique enseignant. */
export function teacherAverages(grades: GradeLike[]): TeacherAveragePoint[] {
  const buckets = new Map<string, number[]>()
  for (const grade of grades) {
    const key = (grade.type || grade.title || 'Évaluation').toString()
    const list = buckets.get(key) ?? []
    list.push(scoreOn20(grade))
    buckets.set(key, list)
  }
  return [...buckets.entries()].map(([week, values]) => ({
    week,
    average: Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1)),
  }))
}

export interface TimedRecord {
  status: string
  at?: string | null
}

export interface AttendancePoint {
  week: string
  rate: number
}

/** Lundi 00:00 (heure locale) de la semaine contenant `date`. */
export function startOfWeek(date: Date): Date {
  const copy = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const isoDay = (copy.getDay() + 6) % 7
  copy.setDate(copy.getDate() - isoDay)
  return copy
}

/** Numéro de semaine ISO, pour l'étiquette « S38 ». */
export function isoWeekNumber(date: Date): number {
  const utc = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const day = utc.getUTCDay() || 7
  utc.setUTCDate(utc.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1))
  return Math.ceil(((utc.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

/**
 * Taux de présence par semaine sur les `weeks` dernières semaines (semaine
 * courante incluse). Présents et retards comptent comme présence ; les
 * justifiés sortent du dénominateur ; une semaine sans relevé est omise
 * plutôt que tracée à 0.
 */
export function weeklyAttendanceTrend(records: TimedRecord[], now: Date = new Date(), weeks = 6): AttendancePoint[] {
  const thisWeek = startOfWeek(now)
  const points: AttendancePoint[] = []
  for (let offset = weeks - 1; offset >= 0; offset -= 1) {
    const start = new Date(thisWeek)
    start.setDate(thisWeek.getDate() - offset * 7)
    const end = new Date(start)
    end.setDate(start.getDate() + 7)
    const inWeek = records.filter((record) => {
      if (!record.at) return false
      const at = new Date(record.at)
      return !Number.isNaN(at.getTime()) && at >= start && at < end && record.status.toLowerCase() !== 'justifie'
    })
    if (inWeek.length === 0) continue
    const present = inWeek.filter((record) => ['present', 'retard'].includes(record.status.toLowerCase())).length
    points.push({ week: `S${isoWeekNumber(start)}`, rate: Math.round((present / inWeek.length) * 100) })
  }
  return points
}

/** « il y a 5 min », « il y a 3 h », « hier », « il y a 4 j ». */
export function relativeTime(iso: string, now: Date = new Date()): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const minutes = Math.max(0, Math.round((now.getTime() - date.getTime()) / 60000))
  if (minutes < 1) return 'à l’instant'
  if (minutes < 60) return `il y a ${minutes} min`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `il y a ${hours} h`
  const days = Math.round(hours / 24)
  if (days === 1) return 'hier'
  return `il y a ${days} j`
}
