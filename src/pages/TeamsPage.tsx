import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ExternalLink, Github, MessageCircle, UsersRound, WifiOff } from 'lucide-react'
import { LandingNavbar, LandingFooter } from '../components/layout/LandingLayout'
import { TeamGrid, TeamMemberCardSkeleton } from '../components/team/TeamMemberCard'
import { ActionResult } from '../components/feedback/ActionResult'
import { Container } from '../components/layout/Page'
import { listTeamMembers, type TeamMemberDocument } from '../lib/appwrite'
import { COVERAGE_UNIVERSITY, KERNEL_FORGE_GITHUB_URL, KERNEL_FORGE_WHATSAPP_GROUP_URL } from '../lib/contactInfo'
import { MascotDialogue } from '../components/mascot/ArchlordMascot'

/**
 * Page publique de l'équipe, reprise de la référence visuelle du propriétaire
 * (2026-09-20) : section bleu profond décorée, titre en dégradé rose → jaune,
 * cartes noires à pointe basse en escalier. Les membres viennent uniquement de
 * `team_members` (photo dans `uniflow_assets`, silhouette sinon).
 */
export default function TeamsPage() {
  const [members, setMembers] = useState<TeamMemberDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    listTeamMembers()
      .then((documents) => { if (!cancelled) setMembers(documents) })
      .catch((exception) => { if (!cancelled) setError(exception instanceof Error ? exception.message : "L'équipe n'a pas pu être chargée.") })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [attempt])

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-800 dark:bg-[#0b0f19]">
      <LandingNavbar />

      <section className="relative overflow-hidden bg-gradient-to-br from-[#1e3a8a] via-[#2d4fa8] to-[#0d9488] pb-28 pt-16 text-white sm:pt-20 lg:pb-36">
        <TeamDecorations />

        <Container className="relative">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
            <motion.header
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-2xl"
            >
              <h1 className="text-5xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl">
                Notre <span className="bg-gradient-to-r from-[#14b8a8] to-[#f59e0b] bg-clip-text text-transparent">équipe</span>
              </h1>
              <p className="mt-4 max-w-xl text-sm font-medium leading-6 text-blue-100 sm:text-base">
                KERNEL FORGE — {members.length > 0 ? `${members.length} ` : ''}étudiantes et étudiants de l’{COVERAGE_UNIVERSITY.replace(/^Université /, 'université ')} qui conçoivent UniFlow.
              </p>
            </motion.header>

            {/* Le fondateur présente l'équipe avec Uni : les cartes, elles, viennent d'Appwrite */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-md self-center rounded-3xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm lg:self-end"
            >
              <MascotDialogue
                tone="dark"
                size={120}
                lines={[
                  { who: 'archlord', text: 'Voici l’équipe. Chaque carte vient directement de notre base Appwrite, comme tout le reste du site.', archlordPose: 'pointing' },
                  { who: 'uni', text: 'Et moi je suis le seul membre qui ne dort jamais ! Enfin… sauf hors ligne.', uniPose: 'wave' },
                  { who: 'archlord', text: 'On est étudiants à l’UY1, et KERNEL FORGE est la startup qu’on construit ensemble.', archlordPose: 'explain' },
                  { who: 'uni', text: 'Envie de nous rejoindre ? Le groupe WhatsApp est juste en bas de la page.', uniPose: 'pointing' },
                ]}
              />
            </motion.div>
          </div>

          <div className="mt-14 lg:mt-20">
            {loading && (
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-10" aria-busy="true" aria-label="Chargement de l’équipe">
                {Array.from({ length: 6 }).map((_, index) => <TeamMemberCardSkeleton key={index} index={index} />)}
              </div>
            )}

            {!loading && error && (
              <div className="mx-auto max-w-xl rounded-3xl bg-white p-2 text-slate-800">
                <ActionResult
                  status="error"
                  icon={WifiOff}
                  title="L’équipe n’a pas pu être chargée"
                  description="La collection team_members d’Appwrite ne répond pas pour le moment."
                  detail={error}
                  actions={[{ label: 'Réessayer', onClick: () => setAttempt((value) => value + 1) }]}
                />
              </div>
            )}

            {!loading && !error && members.length > 0 && <TeamGrid members={members} />}

            {!loading && !error && members.length === 0 && (
              <div className="mx-auto flex max-w-md flex-col items-center rounded-3xl border border-white/15 bg-white/10 px-6 py-14 text-center backdrop-blur">
                <UsersRound className="h-12 w-12 text-[#14b8a8]" />
                <h2 className="mt-4 text-xl font-black">L’équipe se présente bientôt</h2>
                <p className="mt-2 text-sm text-blue-100">Les membres sont ajoutés depuis l’administration et apparaîtront ici.</p>
              </div>
            )}
          </div>
        </Container>

        <ZigzagConnector />
      </section>

      <section className="bg-[#0b0f19] py-14 text-center text-white">
        <Container width="narrow">
          <h2 className="text-2xl font-black sm:text-3xl">KERNEL FORGE, la startup derrière UniFlow</h2>
          <p className="mt-3 text-sm text-slate-300">Née à l’Université de Yaoundé I, KERNEL FORGE construit UniFlow comme son premier produit — avec l’ambition de devenir une entreprise de logiciel à part entière, qui livre des projets pour des clients de tous secteurs, au Cameroun comme à travers le monde.</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <a
              href={KERNEL_FORGE_WHATSAPP_GROUP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#25d366] px-6 py-3 text-xs font-black text-[#0b0f19] shadow-lg transition hover:translate-y-[-2px] hover:bg-[#f59e0b]"
            >
              <MessageCircle className="h-4 w-4" /> Rejoindre le groupe WhatsApp <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <a
              href={KERNEL_FORGE_GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#14b8a8] px-6 py-3 text-xs font-black text-[#0b0f19] shadow-lg transition hover:translate-y-[-2px] hover:bg-[#f59e0b]"
            >
              <Github className="h-4 w-4" /> Organisation GitHub <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </Container>
      </section>

      <LandingFooter />
    </div>
  )
}

/** Disques, grille de points et rayures de la maquette, dans la palette UniFlow (teal et ambre translucides). */
function TeamDecorations() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="absolute -top-16 right-[18%] h-40 w-40 rounded-full bg-[#14b8a8]/60 sm:h-52 sm:w-52"
      />
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.15, ease: 'easeOut' }}
        className="absolute -bottom-20 right-[-3rem] h-56 w-56 rounded-full bg-[#f59e0b]/55 sm:h-72 sm:w-72"
      />
      <div className="absolute left-4 top-40 h-32 w-32 bg-[radial-gradient(circle,rgba(255,255,255,0.9)_1.5px,transparent_1.5px)] bg-[size:12px_12px] opacity-15 sm:left-10" />
      <div className="absolute right-6 top-[44%] h-40 w-24 bg-[repeating-linear-gradient(135deg,rgba(204,251,241,0.6)_0_2px,transparent_2px_12px)] opacity-60 sm:right-16" />
      <div className="absolute right-[6%] top-8 h-20 w-20 bg-[radial-gradient(circle,rgba(255,255,255,0.9)_1.5px,transparent_1.5px)] bg-[size:10px_10px] opacity-15" />
      <div className="absolute inset-y-0 right-[30%] w-px bg-white/10" />
    </div>
  )
}

/** Trait en zigzag qui relie les pointes des cartes, comme sur la maquette. */
function ZigzagConnector() {
  return (
    <svg aria-hidden viewBox="0 0 1200 60" preserveAspectRatio="none" className="pointer-events-none absolute bottom-10 left-0 h-14 w-full text-white/25">
      <polyline fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="6 8" points="0,30 150,30 200,52 300,8 400,52 500,8 600,52 700,8 800,52 900,8 1000,52 1050,30 1200,30" />
      <circle cx="200" cy="52" r="4" fill="currentColor" /><circle cx="600" cy="52" r="4" fill="currentColor" /><circle cx="1000" cy="52" r="4" fill="currentColor" />
    </svg>
  )
}
