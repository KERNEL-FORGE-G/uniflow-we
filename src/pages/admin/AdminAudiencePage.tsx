import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Activity, Globe, Laptop, Monitor, RefreshCw, Smartphone, Tablet, Users, Eye, Radio, Clock } from 'lucide-react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { fetchMetricsAdmin, type MetricsAdmin, type RecentVisit } from '../../lib/metrics'
import { CountUp } from '../../components/ui/CountUp'
import { UniLoading, UniOops } from '../../components/mascot/UniScenes'
import { UniMascot } from '../../components/mascot/UniMascot'
import { cn } from '../../utils/cn'

/**
 * Audience du site — vue administration (demande du 2026-09-21 : « système
 * de métriques en temps réel des visiteurs, par plateforme »). Tout vient du
 * service `/metrics` (action `admin`) ; la page se rafraîchit toute seule
 * toutes les 30 secondes pour le compteur « présents maintenant ».
 */

const REFRESH_MS = 30_000
const PLATFORM_COLORS: Record<string, string> = { web: '#1e3a8a', mobile: '#0d9488', desktop: '#7c3aed' }
const DEVICE_COLORS: Record<string, string> = { mobile: '#0d9488', tablet: '#f59e0b', desktop: '#1e3a8a', other: '#94a3b8' }

const platformIcon = { web: Globe, mobile: Smartphone, desktop: Monitor } as const
const deviceIcon = { mobile: Smartphone, tablet: Tablet, desktop: Laptop, other: Activity } as const

function relative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.round(diff / 60_000)
  if (minutes < 1) return 'à l’instant'
  if (minutes < 60) return `il y a ${minutes} min`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `il y a ${hours} h`
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

function dayLabel(day: string) {
  const [, month, date] = day.split('-')
  return `${Number(date)}/${Number(month)}`
}

