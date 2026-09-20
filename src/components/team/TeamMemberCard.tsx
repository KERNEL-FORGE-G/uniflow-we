import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Github, Globe, Linkedin, Mail, Quote, type LucideIcon } from 'lucide-react'
import type { TeamMemberDocument } from '@/lib/appwrite'
import { sortTeamMembers, staggerOffsetClass, teamMemberBlurb, teamMemberLinks, type TeamLink } from '@/lib/teamModel'
import { EASE } from '@/components/motion/PageTransition'
import { cn } from '@/utils/cn'
import { TeamMemberAvatar } from './TeamMemberAvatar'

const LINK_ICONS: Record<TeamLink['kind'], LucideIcon> = { github: Github, linkedin: Linkedin, website: Globe, email: Mail }

/** Pentagone : bord inférieur en pointe, comme sur la maquette du propriétaire. */
const CARD_CLIP = 'polygon(0 0, 100% 0, 100% 88%, 50% 100%, 0 88%)'

/**
 * Carte d'un membre, fidèle à la référence visuelle du propriétaire
 * (2026-09-20) : carte noire à pointe basse, grande photo carrée pleine
 * largeur, nom en gras blanc, courte bio grise, bouton rond jaune avec flèche
 * qui ouvre les liens du membre. Toutes les données viennent de `team_members`.
 */
export function TeamMemberCard({ member, index = 0 }: { member: TeamMemberDocument; index?: number }) {
  const reduced = useReducedMotion()
  const links = teamMemberLinks(member)
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Un seul lien : la flèche l'ouvre directement ; plusieurs : petit menu.
  const single = links.length === 1 ? links[0] : null

  useEffect(() => {
    if (!open) return
    const onDocClick = (event: MouseEvent) => { if (!menuRef.current?.contains(event.target as Node)) setOpen(false) }
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDocClick); document.removeEventListener('keydown', onKey) }
  }, [open])

  return (
    <motion.article
      data-testid="team-card"
      data-slug={member.slug}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.55, ease: EASE, delay: Math.min(index % 3, 2) * 0.1 }}
      whileHover={reduced ? undefined : { y: -8 }}
      className={cn('group relative flex flex-col border border-[#243049] bg-[#0b0f19] pb-14 text-white shadow-[0_24px_60px_-20px_rgba(21,42,102,0.35)] transition-shadow duration-300 hover:shadow-[0_32px_70px_-20px_rgba(21,42,102,0.55)]', staggerOffsetClass(index))}
      style={{ clipPath: CARD_CLIP, WebkitClipPath: CARD_CLIP }}
    >
      {/* Photo carrée pleine largeur, marge égale des trois côtés (maquette). */}
      <div className="px-4 pt-4">
        <div className="aspect-square w-full overflow-hidden bg-[#111827]">
          <TeamMemberAvatar
            avatarFileId={member.avatarFileId}
            name={member.name}
            iconClassName="h-1/3 w-1/3"
            className="h-full w-full bg-[#111827] text-slate-500 transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col px-4 pt-4">
        <h3 className="text-base font-bold leading-snug text-[#f8fafc]">{member.name}</h3>
        <p className="mt-2 flex items-start gap-1.5 text-[11px] leading-[1.5] text-[#cbd5e1]">
          <Quote aria-hidden className="mt-0.5 h-3 w-3 shrink-0 fill-current text-[#14b8a8]" />
          <span className="line-clamp-4">{teamMemberBlurb(member)}</span>
        </p>

        <div ref={menuRef} className="relative mt-4">
          {single ? (
            <a
              href={single.href}
              target={single.kind === 'email' ? undefined : '_blank'}
              rel="noopener noreferrer"
              aria-label={`${single.label} — ${member.name}`}
              className={arrowButtonClass}
            >
              <ArrowRight className="h-5 w-5" strokeWidth={2.5} />
            </a>
          ) : (
            <button
              type="button"
              disabled={links.length === 0}
              aria-haspopup="menu"
              aria-expanded={open}
              aria-label={links.length === 0 ? `${member.name} — aucun lien public` : `Liens de ${member.name}`}
              onClick={() => setOpen((value) => !value)}
              className={cn(arrowButtonClass, links.length === 0 && 'cursor-default opacity-40 hover:translate-x-0')}
            >
              <ArrowRight className={cn('h-5 w-5 transition-transform', open && 'rotate-90')} strokeWidth={2.5} />
            </button>
          )}

          <AnimatePresence>
            {open && links.length > 1 && (
              <motion.ul
                role="menu"
                initial={{ opacity: 0, y: 6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.96 }}
                transition={{ duration: 0.18 }}
                className="absolute bottom-full left-0 z-10 mb-2 flex min-w-[10rem] flex-col overflow-hidden rounded-2xl border border-[#243049] bg-[#111827] p-1.5 shadow-2xl"
              >
                {links.map((link) => {
                  const Icon = LINK_ICONS[link.kind]
                  return (
                    <li key={link.kind} role="none">
                      <a role="menuitem" href={link.href} target={link.kind === 'email' ? undefined : '_blank'} rel="noopener noreferrer" onClick={() => setOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-200 transition hover:bg-white/10 hover:text-[#14b8a8] focus:outline-none focus-visible:bg-white/10">
                        <Icon className="h-4 w-4" /> {link.label}
                      </a>
                    </li>
                  )
                })}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.article>
  )
}

const arrowButtonClass = 'inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#14b8a8] text-[#0b0f19] shadow-[0_8px_20px_-6px_rgba(20,184,168,0.6)] transition-all hover:translate-x-1 hover:bg-[#f59e0b] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#14b8a8]/40 disabled:hover:translate-x-0'

/** Grille de la page : trois colonnes, deux sur tablette, une sur mobile, cartes en escalier. */
export function TeamGrid({ members }: { members: TeamMemberDocument[] }) {
  return (
    <div data-testid="team-grid" className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-10">
      {sortTeamMembers(members).map((member, index) => <TeamMemberCard key={member.$id} member={member} index={index} />)}
    </div>
  )
}

export function TeamMemberCardSkeleton({ index = 0 }: { index?: number }) {
  return (
    <div aria-hidden className={cn('flex flex-col border border-[#243049] bg-[#0b0f19]/80 pb-14', staggerOffsetClass(index))} style={{ clipPath: CARD_CLIP, WebkitClipPath: CARD_CLIP }}>
      <div className="px-4 pt-4"><div className="aspect-square w-full animate-pulse bg-slate-800" /></div>
      <div className="space-y-3 px-4 pt-4">
        <div className="h-4 w-2/3 animate-pulse rounded bg-slate-700" />
        <div className="space-y-1.5 pt-1">
          <div className="h-2.5 w-full animate-pulse rounded bg-slate-800" />
          <div className="h-2.5 w-11/12 animate-pulse rounded bg-slate-800" />
          <div className="h-2.5 w-3/4 animate-pulse rounded bg-slate-800" />
        </div>
        <div className="h-10 w-10 animate-pulse rounded-full bg-[#14b8a8]/30" />
      </div>
    </div>
  )
}
