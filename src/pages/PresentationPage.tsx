import { Link } from 'react-router-dom'
import { Play, ExternalLink, CheckCircle, ArrowRight, GraduationCap, UserCheck, Megaphone, Settings, Microscope, Wifi, Smartphone, Lock, Lightbulb, BookOpen, ListChecks, Target } from 'lucide-react'
import { LandingNavbar, LandingFooter } from '../components/layout/LandingLayout'

const agenda = [
  { icon: GraduationCap, title: 'Interface étudiante', desc: 'Gestion des cours, devoirs, notes et emploi du temps' },
  { icon: UserCheck, title: 'Espace enseignant', desc: 'Création de cours, gestion des présences, notation' },
  { icon: Megaphone, title: 'Rôle délégué', desc: 'Prise de présences, exports, communication classe' },
  { icon: Settings, title: 'Panneau admin', desc: 'Gestion des salles, statistiques, utilisateurs' },
  { icon: Microscope, title: 'UniFlow Sentinelle', desc: 'Extension IoT avec modules Santé et Vigie' },
]

const highlights = [
  { icon: Wifi, title: 'Offline First', desc: 'Fonctionne même sans connexion Internet' },
  { icon: Smartphone, title: 'Multi-plateforme', desc: 'Web, Mobile iOS/Android, Desktop' },
  { icon: Lock, title: 'Sécurisé', desc: 'JWT + RBAC, multi-rôles' },
  { icon: Lightbulb, title: 'Bas coût', desc: 'Architecture légère adaptée au terrain africain' },
  { icon: BookOpen, title: 'Open Source', desc: 'Licence MIT, GitHub public' },
]

export default function PresentationPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <LandingNavbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1e3a8a] via-[#2d4fa8] to-[#0d9488] py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/20 px-3 py-1 text-xs font-semibold text-white mb-5">
            <Play className="h-3 w-3" /> Présentation officielle UniFlow
          </span>
          <div className="mx-auto mb-4 flex justify-center">
            <img src="/logos/mascotte.png" alt="UniFlow" className="h-24 w-24 object-contain drop-shadow-2xl animate-float" />
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-4">Découvrez UniFlow en action</h1>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto">
            Une démonstration complète de la plateforme universitaire intelligente
          </p>
        </div>
      </section>

      {/* Video */}
      <section className="bg-[#0f172a] py-10">
        <div className="mx-auto max-w-5xl px-6">
          <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/10">
            <div className="relative aspect-video bg-black">
              <video
                controls
                className="w-full h-full"
                preload="metadata"
              >
                <source src="/video/uniflow-presentation.mp4" type="video/mp4" />
                <div className="flex items-center justify-center h-full text-white/60 text-sm">
                  Votre navigateur ne supporte pas la lecture vidéo.
                </div>
              </video>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-4">
            <a href="https://uniflow.kernelforge.codes" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors">
              uniflow.kernelforge.codes <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* Au programme */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-[1920px] px-6">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <h2 className="text-2xl font-extrabold text-[#111827] mb-6 flex items-center gap-2">
                <ListChecks className="h-6 w-6 text-[#1e3a8a]" /> Au programme
              </h2>
              <div className="space-y-3">
                {agenda.map((a, i) => {
                  const Icon = a.icon
                  return (
                    <div key={a.title} className="flex items-start gap-4 rounded-xl border border-[#e5e7eb] p-4 hover:bg-[#f9fafb] transition-colors">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#eff3ff] text-[#1e3a8a]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#9ca3af] uppercase tracking-wider">Partie {i + 1}</span>
                        <p className="font-semibold text-[#111827] text-sm">{a.title}</p>
                        <p className="text-xs text-[#6b7280] mt-0.5">{a.desc}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-extrabold text-[#111827] mb-6 flex items-center gap-2">
                <Target className="h-6 w-6 text-[#1e3a8a]" /> Points clés
              </h2>
              <div className="space-y-3">
                {highlights.map(h => {
                  const Icon = h.icon
                  return (
                    <div key={h.title} className="flex items-start gap-4 rounded-xl border border-[#e5e7eb] p-4">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f0fdfa] text-[#0d9488]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-[#111827] text-sm">{h.title}</p>
                        <p className="text-xs text-[#6b7280] mt-0.5">{h.desc}</p>
                      </div>
                      <CheckCircle className="h-4 w-4 text-[#0d9488] ml-auto shrink-0 mt-0.5" />
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#1e3a8a] py-14 text-center">
        <div className="mx-auto max-w-2xl px-6">
          <h2 className="text-2xl font-extrabold text-white mb-4">Prêt à l'essayer ?</h2>
          <p className="text-blue-200 mb-8">Accédez à la démo interactive et explorez toutes les fonctionnalités.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/app" className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-bold text-[#1e3a8a] hover:bg-blue-50 transition-all shadow-xl">
              Explorer la démo <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/login" className="inline-flex items-center gap-2 rounded-xl border-2 border-white/30 px-8 py-3.5 text-sm font-bold text-white hover:bg-white/10 transition-all">
              Se connecter
            </Link>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  )
}
