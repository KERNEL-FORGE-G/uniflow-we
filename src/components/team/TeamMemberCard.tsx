import { motion, useReducedMotion } from 'framer-motion'
import { Github, Globe, Linkedin, Mail, type LucideIcon } from 'lucide-react'
import type { TeamMemberDocument } from '@/lib/appwrite'
import { teamAccentClasses } from '@/utils/teamAccent'
import { EASE } from '@/components/motion/PageTransition'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/utils/cn'
import { TeamMemberAvatar } from './TeamMemberAvatar'

const LINK_CLASS = 'inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:-translate-y-0.5 hover:border-[#1e3a8a] hover:text-[#1e3a8a] hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1e3a8a]/40'

/**
 * Carte d'un membre : photo issue du bucket `uniflow_assets`, poste, sous-équipe,
 * bio courte et liens. Toutes les données viennent de `team_members` ; la carte
 * ne connaît aucun membre en dur.
 */
export function TeamMemberCard({ member, icon: Icon, index = 0 }: { member: TeamMemberDocument; icon: LucideIcon; index?: number }) {
  const accent = teamAccentClasses(member.accent)
  const reduced = useReducedMotion()
  const links: { href: string; label: string; icon: LucideIcon }[] = []
  if (member.github) links.push({ href: `https://github.com/${member.github}`, label: `GitHub de ${member.name}`, icon: Github })
  if (member.linkedin) links.push({ href: member.linkedin, label: `LinkedIn de ${member.name}`, icon: Linkedin })
  if (member.website) links.push({ href: member.website, label: `Site de ${member.name}`, icon: Globe })
  if (member.email) links.push({ href: `mailto:${member.email}`, label: `Écrire à ${member.name}`, icon: Mail })

  return (
    <motion.article
      layout
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, ease: EASE, delay: Math.min(index, 8) * 0.06 }}
      whileHover={reduced ? undefined : { y: -6 }}
      className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm transition-shadow duration-300 hover:shadow-xl hover:shadow-slate-900/10"
    >
      <div className={cn('h-24 w-full bg-gradient-to-br opacity-90', accent.soft)}>
        <div className="h-full w-full bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.7),transparent_45%)]" />
      </div>
      <div className="-mt-12 flex flex-1 flex-col px-6 pb-6">
        <div className="flex items-end justify-between gap-3">
          <TeamMemberAvatar
            avatarFileId={member.avatarFileId}
            name={member.name}
            className={cn('h-24 w-24 rounded-2xl border-4 border-white shadow-lg ring-2 transition-transform duration-500 group-hover:scale-[1.04]', accent.ring)}
          />
          {member.badge && (
            <span className={cn('mb-1 inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-bold', accent.badge)}>
              <Icon className="h-3 w-3" /> {member.badge}
            </span>
          )}
        </div>
        <h3 className="mt-4 text-lg font-black leading-tight tracking-tight text-slate-900">{member.name}</h3>
        <p className="mt-1 text-sm font-semibold text-[#1e3a8a]">{member.role}</p>
        {member.subTeam && <p className="text-xs font-medium text-slate-400">{member.subTeam}</p>}
        {member.bio && <p className="mt-3 line-clamp-4 text-sm leading-6 text-slate-600">{member.bio}</p>}
        <div className="mt-auto flex items-center justify-between gap-2 border-t border-slate-100 pt-4">
          <span className={cn('rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider', accent.soft, 'text-slate-700')}>{member.team}</span>
          <div className="flex items-center gap-1.5">
            {links.map(({ href, label, icon: LinkIcon }) => (
              <a key={href} href={href} target={href.startsWith('mailto:') ? undefined : '_blank'} rel="noopener noreferrer" aria-label={label} title={label} className={LINK_CLASS}>
                <LinkIcon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </motion.article>
  )
}

export function TeamMemberCardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm" aria-hidden>
      <Skeleton className="h-24 w-full rounded-none" />
      <div className="-mt-12 flex flex-1 flex-col px-6 pb-6">
        <Skeleton className="h-24 w-24 rounded-2xl border-4 border-white" />
        <Skeleton className="mt-4 h-5 w-2/3" />
        <Skeleton className="mt-2 h-4 w-1/2" />
        <Skeleton className="mt-1 h-3 w-1/3" />
        <div className="mt-3 space-y-1.5">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-11/12" />
          <Skeleton className="h-3 w-3/4" />
        </div>
        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
          <Skeleton className="h-6 w-20 rounded-full" />
          <div className="flex gap-1.5"><Skeleton className="h-9 w-9 rounded-xl" /><Skeleton className="h-9 w-9 rounded-xl" /></div>
        </div>
      </div>
    </div>
  )
}
