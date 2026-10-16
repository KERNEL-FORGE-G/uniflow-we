import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { UniIcon, type UniIconName } from '../../components/ui/UniIcon'
import { SubscriptionStatus } from '../../components/subscription/SubscriptionStatus'
import {
  assignmentsApi, attendanceApi, coursesApi, gradesApi, notificationsApi, schedulesApi, studentsApi,
  type Assignment, type Course, type Grade, type Notification, type Schedule,
} from '../../lib/api'
import { attendanceRate } from '../../lib/assignmentModel'
import { dueWithin, relativeTime, todaysSessions, weeklyAttendanceTrend } from '../../lib/dashboardModel'
import { useUserRole } from '../../utils/userRole'

/**
 * Tableau de bord unique pour les trois profils d'UniFlow. Chaque rôle a sa propre
 * hiérarchie : l'étudiant voit sa progression, le délégué son groupe, l'enseignant
 * ses élèves et ses devoirs. Les données viennent des API déjà existantes de
 * `lib/api` (qui savent lire le compte indépendant) : aucune donnée n'est inventée,
 * un chiffre inconnu s'affiche « — ».
 */

type Role = 'student' | 'delegate' | 'teacher'

type Snapshot = {
  courses: Course[]
  assignments: Assignment[]
  grades: Grade[]
  schedules: Schedule[]
  notifications: Notification[]
  attendance: Array<{ status: string; at: string }>
  learners: number
}

const EMPTY: Snapshot = { courses: [], assignments: [], grades: [], schedules: [], notifications: [], attendance: [], learners: 0 }

const ROLE_META: Record<Role, { label: string; icon: UniIconName; headline: string; lead: string }> = {
  student: { label: 'Étudiant', icon: 'students', headline: 'Votre progression du jour', lead: 'Vos prochaines séances, vos devoirs et votre moyenne : tout ce qu’il faut pour avancer à votre rythme.' },
  delegate: { label: 'Délégué', icon: 'megaphone', headline: 'Votre groupe d’étude', lead: 'Animez votre groupe : annonces, présences et séances à venir au même endroit.' },
  teacher: { label: 'Enseignant', icon: 'teacher', headline: 'Votre atelier', lead: 'Vos cours, vos élèves et les devoirs qui attendent votre attention.' },
}

function greeting(now: Date) {
  const h = now.getHours()
  return h < 6 ? 'Bonne nuit' : h < 12 ? 'Bonjour' : h < 18 ? 'Bon après-midi' : 'Bonsoir'
}

function firstNameOf(name: string) {
  const parts = name.trim().split(/\s+/)
  // « Pr. Fouda » : un titre en tête n'est pas un prénom.
  return /^(pr|dr|m|mme|mlle|me)\.?$/i.test(parts[0] ?? '') ? name.trim() : parts[0] || 'vous'
}

const isPending = (a: Assignment) => a.status === 'À rendre' || a.status === 'En retard'