export default function AdminAudiencePage() {
  const [data, setData] = useState<MetricsAdmin | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null)

  const load = async (silent = false) => {
    if (!silent) setRefreshing(true)
    try {
      setData(await fetchMetricsAdmin())
      setUpdatedAt(new Date())
      setError(null)
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : 'Audience indisponible.')
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    void load(true)
    const timer = window.setInterval(() => { if (document.visibilityState === 'visible') void load(true) }, REFRESH_MS)
    return () => window.clearInterval(timer)
  }, [])

  const series = useMemo(() => (data?.series ?? []).map((day) => ({ ...day, label: dayLabel(day.day) })), [data])
  const platformData = useMemo(() => data ? Object.entries(data.summary.platforms).map(([name, value]) => ({ name, value })) : [], [data])
  const deviceData = useMemo(() => data ? Object.entries(data.summary.devices).map(([name, value]) => ({ name, value })) : [], [data])
  const platformTotal = platformData.reduce((sum, item) => sum + item.value, 0)

  if (!data && !error) return <UniLoading label="Uni compte les visiteurs" />
  if (!data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <UniOops title="L’audience ne répond pas" description={error ?? undefined}>
          <button type="button" onClick={() => void load()} className="rounded-xl bg-[#1e3a8a] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#2d4fa8]">Réessayer</button>
        </UniOops>
      </div>
    )
  }

  const { summary, liveNow, recent } = data
  const cards = [
    { icon: Radio, label: 'Présents maintenant', value: liveNow, hint: 'actifs dans les 5 dernières minutes', accent: 'bg-emerald-50 text-emerald-700', live: true },
    { icon: Users, label: 'Visiteurs aujourd’hui', value: summary.today.visitors, hint: `${summary.today.visits} visite${summary.today.visits > 1 ? 's' : ''} · ${summary.today.pageViews} pages`, accent: 'bg-[#eff3ff] text-[#1e3a8a]' },
    { icon: Clock, label: '7 derniers jours', value: summary.last7Days.visitors, hint: `${summary.last7Days.visits} visites`, accent: 'bg-[#f0fdfa] text-[#0d9488]' },
    { icon: Eye, label: 'Depuis le début', value: summary.totalVisitors, hint: `${summary.totalVisits} visites · ${summary.totalPageViews} pages vues · ${summary.daysTracked} jour${summary.daysTracked > 1 ? 's' : ''} mesuré${summary.daysTracked > 1 ? 's' : ''}`, accent: 'bg-purple-50 text-purple-700' },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-4">
          <UniMascot pose="search" size={84} effects={false} />
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-[#0d9488]">Audience du site</p>
            <h1 className="text-2xl font-black tracking-tight text-[#111827] sm:text-3xl">Qui visite UniFlow, et depuis où</h1>
            <p className="mt-1 text-sm text-[#6b7280]">
              Mesure maison, sans service tiers : un identifiant anonyme par navigateur, aucune donnée personnelle.
              {updatedAt && <> Actualisé à {updatedAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}.</>}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={refreshing}
          className="inline-flex items-center gap-2 self-start rounded-xl border border-[#e5e7eb] bg-white px-4 py-2.5 text-sm font-bold text-[#111827] shadow-sm transition hover:border-[#1e3a8a] disabled:opacity-60"
        >
          <RefreshCw className={cn('h-4 w-4', refreshing && 'animate-spin')} /> Actualiser
        </button>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ icon: Icon, label, value, hint, accent, live }, index) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0, transition: { delay: index * 0.06 } }}
            className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className={cn('flex h-11 w-11 items-center justify-center rounded-2xl', accent)}><Icon className="h-5 w-5" /></span>
              {live && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-700">
                  <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" /></span>
                  En direct
                </span>
              )}
            </div>
            <p className="mt-4 text-3xl font-black tracking-tight text-[#111827]"><CountUp value={value} /></p>
            <p className="text-xs font-bold uppercase tracking-wider text-[#6b7280]">{label}</p>
            <p className="mt-1 text-xs text-[#9ca3af]">{hint}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm xl:col-span-2">
          <h2 className="text-base font-black text-[#111827]">Visites et visiteurs — 30 derniers jours</h2>
          <p className="text-xs text-[#6b7280]">Une visite = une session de navigation ; un visiteur = un navigateur distinct dans la journée.</p>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="visits" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#1e3a8a" stopOpacity={0.35} /><stop offset="95%" stopColor="#1e3a8a" stopOpacity={0} /></linearGradient>
                  <linearGradient id="visitors" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0d9488" stopOpacity={0.35} /><stop offset="95%" stopColor="#0d9488" stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} interval={4} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 16, border: '1px solid #e5e7eb', fontSize: 12 }} labelFormatter={(label) => `Le ${label}`} />
                <Area type="monotone" dataKey="visits" name="Visites" stroke="#1e3a8a" strokeWidth={2.5} fill="url(#visits)" />
                <Area type="monotone" dataKey="uniqueVisitors" name="Visiteurs" stroke="#0d9488" strokeWidth={2.5} fill="url(#visitors)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
          <h2 className="text-base font-black text-[#111827]">Par plateforme</h2>
          <p className="text-xs text-[#6b7280]">Site web, application mobile, application de bureau.</p>
          <div className="mt-2 h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={platformData} dataKey="value" nameKey="name" innerRadius={48} outerRadius={70} paddingAngle={3} stroke="none">
                  {platformData.map((entry) => <Cell key={entry.name} fill={PLATFORM_COLORS[entry.name] ?? '#94a3b8'} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 16, border: '1px solid #e5e7eb', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="space-y-2">
            {platformData.map(({ name, value }) => {
              const Icon = platformIcon[name as keyof typeof platformIcon] ?? Globe
              const share = platformTotal ? Math.round((value / platformTotal) * 100) : 0
              return (
                <li key={name} className="flex items-center gap-3 text-sm">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl text-white" style={{ background: PLATFORM_COLORS[name] }}><Icon className="h-4 w-4" /></span>
                  <span className="flex-1 font-bold capitalize text-[#111827]">{name === 'web' ? 'Site web' : name === 'mobile' ? 'Application mobile' : 'Application desktop'}</span>
                  <span className="font-black text-[#111827]">{value}</span>
                  <span className="w-10 text-right text-xs text-[#6b7280]">{share} %</span>
                </li>
              )
            })}
          </ul>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
          <h2 className="text-base font-black text-[#111827]">Par appareil</h2>
          <p className="text-xs text-[#6b7280]">Téléphone, tablette, ordinateur (d’après le navigateur).</p>
          <div className="mt-4 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deviceData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(name: string) => ({ mobile: 'Téléphone', tablet: 'Tablette', desktop: 'Ordinateur', other: 'Autre' }[name] ?? name)} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 16, border: '1px solid #e5e7eb', fontSize: 12 }} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="value" name="Visites" radius={[10, 10, 0, 0]}>
                  {deviceData.map((entry) => <Cell key={entry.name} fill={DEVICE_COLORS[entry.name] ?? '#94a3b8'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm xl:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-[#111827]">Dernières visites</h2>
              <p className="text-xs text-[#6b7280]">Les {recent.length} plus récentes — page d’entrée, appareil, navigateur, provenance.</p>
            </div>
          </div>
          {recent.length === 0 ? (
            <div className="py-6"><UniOops pose="search" size={110} title="Encore personne" description="Les visites apparaîtront ici dès que quelqu’un ouvrira le site ou une application." /></div>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-[11px] font-black uppercase tracking-wider text-[#6b7280]">
                    <th className="pb-2 pr-3">Quand</th>
                    <th className="pb-2 pr-3">Plateforme</th>
                    <th className="pb-2 pr-3">Appareil</th>
                    <th className="pb-2 pr-3">Page d’entrée</th>
                    <th className="pb-2 pr-3">Navigateur · Système</th>
                    <th className="pb-2 pr-3">Provenance</th>
                    <th className="pb-2 text-right">Pages</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1f5f9]">
                  {recent.map((visit) => <VisitRow key={visit.id} visit={visit} />)}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function VisitRow({ visit }: { visit: RecentVisit }) {
  const PlatformIcon = platformIcon[visit.platform] ?? Globe
  const DeviceIcon = deviceIcon[visit.device] ?? Activity
  return (
    <tr className="text-[#111827]">
      <td className="py-2.5 pr-3 whitespace-nowrap text-xs text-[#6b7280]" title={new Date(visit.at).toLocaleString('fr-FR')}>{relative(visit.lastSeen || visit.at)}</td>
      <td className="py-2.5 pr-3"><span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold text-white" style={{ background: PLATFORM_COLORS[visit.platform] }}><PlatformIcon className="h-3 w-3" />{visit.platform}</span></td>
      <td className="py-2.5 pr-3"><span className="inline-flex items-center gap-1.5 text-xs font-semibold"><DeviceIcon className="h-3.5 w-3.5 text-[#6b7280]" />{{ mobile: 'Téléphone', tablet: 'Tablette', desktop: 'Ordinateur', other: 'Autre' }[visit.device]}</span></td>
      <td className="py-2.5 pr-3 font-mono text-xs">{visit.path || '/'}</td>
      <td className="py-2.5 pr-3 text-xs">{[visit.browser, visit.os].filter(Boolean).join(' · ') || '—'}</td>
      <td className="py-2.5 pr-3 text-xs text-[#6b7280]">{visit.referrer || 'Accès direct'}{visit.authenticated && <span className="ml-2 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-black text-emerald-700">connecté</span>}</td>
      <td className="py-2.5 text-right font-black">{visit.pageViews}</td>
    </tr>
  )
}
