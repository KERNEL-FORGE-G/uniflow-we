import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { adminNavGroups } from '../../data/navigation'
import { Avatar } from '../ui/Avatar'
import { NavIcon, UniIcon } from '../ui/UniIcon'
import { cn } from '../../utils/cn'
import { Suspense, useEffect, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { PageTransition } from '../motion/PageTransition'
import { Skeleton } from '../ui/Skeleton'
import { useAuth } from '../../hooks/useAuth'
import { useUserRole } from '../../utils/userRole'
import { appwriteClient } from '../../lib/appwrite'
import { useOnlineStatus } from '../../lib/offline/networkStatus'

/**
 * Libellés du compte : « Super Admin » n'est vrai que pour l'administrateur
 * de la plateforme (label `superadmin`) ; une administration d'université est
 * une administration, avec son nom et son université.
 */
function useAdminIdentity() {
  const { authUser, currentUser } = useUserRole()
  const isPlatform = Boolean(authUser?.isSuperAdmin)
  return {
    name: currentUser.name && currentUser.name !== 'Utilisateur non connecté' ? currentUser.name : 'Administration',
    title: isPlatform ? 'Admin plateforme' : 'Administration',
    scope: isPlatform ? 'KERNEL FORGE · toutes les universités' : (currentUser.university || 'Université'),
    isPlatform,
  }
}

function AdminSidebar() {
  const identity = useAdminIdentity()
  return (
    <aside className="flex h-screen w-[268px] shrink-0 flex-col border-r border-slate-200/80 bg-white/95 backdrop-blur-xl sticky top-0 overflow-hidden shadow-sm">
      {/* Header with gradient */}
      <div className="bg-gradient-to-br from-[#0B132B] via-[#1E3A8A] to-[#0D9488] px-5 py-5 flex-shrink-0 relative overflow-hidden">
        <div className="flex items-center gap-3 relative z-10">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 shadow-sm">
            <UniIcon name="security" weight="fill" size={20} className="text-white" />
          </div>
          <div>
            <span className="text-[18px] font-black tracking-tight text-white">
              Uni<span className="text-cyan-300">Flow</span>
            </span>
            <p className="text-[10px] font-bold text-cyan-200/80 uppercase tracking-widest -mt-0.5">Administration</p>
          </div>
        </div>

        {/* Admin user */}
        <div className="mt-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 px-3.5 py-3 relative z-10 shadow-sm">
          <div className="flex items-center gap-3">
            <Avatar name={identity.name} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">{identity.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                <p className="truncate text-[10px] text-slate-200">{identity.title} · {identity.scope}</p>
              </div>
            </div>
          </div>
          <div className="mt-2.5 flex items-center gap-1.5 rounded-xl bg-white/15 border border-white/20 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wider text-cyan-200">
            <UniIcon name="security" size={11} className="text-cyan-300 shrink-0" />
            <span className="truncate">Administration Centrale · KERNEL FORGE</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {adminNavGroups.map((group) => (
          <div key={group.title} className="mb-5">
            <p className="mb-2 px-3 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">{group.title}</p>
            <ul className="space-y-1">
              {group.items.map(({ to, icon, image, labelFr, end }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={end ?? false}
                    className={({ isActive }) => cn(
                      'flex items-center gap-2.5 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 group',
                      isActive
                        ? 'bg-gradient-to-r from-[#0B132B] to-[#1E3A8A] text-white shadow-md rounded-2xl'
                        : 'text-[#374151] hover:bg-slate-100/80 hover:text-[#111827]',
                    )}
                  >
                    {({ isActive }) => (
                      <>
                        <div className={cn(
                          'flex h-7 w-7 items-center justify-center rounded-xl transition-all flex-shrink-0',
                          isActive ? 'bg-white/20' : 'bg-slate-100 group-hover:bg-[#eff3ff]'
                        )}>
                          <NavIcon name={icon} imageSrc={image} active={isActive} size={17} className={isActive ? 'text-white' : 'text-[#6b7280] group-hover:text-[#1e3a8a]'} />
                        </div>
                        <span className="truncate">{labelFr}</span>
                        {isActive && <UniIcon name="chevronRight" weight="bold" size={14} className="ml-auto text-white/70" />}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <BackendStatus />
    </aside>
  )
}

/**
 * État réel du backend, à la place de l'ancien « 99,9 % uptime » codé en dur
 * (aucune mesure ne le soutenait). On interroge Appwrite au montage puis
 * toutes les deux minutes ; hors ligne, le navigateur le dit avant Appwrite.
 */
function BackendStatus() {
  const online = useOnlineStatus()
  const [ping, setPing] = useState<{ ok: boolean; ms?: number } | null>(null)
  useEffect(() => {
    if (!online) { setPing(null); return }
    let cancelled = false
    const check = async () => {
      const started = performance.now()
      try {
        await appwriteClient.ping()
        if (!cancelled) setPing({ ok: true, ms: Math.round(performance.now() - started) })
      } catch {
        if (!cancelled) setPing({ ok: false })
      }
    }
    void check()
    const timer = window.setInterval(() => { void check() }, 120_000)
    return () => { cancelled = true; window.clearInterval(timer) }
  }, [online])

  const tone = !online || ping?.ok === false
    ? { box: 'bg-amber-50/90 border-amber-200/80', icon: 'text-amber-600', title: 'text-amber-700', text: 'text-amber-600' }
    : { box: 'bg-emerald-50/90 border-emerald-200/80', icon: 'text-emerald-600', title: 'text-emerald-700', text: 'text-emerald-600' }
  const title = !online ? 'Hors ligne' : ping == null ? 'Vérification…' : ping.ok ? 'Appwrite Cloud joignable' : 'Appwrite ne répond pas'
  const detail = !online ? 'Données locales uniquement' : ping?.ok ? `Réponse en ${ping.ms} ms · Francfort` : ping == null ? 'Mesure du temps de réponse' : 'Nouvel essai dans 2 min'

  return (
    <div className="border-t border-slate-200/80 p-3">
      <div className={cn('rounded-2xl border px-3.5 py-2.5 shadow-xs', tone.box)} role="status">
        <div className="flex items-center gap-2">
          <UniIcon name="activity" weight="bold" size={14} className={tone.icon} />
          <span className={cn('text-xs font-semibold', tone.title)}>{title}</span>
        </div>
        <p className={cn('text-[10px] mt-0.5 ml-5.5', tone.text)}>{detail}</p>
      </div>
    </div>
  )
}

function AdminBreadcrumb() {
  const location = useLocation()
  const parts = location.pathname.split('/').filter(Boolean)
  const labels: Record<string, string> = {
    admin: 'Admin',
    utilisateurs: 'Utilisateurs',
    etudiants: 'Étudiants',
    enseignants: 'Enseignants',
    structure: 'Structure Académique',
    cours: 'Cours',
    ue: 'Unités Enseignement',
    salles: 'Salles',
    parametres: 'Paramètres',
    rapports: 'Rapports',
    finances: 'Finances',
  }

  return (
    <div className="hidden md:flex items-center gap-1.5 text-sm text-[#6b7280]">
      {parts.map((part, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <UniIcon name="chevronRight" weight="bold" size={14} />}
          <span className={i === parts.length - 1 ? 'font-semibold text-[#111827]' : ''}>
            {labels[part] || part}
          </span>
        </span>
      ))}
    </div>
  )
}

export function AdminLayout() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const identity = useAdminIdentity()
  const [searchVal, setSearchVal] = useState('')
  // Aucun compteur inventé : la pastille apparaîtra quand les notifications admin seront lues d'Appwrite.
  const notifCount = 0

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Admin Header */}
        <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl px-6 shadow-sm">
          <AdminBreadcrumb />

          <div className="flex-1 hidden lg:block" />

          <button
            onClick={() => navigate('/')}
            title="Retour à l’accueil — session conservée"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-2xl border border-slate-200/80 bg-slate-50/80 px-3.5 py-2 text-xs font-bold text-[#1e3a8a] hover:bg-[#eff3ff] transition-all"
          >
            <UniIcon name="home" size={16} /> Accueil
          </button>

          {/* Search */}
          <div className="relative flex-1 max-w-sm lg:max-w-xs">
            <UniIcon name="search" weight="bold" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
            <input
              type="search"
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              placeholder="Rechercher utilisateurs, cours..."
              className="w-full rounded-2xl border border-slate-200/80 bg-slate-50/80 py-2 pl-9 pr-4 text-sm outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/10 focus:bg-white transition-all"
            />
          </div>

          {/* Notifications */}
          <button className="relative rounded-2xl p-2 text-[#6b7280] hover:bg-slate-100 hover:text-[#111827] transition-all" aria-label="Notifications">
            <UniIcon name="notifications" size={20} />
            {notifCount > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                {notifCount}
              </span>
            )}
          </button>

          {/* Admin badge */}
          <div className={cn('hidden md:flex items-center gap-1.5 rounded-2xl border px-3 py-1.5 text-xs font-bold shadow-xs', identity.isPlatform ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-[#eff3ff] border-[#c7d2fe] text-[#1e3a8a]')}>
            <UniIcon name="security" size={14} />
            {identity.title}
          </div>

          {/* User */}
          <div className="flex items-center gap-2.5 rounded-2xl border border-slate-200/80 bg-slate-50/60 px-3 py-1.5">
            <Avatar name={identity.name} size="sm" />
            <div className="hidden sm:block">
              <p className="text-sm font-bold text-[#111827] leading-tight">{identity.name}</p>
              <p className="text-[11px] text-[#6b7280] leading-tight">{identity.scope}</p>
            </div>
          </div>

          {/* Logout */}
          <button
            type="button"
            onClick={() => void logout()}
            title="Se déconnecter"
            aria-label="Se déconnecter"
            className="rounded-2xl p-2 text-[#6b7280] hover:bg-red-50 hover:text-red-600 transition-all"
          >
            <UniIcon name="logout" weight="bold" size={20} />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait" initial={false}>
            <PageTransition key={location.pathname}>
              <Suspense fallback={<div className="space-y-4 animate-fade-in"><Skeleton className="h-10 w-64" /><Skeleton className="h-64" /></div>}>
                <Outlet />
              </Suspense>
            </PageTransition>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
