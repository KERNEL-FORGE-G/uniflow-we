import { NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useUserRole, type Role } from '../../utils/userRole'
import { Avatar } from '../ui/Avatar'
import { NavIcon, UniIcon, type UniIconName } from '../ui/UniIcon'
import { Footer } from './Footer'
import { GlobalSearch } from './GlobalSearch'
import { cn } from '../../utils/cn'
import { useAuth } from '../../hooks/useAuth'
import { NAV_GROUP_LABELS, navItemsForRole, type AppNavItem } from './navConfig'

// Uni (l'assistant) est monté une seule fois dans `App.tsx`, pour le site
// public comme pour l'espace connecté : plus rien à charger ici.

/**
 * Trois profils seulement : chacun a sa couleur d'accent pour qu'on sache d'un
 * coup d'œil dans quel « mode » on navigue (apprendre / animer / enseigner).
 */
const ROLE_STYLE: Record<Role, { badge: string; icon: UniIconName; active: string; chip: string; dot: string }> = {
  student: { badge: 'Étudiant', icon: 'students', active: 'bg-gradient-to-r from-[#1e3a8a] to-[#2563eb] text-white shadow-md shadow-[#1e3a8a]/25', chip: 'bg-[#eff3ff] text-[#1e3a8a] border border-blue-200/60', dot: 'bg-[#1e3a8a]' },
  delegate: { badge: 'Délégué', icon: 'megaphone', active: 'bg-gradient-to-r from-[#b45309] to-[#d97706] text-white shadow-md shadow-amber-700/25', chip: 'bg-amber-50 text-amber-700 border border-amber-200/60', dot: 'bg-[#f59e0b]' },
  teacher: { badge: 'Enseignant', icon: 'teacher', active: 'bg-gradient-to-r from-[#0d9488] to-[#14b8a6] text-white shadow-md shadow-teal-700/25', chip: 'bg-[#f0fdfa] text-[#0d9488] border border-teal-200/60', dot: 'bg-[#0d9488]' },
  admin: { badge: 'Propriétaire', icon: 'security', active: 'bg-gradient-to-r from-slate-900 to-[#1e3a8a] text-white shadow-md', chip: 'bg-slate-100 text-slate-700 border border-slate-200', dot: 'bg-slate-700' },
}

