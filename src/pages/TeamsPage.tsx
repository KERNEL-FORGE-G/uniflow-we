import { useState } from 'react'
import { Mail, Code2, Smartphone, Server, Database, Crown, Laptop, Users, Github, ExternalLink, Sparkles, CheckCircle2 } from 'lucide-react'
import { LandingNavbar, LandingFooter } from '../components/layout/LandingLayout'
import { getAvatarUrl, handleAvatarError } from '../utils/avatarUtils'

interface TeamMember {
  id: string
  name: string
  github: string
  email: string
  team: 'Leadership' | 'Frontend' | 'Backend'
  subTeam: string
  role: string
  icon: any
  badge: string
  badgeColor: string
}

const teamMembers: TeamMember[] = [
  {
    id: 'ravel',
    name: 'NGHOMSI FEUKOUO RAVEL',
    github: 'Archlord12345',
    email: 'ravelnghomsi@gmail.com',
    team: 'Leadership',
    subTeam: 'Architecture & Direction',
    role: 'Chef de projet & Architecte',
    icon: Crown,
    badge: 'Lead Architect',
    badgeColor: 'bg-blue-100 text-[#1e3a8a] border-blue-200',
  },
  {
    id: 'aliya',
    name: 'Aliyatou Rachid Oumou Tourab',
    github: 'aliya-nadi',
    email: 'oumou.aliyatou@facsciences-uy1.cm',
    team: 'Frontend',
    subTeam: 'Frontend Desktop & Web',
    role: 'Frontend Developer',
    icon: Code2,
    badge: 'Web Desktop',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
  },
  {
    id: 'judith',
    name: 'Mandeng Judith Oceanne',
    github: 'oceannemj',
    email: 'judithoceanne12@gmail.com',
    team: 'Frontend',
    subTeam: 'Frontend Mobile App',
    role: 'Mobile Developer',
    icon: Smartphone,
    badge: 'Mobile App',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
  {
    id: 'william',
    name: 'Meli William',
    github: 'WilliamMeli-27',
    email: 'meliwilliam27@gmail.com',
    team: 'Backend',
    subTeam: 'Backend APIs & BD',
    role: 'Backend Developer',
    icon: Server,
    badge: 'Backend & DB',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  {
    id: 'sandra',
    name: 'FEBNCHAK M. Borelle Sandra',
    github: 'FEBNCHAK',
    email: 'sandraborelle0@gmail.com',
    team: 'Frontend',
    subTeam: 'Frontend Mobile App',
    role: 'Mobile Developer',
    icon: Smartphone,
    badge: 'Mobile App',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
  {
    id: 'hassane',
    name: 'HASSANE YOUSSOUF OUMAR',
    github: 'hawadja1',
    email: 'h.hawadja1@gmail.com',
    team: 'Backend',
    subTeam: 'Backend Microservices',
    role: 'Backend Developer',
    icon: Server,
    badge: 'NestJS Backend',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
  },
  {
    id: 'ange',
    name: 'Mokam Ange',
    github: 'Ange55-star',
    email: 'ange.mokam@facsciences-uy1.cm',
    team: 'Backend',
    subTeam: 'SGBD & Infrastructure',
    role: 'Backend Developer',
    icon: Database,
    badge: 'Database Architect',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  {
    id: 'aristide',
    name: 'EMTCHEU ARISTIDE BIENVENU',
    github: 'paccotiktok37',
    email: 'paccotiktok37@gmail.com',
    team: 'Frontend',
    subTeam: 'Frontend Interactif',
    role: 'Full Frontend Developer',
    icon: Code2,
    badge: 'Full Frontend',
    badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  },
  {
    id: 'juvenal',
    name: 'SINENG KENGNI JUVENAL',
    github: 'skjuv',
    email: 'sinengjuvenal@gmail.com',
    team: 'Frontend',
    subTeam: 'Multiplateforme',
    role: 'Frontend Developer',
    icon: Code2,
    badge: 'Fullstack UI',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  },
]

type FilterCategory = 'Tous' | 'Leadership' | 'Frontend' | 'Backend'

export default function TeamsPage() {
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('Tous')

  const filteredMembers = teamMembers.filter(m => {
    if (activeFilter === 'Tous') return true
    return m.team === activeFilter
  })

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
            {[
              { label: 'Membres au total', val: '9', icon: Users, color: 'text-[#1e3a8a] bg-blue-50' },
              { label: 'Ingénieurs Frontend', val: '5', icon: Laptop, color: 'text-purple-700 bg-purple-50' },
              { label: 'Ingénieurs Backend & BD', val: '3', icon: Server, color: 'text-[#0d9488] bg-teal-50' },
              { label: 'Lead & Architecture', val: '1', icon: Crown, color: 'text-amber-700 bg-amber-50' },
            ].map(s => {
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
            {(['Tous', 'Leadership', 'Frontend', 'Backend'] as FilterCategory[]).map(cat => (
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

        {/* Member Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map(m => {
            const Icon = m.icon
            return (
              <div
                key={m.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-blue-400 transition-all p-6 flex flex-col justify-between"
              >
                <div>
                  {/* Header Row */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="relative">
                      <img
                        src={getAvatarUrl(m.name, m.github)}
                        alt={m.name}
                        loading="lazy"
                        decoding="async"
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-100 bg-slate-100 shadow-xs"
                        onError={(e) => handleAvatarError(e, m.name)}
                      />
                    </div>
                    <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg border ${m.badgeColor}`}>
                      <Icon className="h-3 w-3" />
                      {m.badge}
                    </span>
                  </div>

                  {/* Title & Info */}
                  <h3 className="text-base font-extrabold text-slate-900 leading-snug mb-1">{m.name}</h3>
                  <p className="text-xs font-semibold text-[#1e3a8a] mb-0.5">{m.role}</p>
                  <p className="text-[11px] font-medium text-slate-400 mb-6">{m.subTeam}</p>
                </div>

                {/* Footer Buttons */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <a
                    href={`https://github.com/${m.github}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-800 hover:text-white text-slate-700 text-xs font-bold transition-all"
                  >
                    <Github className="h-3.5 w-3.5" />
                    <span>@{m.github}</span>
                  </a>

                  <a
                    href={`mailto:${m.email}`}
                    title={m.email}
                    className="p-2 rounded-lg border border-slate-200 hover:border-blue-600 hover:text-blue-600 text-slate-500 transition-colors"
                  >
                    <Mail className="h-4 w-4" />
                  </a>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Tech Stack Banner */}
      <section className="bg-white border-y border-slate-200 py-12">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <span className="text-xs font-black uppercase text-blue-700 tracking-wider bg-blue-50 px-3 py-1 rounded-full inline-block mb-3">
            Stack Technique Projet
          </span>
          <h2 className="text-2xl font-black text-slate-900 mb-6">Conçu avec les meilleures technologies web</h2>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {[
              'React 18', 'TypeScript', 'Tailwind CSS', 'PWA Offline-First', 'SQLite / IndexedDB',
              'NestJS API', 'Express Backend', 'WebSockets', 'QR Code Engine'
            ].map(tech => (
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
