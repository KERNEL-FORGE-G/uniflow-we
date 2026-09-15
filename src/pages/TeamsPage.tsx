import { useEffect, useMemo, useState } from 'react'
import { Mail, Code2, Smartphone, Server, Database, Crown, Laptop, Users, Github, ExternalLink, Sparkles, CheckCircle2, Loader2 } from 'lucide-react'
import { LandingNavbar, LandingFooter } from '../components/layout/LandingLayout'
import { TeamMemberAvatar } from '../components/team/TeamMemberAvatar'
import { listTeamMembers, type TeamMemberDocument, type TeamName } from '../lib/appwrite'
import { teamAccentClasses } from '../utils/teamAccent'

type FilterCategory = 'Tous' | TeamName

const FILTERS: FilterCategory[] = ['Tous', 'Leadership', 'Frontend', 'Backend']

/**
 * Icône de la pastille, déduite du rôle faute d'être stockée.
 *
 * L'ancienne liste codée en dur portait une icône par membre (`Crown`, `Server`,
 * `Database`…). Plutôt que d'ajouter un attribut en base pour un détail
 * purement décoratif — et qu'un administrateur devrait renseigner à la main —
 * on la retrouve depuis la sous-équipe, ce qui donne exactement les mêmes
 * icônes que la liste figée pour les neuf membres actuels.
 */
function memberIcon(member: TeamMemberDocument) {
  const haystack = `${member.subTeam} ${member.role}`
  if (/sgbd|base de donn|\bbdd?\b|database/i.test(haystack)) return Database
  if (/mobile|android|ios/i.test(haystack)) return Smartphone
  if (member.team === 'Leadership') return Crown
  if (member.team === 'Backend') return Server
  return Code2
}

/** Les neuf technologies du bandeau, qui ne dépendent pas de l'équipe. */
const TECH_STACK = [
  'React 18', 'TypeScript', 'Tailwind CSS', 'PWA Offline-First', 'SQLite / IndexedDB',
  'NestJS API', 'Express Backend', 'WebSockets', 'QR Code Engine',
]