/** Contenu de navigation partagé entre la barre latérale bureau et le tiroir mobile. */
function SidebarContent({ onNavigate, compact }: { onNavigate?: () => void; compact?: boolean }) {
  const { currentRole, currentUser, isOfflineMode, setIsOfflineMode, language, setLanguage } = useUserRole()
  const navigate = useNavigate()
  const role = ROLE_STYLE[currentRole] ?? ROLE_STYLE.student
  const items = navItemsForRole(currentRole)
  const groups = (['apprendre', 'animer', 'echanger', 'compte'] as const)
    .map((key) => ({ key, items: items.filter((item: AppNavItem) => item.group === key) }))
    .filter((group) => group.items.length > 0)

  return (
    <div className="flex h-full flex-col bg-white/95 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-2 px-5 pb-3 pt-5">
        <button
          type="button"
          onClick={() => { navigate('/'); onNavigate?.() }}
          title="Retour à l’accueil — session conservée"
          className="rounded-2xl p-1.5 text-left transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e3a8a]/40 group"
        >
          <div className="flex items-center gap-3">
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#eff3ff] to-[#f0fdfa] border border-blue-100 shadow-xs">
              <img src="/brand/uniflow_logo_final.png" alt="UniFlow" className={compact ? 'h-8 w-8 object-contain' : 'h-9 w-9 object-contain drop-shadow-sm transition-transform group-hover:scale-105'} />
            </div>
            {!compact && (
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-black tracking-tight text-[#0B132B] leading-none">Uni<span className="text-[#0d9488]">Flow</span></span>
                  <span className="rounded-full bg-teal-50 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-[#0d9488] border border-teal-200/60">2.0</span>
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">OS Universitaire · UY1</span>
              </div>
            )}
          </div>
        </button>
      </div>

      {/* Carte profil Bento : accès direct au profil, rôle et filière visibles en permanence. */}
      <button
        type="button"
        onClick={() => { navigate('/app/profil'); onNavigate?.() }}
        className="mx-3 relative overflow-hidden flex items-center gap-3 rounded-2xl bg-gradient-to-br from-[#0B132B] via-[#1E3A8A] to-[#0D9488] p-3.5 text-left text-white shadow-md transition hover:shadow-lg hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e3a8a]/40"
      >
        <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-cyan-400/20 blur-xl" />
        <span className="relative shrink-0 rounded-full ring-2 ring-white/30">
          <Avatar name={currentUser.name} avatarFileId={currentUser.avatarFileId} size="md" />
          <span className={cn('absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#0B132B]', isOfflineMode ? 'bg-amber-400' : 'bg-emerald-400')} />
        </span>
        <span className="min-w-0 flex-1 relative z-10">
          <span className="block truncate text-sm font-extrabold text-white">{currentUser.name}</span>
          <span className="block truncate text-[11px] text-cyan-200/90 font-medium">{currentUser.filiere || currentUser.roleLabel}</span>
          <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 px-2 py-0.5 text-[10px] font-bold text-white">
            <UniIcon name={role.icon} size={11} /> {role.badge}
          </span>
        </span>
      </button>

      <nav className="mt-4 flex-1 overflow-y-auto px-3 pb-3" aria-label="Navigation de l’espace">
        {groups.map((group) => (
          <div key={group.key} className="mb-4">
            <p className="px-3 pb-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
              {language === 'FR' ? NAV_GROUP_LABELS[group.key].fr : NAV_GROUP_LABELS[group.key].en}
            </p>
            <ul className="space-y-1">
              {group.items.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.to === '/app'}
                    onClick={onNavigate}
                    className={({ isActive }) => cn(
                      'group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e3a8a]/40',
                      isActive ? role.active : 'text-slate-600 hover:bg-slate-100/90 hover:text-slate-900',
                    )}
                  >
                    {({ isActive }) => (
                      <>
                        <NavIcon name={item.icon} imageSrc={item.image} active={isActive} size={20} className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-[#1e3a8a]'} />
                        <span className="truncate">{language === 'FR' ? item.labelFr : item.labelEn}</span>
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Encart Copilote Uni 3D + Contrôles */}
      <div className="space-y-2 border-t border-slate-200/80 p-3 bg-slate-50/60">
        <div className="flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-[#eff3ff] to-[#f0fdfa] p-2.5 border border-blue-200/60">
          <img
            src="/illustrations/uni_copilot_3d.png"
            alt="Uni Copilote 3D"
            className="h-9 w-9 shrink-0 rounded-xl object-contain drop-shadow-xs"
            onError={(e) => { e.currentTarget.style.display = 'none' }}
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-black text-[#1e3a8a] truncate">Uni · Copilote Groq</span>
            </div>
            <p className="text-[10px] font-medium text-slate-500 truncate">Assistant IA académique actif</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => setLanguage(language === 'FR' ? 'EN' : 'FR')}
            className="flex items-center justify-between rounded-xl bg-white border border-slate-200/80 px-2.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e3a8a]/40"
          >
            <span className="flex items-center gap-1.5"><UniIcon name="globe" size={14} className="text-slate-500" /> Langue</span>
            <span className="rounded-md bg-[#eff3ff] px-1.5 py-0.5 text-[10px] font-black text-[#1e3a8a]">{language}</span>
          </button>
          <button
            type="button"
            role="switch"
            aria-checked={isOfflineMode}
            onClick={() => setIsOfflineMode(!isOfflineMode)}
            className="flex items-center justify-between rounded-xl bg-white border border-slate-200/80 px-2.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e3a8a]/40"
          >
            <span className="flex items-center gap-1 truncate">
              <UniIcon name={isOfflineMode ? 'wifiOff' : 'wifi'} size={14} className={isOfflineMode ? 'text-amber-600' : 'text-emerald-600'} />
              <span className="truncate">{isOfflineMode ? 'Hors ligne' : 'En ligne'}</span>
            </span>
            <span className={cn('relative h-4 w-7 shrink-0 rounded-full transition-colors', isOfflineMode ? 'bg-amber-500' : 'bg-emerald-500')}>
              <span className={cn('absolute top-0.5 h-3 w-3 rounded-full bg-white shadow transition-all', isOfflineMode ? 'left-[14px]' : 'left-0.5')} />
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}

export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-[272px] shrink-0 border-r border-slate-200/80 bg-white lg:block shadow-xs">
      <SidebarContent />
    </aside>
  )
}

export function TopBar({ onMenuClick }: { onMenuClick?: () => void }) {
  const navigate = useNavigate()
  const { currentUser, currentRole } = useUserRole()
  const { logout } = useAuth()
  const role = ROLE_STYLE[currentRole] ?? ROLE_STYLE.student
  const unreadCount = 0

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200/80 bg-white/85 px-4 backdrop-blur-xl sm:px-8">
      <button
        type="button"
        onClick={onMenuClick}
        className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e3a8a]/40 lg:hidden"
        aria-label="Ouvrir le menu"
      >
        <UniIcon name="menu" weight="bold" size={22} />
      </button>

      <GlobalSearch />

      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          onClick={() => navigate('/actualites')}
          className="hidden xl:inline-flex items-center gap-1.5 rounded-full bg-slate-100 hover:bg-slate-200/80 px-3 py-1.5 text-xs font-bold text-slate-700 transition-colors"
        >
          <span className="h-2 w-2 rounded-full bg-[#0d9488]" />
          Actualités Campus
        </button>
        <button
          type="button"
          onClick={() => navigate('/app/mail')}
          className="hidden md:inline-flex items-center gap-1.5 rounded-full bg-[#eff3ff] hover:bg-blue-100/80 px-3 py-1.5 text-xs font-bold text-[#1e3a8a] border border-blue-200/60 transition-colors"
          title="Messagerie Webmail @uniflow.kernelforge.codes"
        >
          <UniIcon name="messages" size={14} />
          <span>Webmail</span>
        </button>
        <span className={cn('hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold md:inline-flex', role.chip)}>
          <UniIcon name={role.icon} size={14} /> {role.badge}
        </span>
        <button
          type="button"
          onClick={() => navigate('/app/notifications')}
          className="relative rounded-xl p-2 text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e3a8a]/40"
          aria-label="Notifications"
        >
          <UniIcon name="notifications" size={22} />
          {unreadCount > 0 && (
            <span className="absolute right-0.5 top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#f59e0b] px-1 text-[10px] font-bold text-white">{unreadCount}</span>
          )}
        </button>
        <button
          type="button"
          onClick={() => navigate('/app/profil')}
          className="flex items-center gap-2.5 rounded-2xl border border-slate-200/80 bg-slate-50/80 px-2.5 py-1.5 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e3a8a]/40 transition-colors"
          aria-label="Mon profil"
        >
          <Avatar name={currentUser.name} avatarFileId={currentUser.avatarFileId} size="sm" />
          <span className="hidden text-left sm:block">
            <span className="block text-xs font-extrabold leading-none text-slate-900">{currentUser.name}</span>
            <span className="mt-1 block max-w-[140px] truncate text-[10px] font-semibold leading-none text-[#0d9488]">{currentUser.filiere || currentUser.roleLabel}</span>
          </span>
        </button>
        <button
          type="button"
          onClick={() => void logout()}
          className="hidden rounded-xl p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 sm:flex"
          title="Se déconnecter"
          aria-label="Se déconnecter"
        >
          <UniIcon name="logout" weight="bold" size={20} />
        </button>
      </div>
    </header>
  )
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-[#F7F9FC]">
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden" onClick={() => setMobileMenuOpen(false)} aria-hidden="true" />
      )}

      {/* Tiroir mobile : même contenu que la barre latérale, plus un accès à la déconnexion (masquée dans le bandeau sous sm). */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-[280px] transform bg-white shadow-2xl transition-transform duration-300 ease-in-out lg:hidden',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full',
        )}
        aria-hidden={!mobileMenuOpen}
      >
        <div className="flex h-full flex-col">
          <div className="min-h-0 flex-1">
            <SidebarContent compact onNavigate={() => setMobileMenuOpen(false)} />
          </div>
          <MobileLogout onDone={() => setMobileMenuOpen(false)} />
        </div>
      </div>

      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar onMenuClick={() => setMobileMenuOpen(true)} />
        <main className="mx-auto w-full max-w-[1400px] flex-1 p-4 sm:p-8">{children}</main>
        <Footer />
      </div>
    </div>
  )
}

function MobileLogout({ onDone }: { onDone: () => void }) {
  const { logout } = useAuth()
  return (
    <div className="border-t border-slate-200/80 p-3">
      <button
        type="button"
        onClick={() => { onDone(); void logout() }}
        className="flex w-full items-center gap-2 rounded-2xl px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
      >
        <UniIcon name="logout" weight="bold" size={16} /> Se déconnecter
      </button>
    </div>
  )
}