function Card({ title, icon, to, linkLabel, children, tone = 'teal' }: { title: string; icon: UniIconName; to?: string; linkLabel?: string; children: ReactNode; tone?: 'teal' | 'blue' | 'amber' }) {
  const tones = { teal: 'bg-teal-50 text-teal-700', blue: 'bg-blue-50 text-blue-800', amber: 'bg-amber-50 text-amber-700' }
  return (
    <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
      <header className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-3 text-base font-black text-slate-900">
          <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${tones[tone]}`}><UniIcon name={icon} weight="bold" size={18} /></span>
          {title}
        </h2>
        {to && <Link to={to} className="rounded-lg text-xs font-bold text-[#1E3A8A] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D9488]">{linkLabel ?? 'Tout voir'} →</Link>}
      </header>
      <div className="mt-4">{children}</div>
    </section>
  )
}

function Empty({ text, cta, to }: { text: string; cta?: string; to?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-[#F7F9FC] p-6 text-center">
      <p className="text-sm text-slate-600">{text}</p>
      {cta && to && <Link to={to} className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-[#0D9488] px-4 py-2 text-xs font-black text-white hover:bg-teal-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D9488]"><UniIcon name="plus" size={14} />{cta}</Link>}
    </div>
  )
}

function Kpi({ label, value, hint, icon, to, accent }: { label: string; value: string; hint: string; icon: UniIconName; to: string; accent: string }) {
  return (
    <Link to={to} className="group rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D9488]">
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl text-white" style={{ backgroundColor: accent }}><UniIcon name={icon} weight="fill" size={22} /></span>
      <p className="mt-4 text-3xl font-black leading-none text-slate-900">{value}</p>
      <p className="mt-1.5 text-sm font-bold text-slate-700">{label}</p>
      <p className="mt-0.5 text-xs text-slate-500">{hint}</p>
    </Link>
  )
}

export default function RoleDashboard() {
  const { currentRole, currentUser, authUser, isSessionReady } = useUserRole()
  const role: Role = currentRole === 'teacher' ? 'teacher' : currentRole === 'delegate' ? 'delegate' : 'student'
  const meta = ROLE_META[role]
  const [data, setData] = useState<Snapshot>(EMPTY)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // Les encarts secondaires retombent sur « vide » : ils ne doivent pas faire échouer les compteurs.
      const [courses, assignments, grades, attendance, schedules, notifications, learners] = await Promise.all([
        coursesApi.mine(), assignmentsApi.mine(), gradesApi.mine(),
        attendanceApi.myRecords().catch(() => []),
        schedulesApi.mine().catch(() => []),
        notificationsApi.list().catch(() => []),
        role === 'student' ? Promise.resolve(0) : studentsApi.countForMyCourses().catch(() => 0),
      ])
      setData({ courses, assignments, grades, schedules, notifications, attendance, learners })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de charger votre tableau de bord.')
    } finally {
      setLoading(false)
    }
  }, [role])

  useEffect(() => {
    if (!isSessionReady || !authUser?.id) return
    void load()
    const onRestore = () => { void load() }
    window.addEventListener('uniflow:session-restored', onRestore)
    window.addEventListener('uniflow:network-restored', onRestore)
    return () => {
      window.removeEventListener('uniflow:session-restored', onRestore)
      window.removeEventListener('uniflow:network-restored', onRestore)
    }
  }, [authUser?.id, isSessionReady, load])

  const now = useMemo(() => new Date(), [])
  const pending = useMemo(() => data.assignments.filter(isPending).sort((a, b) => String(a.due).localeCompare(String(b.due))), [data.assignments])
  const average = useMemo(() => {
    if (!data.grades.length) return null
    const sum = data.grades.reduce((acc, g) => acc + (Number(g.grade) / Math.max(Number(g.maxScore) || 20, 1)) * 20, 0)
    return Number((sum / data.grades.length).toFixed(2))
  }, [data.grades])
  const rate = useMemo(() => attendanceRate(data.attendance as Array<{ status: string }>), [data.attendance])
  const trend = useMemo(() => weeklyAttendanceTrend(data.attendance, now), [data.attendance, now])
  const today = useMemo(() => todaysSessions(data.schedules, now), [data.schedules, now])
  const dueSoon = dueWithin(data.assignments.filter(isPending), now)
  const doneShare = data.assignments.length ? Math.round(((data.assignments.length - pending.length) / data.assignments.length) * 100) : null
  const unread = data.notifications.filter((n) => !n.isRead)
  const announcements = [...data.notifications].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))).slice(0, 4)
  const dateLabel = now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })

  const primary = role === 'teacher'
    ? { to: '/app/mes-cours-enseignant', label: 'Gérer mes cours' }
    : role === 'delegate' ? { to: '/app/gestion-presences', label: 'Faire l’appel' } : { to: '/app/emploi-du-temps', label: 'Mon planning' }

  const kpis = role === 'teacher'
    ? [
        { label: 'Cours animés', value: `${data.courses.length}`, hint: 'Vos cours et ateliers', icon: 'courses' as const, to: '/app/mes-cours-enseignant', accent: '#1E3A8A' },
        { label: 'Élèves', value: data.learners ? `${data.learners}` : '—', hint: data.learners ? 'Inscrits à vos cours' : 'Invitez vos premiers élèves', icon: 'students' as const, to: '/app/etudiants', accent: '#0D9488' },
        { label: 'Devoirs à suivre', value: `${pending.length}`, hint: dueSoon ? `${dueSoon} à rendre sous 7 jours` : 'Aucune échéance proche', icon: 'assignments' as const, to: '/app/devoirs', accent: '#F59E0B' },
        { label: 'Moyenne des élèves', value: average != null ? `${average}/20` : '—', hint: data.grades.length ? `${data.grades.length} notes saisies` : 'Aucune note saisie', icon: 'grades' as const, to: '/app/notes', accent: '#7C3AED' },
      ]
    : role === 'delegate'
    ? [
        { label: 'Membres du groupe', value: data.learners ? `${data.learners}` : '—', hint: data.learners ? 'Participants suivis' : 'Invitez votre groupe', icon: 'students' as const, to: '/app/messages', accent: '#0D9488' },
        { label: 'Présence', value: rate != null ? `${rate} %` : '—', hint: data.attendance.length ? `${data.attendance.length} séances relevées` : 'Aucun appel pour l’instant', icon: 'attendance' as const, to: '/app/gestion-presences', accent: '#1E3A8A' },
        { label: 'Séances aujourd’hui', value: `${today.length}`, hint: today.length ? 'À animer' : 'Journée libre', icon: 'schedule' as const, to: '/app/emploi-du-temps', accent: '#7C3AED' },
        { label: 'Annonces non lues', value: `${unread.length}`, hint: unread.length ? 'À consulter' : 'Tout est lu', icon: 'notifications' as const, to: '/app/notifications', accent: '#F59E0B' },
      ]
    : [
        { label: 'Cours suivis', value: `${data.courses.length}`, hint: data.courses.length ? 'Votre parcours' : 'Ajoutez votre premier cours', icon: 'courses' as const, to: '/app/cours', accent: '#1E3A8A' },
        { label: 'Devoirs à faire', value: `${pending.length}`, hint: dueSoon ? `${dueSoon} sous 7 jours` : 'Rien d’urgent', icon: 'assignments' as const, to: '/app/devoirs', accent: '#F59E0B' },
        { label: 'Moyenne', value: average != null ? `${average}/20` : '—', hint: data.grades.length ? `${data.grades.length} résultats` : 'Aucun résultat saisi', icon: 'grades' as const, to: '/app/notes', accent: '#7C3AED' },
        { label: 'Séances aujourd’hui', value: `${today.length}`, hint: today.length ? 'Au programme' : 'Journée libre', icon: 'schedule' as const, to: '/app/emploi-du-temps', accent: '#0D9488' },
      ]

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-14 animate-fade-in">
      {/* Bandeau de page : salutation, rôle, action principale */}
      <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1E3A8A] via-[#1E40AF] to-[#0D9488] p-6 text-white shadow-lg sm:p-8">
        <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="flex flex-wrap items-center gap-2 text-xs font-bold">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1"><UniIcon name={meta.icon} weight="fill" size={14} />{meta.label}</span>
              <span className="capitalize text-blue-100">{dateLabel}</span>
            </p>
            <h1 className="mt-3 text-2xl font-black tracking-tight sm:text-4xl">{greeting(now)}, {firstNameOf(currentUser.name)}</h1>
            <p className="mt-1 text-lg font-bold text-amber-300">{meta.headline}</p>
            <p className="mt-2 text-sm leading-relaxed text-blue-100 sm:text-base">{meta.lead}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to={primary.to} className="inline-flex items-center gap-2 rounded-2xl bg-[#F59E0B] px-5 py-3 text-sm font-black text-slate-900 shadow-md transition hover:bg-amber-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">{primary.label}<UniIcon name="forward" weight="bold" size={16} /></Link>
            <button type="button" onClick={() => void load()} disabled={loading} className="inline-flex items-center gap-2 rounded-2xl border border-white/30 bg-white/10 px-4 py-3 text-sm font-bold hover:bg-white/20 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
              <UniIcon name="refresh" weight="bold" size={16} className={loading ? 'animate-spin' : ''} />Actualiser
            </button>
          </div>
        </div>
      </header>

      {error && (
        <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-800">
          <span className="flex items-center gap-2"><UniIcon name="alert" weight="fill" size={18} />{error}</span>
          <button type="button" onClick={() => void load()} className="rounded-xl bg-rose-600 px-4 py-1.5 text-xs font-black text-white hover:bg-rose-700">Réessayer</button>
        </div>
      )}

      {loading ? (
        <div role="status" aria-live="polite" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => <div key={i} className="h-40 animate-pulse rounded-3xl bg-white shadow-sm" />)}
          <span className="sr-only">Chargement de votre tableau de bord…</span>
        </div>
      ) : (
        <section aria-label="Indicateurs clés" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map((k) => <Kpi key={k.label} {...k} />)}
        </section>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(300px,0.5fr)]">
        <div className="space-y-6">
          <Card title={role === 'teacher' ? 'Vos séances du jour' : 'Prochaines séances'} icon="agenda" to="/app/emploi-du-temps" linkLabel="Semaine complète">
            {today.length === 0 ? (
              <Empty text="Aucune séance prévue aujourd’hui. Profitez-en pour réviser ou préparer la suite." cta="Planifier une séance" to="/app/emploi-du-temps" />
            ) : (
              <ul className="space-y-2.5">
                {today.map((s) => (
                  <li key={`${s.time}-${s.title}`} className="flex items-center justify-between gap-3 rounded-2xl bg-[#F7F9FC] p-4">
                    <div className="min-w-0"><p className="truncate text-sm font-extrabold text-slate-900">{s.title}</p><p className="text-xs text-slate-500">{s.room}</p></div>
                    <span className="shrink-0 rounded-xl bg-teal-100 px-3 py-1 text-xs font-black text-teal-900">{s.time}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title={role === 'teacher' ? 'Devoirs à suivre' : 'Devoirs à rendre'} icon="assignments" tone="amber" to="/app/devoirs" linkLabel={`Voir les devoirs (${data.assignments.length})`}>
            {pending.length === 0 ? (
              <Empty text={role === 'teacher' ? 'Aucun devoir en attente. Publiez un exercice pour vos élèves.' : 'Tout est à jour, bravo ! Ajoutez un devoir quand vous en avez un.'} cta="Nouveau devoir" to="/app/devoirs" />
            ) : (
              <ul className="space-y-2.5">
                {pending.slice(0, 5).map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-3 rounded-2xl bg-[#F7F9FC] p-4">
                    <p className="min-w-0 truncate text-sm font-bold text-slate-900">{a.title}</p>
                    <span className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-black ${a.status === 'En retard' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}`}>{a.status === 'En retard' ? 'En retard' : relativeLabel(a.due, now)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {role === 'delegate' && (
            <Card title="Présences de mon groupe" icon="attendance" tone="blue" to="/app/gestion-presences" linkLabel="Faire l’appel">
              {trend.length < 2 ? <Empty text="Faites l’appel à quelques séances pour voir l’évolution de la présence de votre groupe." cta="Faire l’appel" to="/app/gestion-presences" /> : (
                <div className="h-48" role="img" aria-label="Évolution hebdomadaire de la présence">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trend}><XAxis dataKey="week" tick={{ fontSize: 11 }} /><YAxis domain={[0, 100]} width={30} tick={{ fontSize: 11 }} /><Tooltip /><Area type="monotone" dataKey="rate" stroke="#0D9488" fill="#0D9488" fillOpacity={0.15} /></AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>
          )}
        </div>

        <aside className="space-y-6">
          {role === 'student' && (
            <Card title="Ma progression" icon="grades" tone="blue" to="/app/notes">
              <div className="overflow-hidden rounded-2xl"><img src="/illustrations/grades.jpg" alt="" loading="lazy" className="h-28 w-full object-cover" /></div>
              <p className="mt-4 text-xs font-bold uppercase tracking-wider text-slate-500">Devoirs terminés</p>
              <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-valuenow={doneShare ?? 0} aria-valuemin={0} aria-valuemax={100} aria-label="Part de devoirs terminés"><div className="h-full rounded-full bg-gradient-to-r from-[#1E3A8A] to-[#0D9488]" style={{ width: `${doneShare ?? 0}%` }} /></div>
              <p className="mt-1.5 text-xs text-slate-500">{doneShare != null ? `${doneShare} % de vos devoirs sont terminés` : 'Ajoutez des devoirs pour suivre votre avancée'}</p>
            </Card>
          )}
          {role === 'teacher' && (
            <Card title="Mes cours" icon="courses" tone="blue" to="/app/mes-cours-enseignant" linkLabel="Gérer">
              {data.courses.length === 0 ? <Empty text="Créez votre premier cours ou atelier." cta="Créer un cours" to="/app/mes-cours-enseignant" /> : (
                <ul className="space-y-2">{data.courses.slice(0, 5).map((c) => <li key={c.id} className="truncate rounded-xl bg-[#F7F9FC] px-3 py-2 text-sm font-bold text-slate-800">{c.name}</li>)}</ul>
              )}
            </Card>
          )}
          <Card title={role === 'delegate' ? 'Annonces' : 'Activité récente'} icon="notifications" to="/app/notifications">
            {announcements.length === 0 ? <Empty text={role === 'delegate' ? 'Aucune annonce pour le moment. Écrivez à votre groupe depuis la messagerie.' : 'Rien de neuf pour le moment.'} cta={role === 'delegate' ? 'Écrire au groupe' : undefined} to="/app/messages" /> : (
              <ul className="space-y-2.5">{announcements.map((n) => <li key={n.id} className="rounded-xl bg-[#F7F9FC] p-3"><p className="text-sm font-bold text-slate-800">{n.title}</p><p className="text-xs text-slate-500">{relativeTime(n.createdAt, now)}</p></li>)}</ul>
            )}
          </Card>
          <SubscriptionStatus />
          <Link to="/app/bibliotheque" className="flex items-center gap-3 rounded-3xl bg-gradient-to-br from-[#0D9488] to-[#115E59] p-5 text-white shadow-md transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D9488]">
            <UniIcon name="library" weight="fill" size={26} />
            <span><span className="block text-sm font-black">Bibliothèque</span><span className="text-xs text-teal-100">Ouvrages et ressources libres pour vos révisions</span></span>
          </Link>
        </aside>
      </div>
    </div>
  )
}

/** « Aujourd'hui », « Demain » ou « Dans N j » : plus parlant qu'une date brute sur un dashboard. */
function relativeLabel(due: string, now: Date) {
  const time = new Date(due).getTime()
  if (!Number.isFinite(time)) return 'Sans échéance'
  const days = Math.ceil((time - now.getTime()) / 86_400_000)
  if (days <= 0) return 'Aujourd’hui'
  if (days === 1) return 'Demain'
  return days <= 14 ? `Dans ${days} j` : new Date(time).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}
