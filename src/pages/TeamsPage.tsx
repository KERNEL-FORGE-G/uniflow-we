import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ExternalLink, Github, MessageCircle, WifiOff } from 'lucide-react'
import { LandingNavbar, LandingFooter } from '../components/layout/LandingLayout'
import { TeamGrid, TeamMemberCardSkeleton } from '../components/team/TeamMemberCard'
import { ActionResult } from '../components/feedback/ActionResult'
import { Container } from '../components/layout/Page'
import { listTeamMembers, type TeamMemberDocument } from '../lib/appwrite'
import {
  COVERAGE_UNIVERSITY,
  KERNEL_FORGE_GITHUB_URL,
  KERNEL_FORGE_WHATSAPP_GROUP_URL,
} from '../lib/contactInfo'
import { MascotDialogue } from '../components/mascot/ArchlordMascot'
import { DEFAULT_TEAM_ROSTER } from '../lib/teamModel'

/**
 * Page publique de l'équipe.
 *
 * Redesign 2026-10-04 :
 * - Hero compact avec titre en dégradé teal→amber sur fond #1e3a8a
 * - Statistiques clés (membres, filières, UY1) en ligne
 * - Grille de cartes membres avec photo réelle depuis Appwrite
 * - Section sombre KERNEL FORGE avec CTA WhatsApp + GitHub
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
      .then((docs) => {
        if (!cancelled) {
          setMembers(docs.length > 0 ? docs : (DEFAULT_TEAM_ROSTER as unknown as TeamMemberDocument[]))
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.warn("Appwrite team_members non disponible, affichage du roster KERNEL FORGE:", err)
          setMembers(DEFAULT_TEAM_ROSTER as unknown as TeamMemberDocument[])
        }
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [attempt])

  return (
    <div className="min-h-screen bg-[#f0f4fa] font-sans text-slate-900 dark:bg-[#0d1117] dark:text-white">
      <LandingNavbar />

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#1e3a8a] py-20 text-white sm:py-28">
        {/* Cercles décoratifs */}
        <span className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-[#14b8a8]/20" aria-hidden />
        <span className="pointer-events-none absolute -bottom-16 right-1/3 h-56 w-56 rounded-full bg-[#f59e0b]/15" aria-hidden />
        <span className="pointer-events-none absolute left-1/4 top-8 h-2 w-32 bg-[repeating-linear-gradient(90deg,rgba(255,255,255,0.12)_0_4px,transparent_4px_12px)]" aria-hidden />

        <Container>
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            {/* Texte gauche */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-xl"
            >
              <span className="inline-block rounded-full bg-white/15 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#14b8a8]">
                Notre équipe
              </span>
              <h1 className="mt-4 text-5xl font-black tracking-tight sm:text-6xl">
                Les{' '}
                <span className="bg-gradient-to-r from-[#14b8a8] to-[#f59e0b] bg-clip-text text-transparent">
                  bâtisseurs
                </span>
                <br />
                d'UniFlow
              </h1>
              <p className="mt-5 text-base font-medium leading-7 text-blue-100">
                KERNEL FORGE — {members.length > 0 ? `${members.length} ` : ''}étudiantes et
                étudiants de l'{COVERAGE_UNIVERSITY.replace(/^Université /, 'université ')} qui
                conçoivent UniFlow depuis leur propre campus.
              </p>

              {/* Stats en ligne */}
              {members.length > 0 && (
                <div className="mt-8 flex flex-wrap gap-5">
                  {[
                    { label: 'Membres', value: members.length },
                    { label: 'Pôles', value: new Set(members.map((m) => m.subTeam).filter(Boolean)).size || '—' },
                    { label: 'Université', value: 'UY1' },
                  ].map((stat) => (
                    <div key={stat.label} className="flex flex-col">
                      <span className="text-3xl font-black text-white">{stat.value}</span>
                      <span className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-blue-200">
                        {stat.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Dialogue mascotte */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-sm rounded-3xl border border-white/15 bg-white/10 p-5 lg:self-start"
            >
              <MascotDialogue
                tone="dark"
                size={110}
                lines={[
                  {
                    who: 'archlord',
                    text: "Voici l'équipe. Chaque carte vient directement de notre base Appwrite.",
                    archlordPose: 'pointing',
                  },
                  {
                    who: 'uni',
                    text: 'Et moi je suis le seul membre qui ne dort jamais !',
                    uniPose: 'wave',
                  },
                  {
                    who: 'archlord',
                    text: "On est étudiants à l'UY1 et KERNEL FORGE est la startup qu'on bâtit ensemble.",
                    archlordPose: 'explain',
                  },
                ]}
              />
            </motion.div>
          </div>
        </Container>

        {/* Vague de séparation */}
        <svg
          aria-hidden
          viewBox="0 0 1440 48"
          preserveAspectRatio="none"
          className="absolute -bottom-px left-0 w-full text-[#f0f4fa] dark:text-[#0d1117]"
        >
          <path fill="currentColor" d="M0,32 C360,0 1080,64 1440,32 L1440,48 L0,48 Z" />
        </svg>
      </section>

      {/* ── Grille des membres ─────────────────────────────────── */}
      <section className="py-16 sm:py-20">
        <Container>
          {loading && (
            <div
              className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 lg:gap-10"
              aria-busy="true"
              aria-label="Chargement de l'équipe"
            >
              {Array.from({ length: 8 }).map((_, i) => (
                <TeamMemberCardSkeleton key={i} index={i} />
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="mx-auto max-w-xl rounded-3xl bg-white p-2 text-slate-800 shadow-xl dark:bg-slate-800 dark:text-white">
              <ActionResult
                status="error"
                icon={WifiOff}
                title="L'équipe n'a pas pu être chargée"
                description="La collection team_members d'Appwrite ne répond pas pour le moment."
                detail={error}
                actions={[{ label: 'Réessayer', onClick: () => setAttempt((v) => v + 1) }]}
              />
            </div>
          )}

          {!loading && !error && members.length > 0 && <TeamGrid members={members} />}

          {!loading && !error && members.length === 0 && (
            <div className="mx-auto flex max-w-md flex-col items-center rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow dark:border-slate-700 dark:bg-slate-800">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e0f2fe] text-[#0369a1]">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <h2 className="mt-4 text-lg font-black">L'équipe se présente bientôt</h2>
              <p className="mt-2 text-sm text-slate-500">
                Les membres sont ajoutés depuis l'administration et apparaîtront ici automatiquement.
              </p>
            </div>
          )}
        </Container>
      </section>

      {/* ── Section KERNEL FORGE ───────────────────────────────── */}
      <section className="bg-[#0b0f19] py-16 text-center text-white sm:py-20">
        <Container width="narrow">
          <span className="inline-block rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#14b8a8]">
            À propos
          </span>
          <h2 className="mt-4 text-3xl font-black sm:text-4xl">
            KERNEL FORGE,<br />la startup derrière UniFlow
          </h2>
          <p className="mx-auto mt-4 max-w-prose text-sm leading-7 text-slate-300">
            Née à l'Université de Yaoundé I, KERNEL FORGE construit UniFlow comme son premier produit
            — avec l'ambition de devenir une entreprise de logiciel à part entière, qui livre des
            projets pour des clients de tous secteurs, au Cameroun comme à travers le monde.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href={KERNEL_FORGE_WHATSAPP_GROUP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#25d366] px-7 py-3.5 text-sm font-black text-[#0b0f19] shadow-lg transition hover:-translate-y-0.5 hover:bg-[#f59e0b]"
            >
              <MessageCircle className="h-4 w-4" />
              Rejoindre le groupe WhatsApp
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <a
              href={KERNEL_FORGE_GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#14b8a8] px-7 py-3.5 text-sm font-black text-[#0b0f19] shadow-lg transition hover:-translate-y-0.5 hover:bg-[#f59e0b]"
            >
              <Github className="h-4 w-4" />
              Organisation GitHub
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </Container>
      </section>

      <LandingFooter />
    </div>
  )
}
