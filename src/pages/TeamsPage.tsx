import { Mail, Code2, Smartphone, Server, Database, Sparkles, Crown, Rocket, Laptop, Users } from 'lucide-react'
import { LandingNavbar, LandingFooter } from '../components/layout/LandingLayout'
import { ScrollFloat } from '../components/ui/ScrollFloat'

interface TeamMember {
  id: string
  name: string
  github: string
  email: string
  team: string
  role: string
  icon: any
  gradient: string
  badge: string
  borderColor: string
}

const teamMembers: TeamMember[] = [
  {
    id: 'ravel',
    name: 'NGHOMSI FEUKOUO RAVEL',
    github: 'Archlord12345',
    email: 'ravelnghomsi@gmail.com',
    team: 'Leadership',
    role: 'Chef de projet & Architecte',
    icon: Crown,
    gradient: 'from-[#1e3a8a] via-[#7c3aed] to-[#0d9488]',
    badge: 'Lead',
    borderColor: 'border-[#1e3a8a]',
  },
  {
    id: 'aliya',
    name: 'Aliyatou Rachid Oumou Tourab',
    github: 'aliya-nadi',
    email: 'oumou.aliyatou@facsciences-uy1.cm',
    team: 'Frontend Desktop',
    role: 'Frontend Developer',
    icon: Code2,
    gradient: 'from-[#7c3aed] to-[#db2777]',
    badge: 'Web',
    borderColor: 'border-purple-500',
  },
  {
    id: 'judith',
    name: 'Mandeng Judith Oceanne',
    github: 'oceannemj',
    email: 'judithoceanne12@gmail.com',
    team: 'Frontend Mobile',
    role: 'Mobile Developer',
    icon: Smartphone,
    gradient: 'from-[#0d9488] to-[#059669]',
    badge: 'Mobile',
    borderColor: 'border-[#0d9488]',
  },
  {
    id: 'william',
    name: 'Meli William',
    github: 'WilliamMeli-27',
    email: 'meliwilliam27@gmail.com',
    team: 'Backend + BD',
    role: 'Backend Developer',
    icon: Server,
    gradient: 'from-[#f59e0b] to-[#d97706]',
    badge: 'Backend',
    borderColor: 'border-amber-500',
  },
  {
    id: 'sandra',
    name: 'FEBNCHAK M. Borelle Sandra',
    github: 'FEBNCHAK',
    email: 'sandraborelle0@gmail.com',
    team: 'Frontend Mobile',
    role: 'Mobile Developer',
    icon: Smartphone,
    gradient: 'from-[#0d9488] to-[#059669]',
    badge: 'Mobile',
    borderColor: 'border-[#0d9488]',
  },
  {
    id: 'hassane',
    name: 'HASSANE YOUSSOUF OUMAR',
    github: 'h-hawadja1',
    email: 'h.hawadja1@gmail.com',
    team: 'Backend NestJS',
    role: 'Backend Developer',
    icon: Server,
    gradient: 'from-[#ef4444] to-[#dc2626]',
    badge: 'NestJS',
    borderColor: 'border-red-500',
  },
  {
    id: 'ange',
    name: 'Mokam Ange',
    github: 'Ange55-star',
    email: 'ange.mokam@facsciences-uy1.cm',
    team: 'Backend + BD',
    role: 'Backend Developer',
    icon: Database,
    gradient: 'from-[#f59e0b] to-[#d97706]',
    badge: 'Database',
    borderColor: 'border-amber-500',
  },
  {
    id: 'aristide',
    name: 'EMTCHEU ARISTIDE BIENVENU',
    github: 'paccotiktok37',
    email: 'paccotiktok37@gmail.com',
    team: 'Frontend Full',
    role: 'Full Frontend Developer',
    icon: Code2,
    gradient: 'from-[#06b6d4] to-[#0891b2]',
    badge: 'Full Frontend',
    borderColor: 'border-cyan-500',
  },
  {
    id: 'juvenal',
    name: 'SINENG KENGNI JUVENAL',
    github: 'skjuv',
    email: 'sinengjuvenal@gmail.com',
    team: 'Frontend Desktop & Mobile',
    role: 'Frontend Developer',
    icon: Code2,
    gradient: 'from-[#8b5cf6] to-[#6366f1]',
    badge: 'Full Stack Frontend',
    borderColor: 'border-indigo-500',
  },
]