export default function TeamsPage() {
  const [members, setMembers] = useState<TeamMemberDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('Tous')

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const documents = await listTeamMembers()
        if (!cancelled) setMembers(documents)
      } catch (exception) {
        if (!cancelled) setError(exception instanceof Error ? exception.message : "L'équipe n'a pas pu être chargée.")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  // Les tuiles de statistiques étaient écrites en dur (« 9 », « 5 », « 3 »,
  // « 1 ») : elles suivent maintenant la liste, sinon ajouter un membre depuis
  // l'administration laisserait la page se contredire elle-même.
  const stats = useMemo(() => ([
    { label: 'Membres au total', val: members.length, icon: Users, color: 'text-[#1e3a8a] bg-blue-50' },
    { label: 'Ingénieurs Frontend', val: members.filter(m => m.team === 'Frontend').length, icon: Laptop, color: 'text-purple-700 bg-purple-50' },
    { label: 'Ingénieurs Backend & BD', val: members.filter(m => m.team === 'Backend').length, icon: Server, color: 'text-[#0d9488] bg-teal-50' },
    { label: 'Lead & Architecture', val: members.filter(m => m.team === 'Leadership').length, icon: Crown, color: 'text-amber-700 bg-amber-50' },
  ]), [members])

  const filteredMembers = members.filter(m => activeFilter === 'Tous' || m.team === activeFilter)

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 selection:bg-blue-600 selection:text-white">
      <LandingNavbar />

      {/* Hero Banner */}
      <section className="relative bg-gradient-to-br from-[#1e3a8a] via-[#1e40af] to-[#0d9488] pt-28 pb-16 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[linear-[#ffffff08_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        <div className="relative mx-auto max-w-5xl px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md px-4 py-1.5 text-xs font-bold text-white mb-6 border border-white/20">
            <Code2 className="h-4 w-4 text-teal-300" /> KERNEL FORGE — Université de Yaoundé I
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-4">
            L'Équipe KERNEL FORGE
          </h1>
          <p className="text-base sm:text-lg text-blue-100 max-w-2xl mx-auto leading-relaxed font-medium">
            Les développeurs et ingénieurs passionnés qui ont conçu UniFlow pour transformer la gestion académique universitaire en Afrique.
          </p>
        </div>
      </section>

      {/* Stats Summary Bar */}
      <section className="border-b border-slate-200 bg-white py-8 shadow-xs">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            {stats.map(s => {
              const Icon = s.icon
              return (
                <div key={s.label} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col items-center justify-center">
                  <div className={`mb-2 p-2 rounded-lg ${s.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-2xl font-black text-slate-900">{s.val}</span>
                  <span className="text-xs font-medium text-slate-500 mt-0.5">{s.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Filter Tabs & Members Grid */}
      <section className="py-16 mx-auto max-w-7xl px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10 pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Nos Talents</h2>
            <p className="text-xs text-slate-500 font-medium">Découvrez l'équipe et leurs domaines d'expertise</p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-xs">
            {FILTERS.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-4 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                  activeFilter === cat
                    ? 'bg-[#1e3a8a] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-[#1e3a8a]" />
          </div>
        )}

        {!loading && error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
            L'équipe n'a pas pu être chargée : {error}
          </div>
        )}

        {/* Member Cards Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMembers.map(m => {
              const Icon = memberIcon(m)
              const accent = teamAccentClasses(m.accent)
              return (
                <div
                  key={m.$id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-blue-400 transition-all p-6 flex flex-col justify-between"
                >
                  <div>
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <TeamMemberAvatar
                        avatarFileId={m.avatarFileId}
                        name={m.name}
                        className={`w-16 h-16 rounded-2xl border-2 border-slate-100 shadow-xs ring-2 ring-offset-1 ${accent.ring}`}
                      />
                      {m.badge && (
                        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg border ${accent.badge}`}>
                          <Icon className="h-3 w-3" />
                          {m.badge}
                        </span>
                      )}
                    </div>

                    {/* Title & Info */}
                    <h3 className="text-base font-extrabold text-slate-900 leading-snug mb-1">{m.name}</h3>
                    <p className="text-xs font-semibold text-[#1e3a8a] mb-0.5">{m.role}</p>
                    <p className="text-[11px] font-medium text-slate-400 mb-6">{m.subTeam}</p>
                  </div>

                  {/* Footer Buttons */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                    {m.github ? (
                      <a
                        href={`https://github.com/${m.github}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-800 hover:text-white text-slate-700 text-xs font-bold transition-all"
                      >
                        <Github className="h-3.5 w-3.5" />
                        <span>@{m.github}</span>
                      </a>
                    ) : <span />}

                    {m.email && (
                      <a
                        href={`mailto:${m.email}`}
                        title={m.email}
                        className="p-2 rounded-lg border border-slate-200 hover:border-blue-600 hover:text-blue-600 text-slate-500 transition-colors"
                      >
                        <Mail className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {!loading && !error && filteredMembers.length === 0 && (
          <p className="py-12 text-center text-sm text-slate-400">Aucun membre dans cette catégorie.</p>
        )}
      </section>

      {/* Tech Stack Banner */}
      <section className="bg-white border-y border-slate-200 py-12">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <span className="text-xs font-black uppercase text-blue-700 tracking-wider bg-blue-50 px-3 py-1 rounded-full inline-block mb-3">
            Stack Technique Projet
          </span>
          <h2 className="text-2xl font-black text-slate-900 mb-6">Conçu avec les meilleures technologies web</h2>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {TECH_STACK.map(tech => (
              <span key={tech} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
                <CheckCircle2 className="h-3.5 w-3.5 text-teal-600" />
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] py-14 text-white text-center">
        <div className="mx-auto max-w-2xl px-6">
          <Sparkles className="mx-auto h-8 w-8 text-amber-300 mb-3" />
          <h2 className="text-2xl sm:text-3xl font-black mb-3">Rejoignez l'organisation KERNEL FORGE</h2>
          <p className="text-xs sm:text-sm text-blue-100 mb-6 font-medium">
            Projet open source développé avec passion pour la communauté académique.
          </p>
          <div className="flex items-center justify-center gap-4">
            <a
              href="https://github.com/KERNEL-FORGE-G"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-[#1e3a8a] font-black text-xs hover:bg-blue-50 transition-all shadow-md"
            >
              <Github className="h-4 w-4" />
              Organisation GitHub
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  )
}