export default function TeamsPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <LandingNavbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1e3a8a] to-[#0d9488] py-20">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/20 px-3 py-1 text-xs font-semibold text-white mb-6 animate-fade-in">
            <Code2 className="h-3 w-3" /> KERNEL FORGE
          </span>
          <div className="mx-auto mb-6 flex justify-center animate-float">
            <img src="/logos/mascotte.png" alt="KERNEL FORGE" className="h-28 w-28 object-contain drop-shadow-2xl" />
          </div>
          <h1 className="text-5xl font-extrabold text-white mb-5 animate-fade-in">L'équipe KERNEL FORGE</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed animate-fade-in">
            Une équipe passionnée d'étudiants en informatique de l'Université de Yaoundé I, unie pour révolutionner l'éducation en Afrique.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-[#e5e7eb] bg-gradient-to-r from-[#f9fafb] to-white py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {[
              { label: 'Membres', value: teamMembers.length.toString(), icon: Users },
              { label: 'Frontend', value: '5', icon: Laptop },
              { label: 'Backend', value: '3', icon: Server },
              { label: 'Leadership', value: '1', icon: Rocket },
            ].map((s, i) => {
              const Icon = s.icon
              return (
                <div key={s.label} className="text-center animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eff3ff] text-[#1e3a8a]">
                    <Icon className="h-6 w-6" />
                  </div>
                  <p className="text-4xl font-extrabold text-[#1e3a8a]">{s.value}</p>
                  <p className="text-sm text-[#6b7280] mt-2 font-medium">{s.label}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Team grid */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-[1920px] px-6">
          <div className="text-center mb-16">
            <ScrollFloat 
              containerClassName="text-4xl font-extrabold text-[#111827] mb-4"
              animationDuration={0.8}
              stagger={0.02}
            >
              Notre équipe
            </ScrollFloat>
            <p className="text-lg text-[#6b7280] max-w-2xl mx-auto">Des étudiants passionnés qui construisent l'avenir de l'éducation numérique</p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {teamMembers.map((member, index) => {
              const Icon = member.icon
              return (
                <div 
                  key={member.id} 
                  className="group relative animate-fade-in hover-lift"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Card */}
                  <div className="relative rounded-3xl border-2 bg-white overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
                    {/* Gradient header with floating icon */}
                    <div className={`relative h-32 bg-gradient-to-br ${member.gradient} overflow-hidden`}>
                      <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-4 right-4 h-20 w-20 rounded-full bg-white/10 blur-2xl" />
                        <div className="absolute bottom-2 left-4 h-16 w-16 rounded-full bg-white/10 blur-xl" />
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Icon className="h-16 w-16 text-white/20" />
                      </div>
                      {/* Badge */}
                      <div className="absolute top-3 right-3">
                        <span className="rounded-full bg-white/20 backdrop-blur-sm border border-white/30 px-3 py-1 text-xs font-bold text-white">
                          {member.badge}
                        </span>
                      </div>
                    </div>

                    {/* Avatar - Grande photo FIXE au centre */}
                    <div className="flex justify-center py-6">
                      <div className={`h-40 w-40 rounded-full border-[6px] border-white bg-white shadow-2xl overflow-hidden ring-4 ${member.borderColor} ring-opacity-50 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                        <img
                          src={`https://github.com/${member.github}.png`}
                          alt={member.name}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=1e3a8a&color=fff&size=256&bold=true`
                          }}
                        />
                      </div>
                    </div>

                    {/* Contenu texte EN BAS */}
                    <div className="px-6 pb-6">
                      <div className="text-center">
                        <h3 className="font-bold text-[#111827] text-lg leading-tight mb-2">{member.name}</h3>
                        <p className="text-sm font-semibold text-[#1e3a8a] mb-1">{member.role}</p>
                        <p className="text-xs text-[#9ca3af] mb-5">{member.team}</p>

                        {/* Links */}
                        <div className="space-y-2.5 mb-4">
                          <a
                            href={`https://github.com/${member.github}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 rounded-xl border-2 border-[#e5e7eb] bg-[#f9fafb] px-4 py-2.5 text-xs font-medium text-[#374151] hover:bg-[#1e3a8a] hover:text-white hover:border-[#1e3a8a] transition-all group/btn"
                          >
                            <svg className="h-4 w-4 group-hover/btn:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                            </svg>
                            <span className="font-semibold">@{member.github}</span>
                          </a>

                          <a
                            href={`mailto:${member.email}`}
                            className="flex items-center justify-center gap-2 text-xs text-[#6b7280] hover:text-[#1e3a8a] transition-colors group/mail"
                          >
                            <Mail className="h-3.5 w-3.5 group-hover/mail:scale-110 transition-transform" />
                            <span className="truncate">{member.email}</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-[#1e3a8a] to-[#0d9488] py-16 text-center">
        <div className="mx-auto max-w-2xl px-6">
          <Sparkles className="mx-auto h-12 w-12 text-white/60 mb-4" />
          <ScrollFloat 
            containerClassName="text-3xl font-extrabold text-white mb-4"
            textClassName="text-white"
            animationDuration={0.8}
            stagger={0.02}
          >
            Rejoignez l'aventure KERNEL FORGE
          </ScrollFloat>
          <p className="text-blue-200 mb-8 text-lg">Contributeurs open source bienvenus !</p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://github.com/KERNEL-FORGE-G"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-sm font-bold text-[#1e3a8a] hover:bg-blue-50 transition-all shadow-xl hover:scale-105"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub Organization
            </a>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-white/30 px-8 py-4 text-sm font-bold text-white hover:bg-white/10 transition-all hover:scale-105"
            >
              <Mail className="h-5 w-5" /> Nous contacter
            </a>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  )
}
