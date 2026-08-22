import { NavLink, useNavigate } from 'react-router-dom'
import {
  Search, Bell, LogOut, Wifi, WifiOff, Globe, ChevronDown,
  GraduationCap, Megaphone, UserCheck, Settings, Menu, X,
  ChevronRight, Sparkles
} from 'lucide-react'
import { useUserRole } from '../../utils/userRole'
import { navItems } from '../../data/navigation'
import { Avatar } from '../ui/Avatar'
import { Footer } from './Footer'
import { GlobalSearch } from './GlobalSearch'
import { cn } from '../../utils/cn'
import { Component, lazy, Suspense, useEffect, useState, type ReactNode } from 'react'
import { useAuth } from '../../hooks/useAuth'

const CompanionAssistant = lazy(() => import('../CompanionAssistant').then((module) => ({ default: module.CompanionAssistant })))

class CompanionBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    return this.state.failed ? null : this.props.children
  }
}

const roleConfig = {
  student:  { badge: 'Étudiant',    icon: GraduationCap, gradient: 'from-[#1e3a8a] to-[#2d4fa8]', bg: 'bg-[#eff3ff]', text: 'text-[#1e3a8a]', dot: 'bg-[#1e3a8a]' },
  delegate: { badge: 'Délégué',     icon: Megaphone,     gradient: 'from-purple-700 to-purple-500', bg: 'bg-purple-50',  text: 'text-purple-700', dot: 'bg-purple-600' },
  teacher:  { badge: 'Enseignant',  icon: UserCheck,     gradient: 'from-[#0d9488] to-[#14b8a8]', bg: 'bg-[#f0fdfa]', text: 'text-[#0d9488]', dot: 'bg-[#0d9488]' },
  admin:    { badge: 'Admin',       icon: Settings,      gradient: 'from-amber-600 to-amber-500',  bg: 'bg-amber-50',  text: 'text-amber-700', dot: 'bg-amber-500' },
  independent: { badge: 'Compte indépendant', icon: Sparkles, gradient: 'from-[#0f766e] to-[#1e3a8a]', bg: 'bg-teal-50', text: 'text-teal-700', dot: 'bg-teal-500' },
}

export function Sidebar() {
  const { currentRole, setCurrentRole, currentUser, isOfflineMode, setIsOfflineMode, language, setLanguage } = useUserRole()
  const navigate = useNavigate()
  const isIndependent = currentUser.accountType === 'PERSONAL'
  const filteredNav = navItems.filter(item => {
    if (!item.roles?.includes(currentRole)) return false
    if (!isIndependent) return true
    return ['/app', '/app/independent', '/app/cours', '/app/emploi-du-temps', '/app/devoirs', '/app/notes', '/app/profil', '/app/parametres', '/app/messages', '/app/bibliotheque', '/app/presences', '/app/notifications', '/app/visio', '/app/aide', '/pricing'].includes(item.to)
  })
  const role = isIndependent ? roleConfig.independent : roleConfig[currentRole]
  const RoleIcon = role.icon
  // Aucun compteur backend : les notifications seront alimentées par Appwrite Messaging lorsque le push sera actif.
  const unreadCount = 0

  return (
    <aside className="flex min-h-screen w-[240px] shrink-0 flex-col border-r border-[#e5e7eb] bg-white sticky top-0 self-start shadow-sm sidebar-gradient">
      {/* Logo Header */}
      <div className="relative overflow-hidden border-b border-[#e5e7eb] px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <img
            src="https://i.imgur.com/GAiZ7WY.png"
            alt="UniFlow"
            loading="eager"
            decoding="async"
            className="h-9 w-auto object-contain"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              if (!target.dataset.triedFallback1) {
                target.dataset.triedFallback1 = 'true'
                target.src = '/logo_1.png'
              } else if (!target.dataset.triedFallback2) {
                target.dataset.triedFallback2 = 'true'
                target.src = '/logo.png'
              }
            }}
          />
          <Sparkles className="h-4 w-4 text-[#0d9488] animate-pulse-dot" />
        </div>
      </div>

      {/* User card */}
      <div className="border-b border-[#e5e7eb] px-3 py-3 space-y-2.5">
        {/* Avatar + name */}
        <div
          onClick={() => navigate('/app/profil')}
          className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-[#f9fafb] to-[#eff3ff] px-3 py-2.5 cursor-pointer hover:from-[#eff3ff] hover:to-[#dce5fd] transition-all group"
        >
          <div className="relative flex-shrink-0">
            <Avatar name={currentUser.name} size="md" />
            <span className={cn(
              'absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white',
              isOfflineMode ? 'bg-gray-400' : 'bg-emerald-500'
            )} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-[#111827]">{currentUser.name}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <span className={cn('h-1.5 w-1.5 rounded-full', role.dot)} />
              <p className="truncate text-[10px] text-[#6b7280]">{currentUser.roleLabel}</p>
            </div>
          </div>
          <ChevronRight className="h-3.5 w-3.5 text-[#9ca3af] group-hover:text-[#1e3a8a] transition-colors flex-shrink-0" />
        </div>

        <div className="rounded-xl bg-[#f9fafb] p-3">
          <p className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-wider mb-2">Rôle</p>
          <div className="flex items-center gap-2 rounded-xl border border-[#e5e7eb] bg-white px-3 py-2 text-xs font-semibold text-[#374151]">
            <RoleIcon className={cn('h-3.5 w-3.5', role.text)} />
            <span>{role.badge}</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3">
        <p className="px-2 pb-2 pt-1 text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest">Navigation</p>
        <div className="space-y-0.5">
          {filteredNav.map((item, i) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/app'}
                className={({ isActive }) => cn(
                  'relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all duration-200',
                  isActive
                    ? `bg-gradient-to-r ${role.gradient} text-white shadow-md`
                    : 'text-[#6b7280] hover:bg-[#f3f4f6] hover:text-[#111827]',
                  `animate-stagger-${Math.min(i + 1, 8)}`
                )}
              >
                {({ isActive }) => (
                  <>
                    <div className={cn(
                      'flex h-7 w-7 items-center justify-center rounded-lg flex-shrink-0 transition-all',
                      isActive ? 'bg-white/20' : 'bg-transparent group-hover:bg-white'
                    )}>
                      <Icon className={cn('h-4 w-4', isActive ? 'text-white' : '')} />
                    </div>
                    <span className="truncate">{language === 'FR' ? item.labelFr : item.labelEn}</span>
                    {item.to === '/app/notifications' && unreadCount > 0 && (
                      <span className={cn(
                        'ml-auto flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold',
                        isActive ? 'bg-white/25 text-white' : 'bg-red-500 text-white'
                      )}>
                        {unreadCount}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            )
          })}
        </div>

        {/* Admin shortcut */}
        {currentRole === 'admin' && (
          <div className="mt-4">
            <p className="px-2 pb-2 text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest">Administration</p>
            <NavLink
              to="/admin"
              className={({ isActive }) => cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all',
                isActive ? 'bg-amber-500 text-white shadow-md' : 'text-amber-700 bg-amber-50 hover:bg-amber-100'
              )}
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-200/50">
                <Settings className="h-4 w-4" />
              </div>
              Panneau Admin
            </NavLink>
          </div>
        )}
      </nav>

      {/* Bottom controls */}
      <div className="border-t border-[#e5e7eb] p-3 space-y-1.5">
        {/* Language */}
        <div className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#f9fafb] transition-colors cursor-pointer"
          onClick={() => setLanguage(language === 'FR' ? 'EN' : 'FR')}>
          <div className="flex items-center gap-2 text-xs text-[#374151]">
            <Globe className="h-3.5 w-3.5 text-[#6b7280]" />
            <span className="font-medium">Langue</span>
          </div>
          <span className="text-xs font-bold text-[#1e3a8a] bg-[#eff3ff] px-2 py-0.5 rounded-md">{language}</span>
        </div>

        {/* Offline toggle */}
        <div className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#f9fafb] transition-colors">
          <div className="flex items-center gap-2 text-xs text-[#374151]">
            {isOfflineMode ? (
              <WifiOff className="h-3.5 w-3.5 text-red-500" />
            ) : (
              <Wifi className="h-3.5 w-3.5 text-emerald-600" />
            )}
            <span className={cn('font-medium', isOfflineMode ? 'text-red-600' : '')}>
              {isOfflineMode ? 'Hors ligne' : 'En ligne'}
            </span>
          </div>
          <button
            onClick={() => setIsOfflineMode(!isOfflineMode)}
            className={cn(
              'relative h-5 w-9 rounded-full transition-all duration-300',
              isOfflineMode ? 'bg-red-500' : 'bg-emerald-500'
            )}
          >
            <span className={cn(
              'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-all duration-300',
              isOfflineMode ? 'left-[18px]' : 'left-0.5'
            )} />
          </button>
        </div>
      </div>
    </aside>
  )
}

export function TopBar({ onMenuClick }: { onMenuClick?: () => void }) {
  const navigate = useNavigate()
  const { language, currentUser, currentRole } = useUserRole()
  const isIndependent = currentUser.accountType === 'PERSONAL'
  const { logout } = useAuth()
  const role = isIndependent ? roleConfig.independent : roleConfig[currentRole]
  const RoleIcon = role.icon
  // Aucun compteur backend : les notifications seront alimentées par Appwrite Messaging lorsque le push sera actif.
  const unreadCount = 0

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-[#e5e7eb] bg-white/95 backdrop-blur-sm px-4 sm:px-6 shadow-sm">
      {/* Mobile Menu Button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden rounded-xl p-2 hover:bg-[#f3f4f6] transition-colors touch-target"
      >
        <Menu className="h-5 w-5 text-[#6b7280]" />
      </button>

      {/* Global Search Component */}
      <GlobalSearch />

      <div className="flex items-center gap-2 ml-auto">
        {/* Role Badge */}
        <div className={cn(
          'hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold',
          role.bg, role.text, 'border-current/20'
        )}>
          <RoleIcon className="h-3.5 w-3.5" />
          {role.badge}
        </div>

        {/* Notification Bell */}
        <button
          onClick={() => navigate('/app/notifications')}
          className="relative rounded-xl p-2 text-[#6b7280] hover:bg-[#f3f4f6] hover:text-[#111827] transition-all touch-target"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white min-w-[18px] h-[18px] px-1">
              {unreadCount}
            </span>
          )}
        </button>

        {/* User avatar */}
        <button
          onClick={() => navigate('/app/profil')}
          className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-[#f3f4f6] transition-all touch-target"
        >
          <Avatar name={currentUser.name} size="sm" />
          <div className="hidden sm:block text-left">
            <p className="text-sm font-bold text-[#111827] leading-none">{currentUser.name}</p>
            <p className="text-[11px] text-[#6b7280] leading-none mt-0.5 truncate max-w-[130px]">{currentUser.roleLabel}</p>
          </div>
          <ChevronDown className="hidden sm:block h-4 w-4 text-[#9ca3af]" />
        </button>

        {/* Logout */}
        <button
          onClick={logout}
          className="hidden sm:flex rounded-xl p-2 text-[#6b7280] hover:bg-red-50 hover:text-red-600 transition-all touch-target items-center justify-center"
          title="Se déconnecter"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  )
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [canLoadCompanion, setCanLoadCompanion] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => setCanLoadCompanion(true), 900)
    return () => window.clearTimeout(timer)
  }, [])

  return (
    <div className="flex min-h-screen bg-[#f3f4f6]">
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 modal-backdrop lg:hidden animate-fade-in-fast"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div className={cn(
        'fixed inset-y-0 left-0 z-50 w-[270px] transform bg-white lg:hidden transition-transform duration-300 ease-in-out shadow-2xl',
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <MobileSidebar onClose={() => setMobileMenuOpen(false)} />
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex">
        <Sidebar />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar onMenuClick={() => setMobileMenuOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
        <Footer />
      </div>
      {canLoadCompanion && (
        <CompanionBoundary>
          <Suspense fallback={null}><CompanionAssistant /></Suspense>
        </CompanionBoundary>
      )}
    </div>
  )
}

function MobileSidebar({ onClose }: { onClose: () => void }) {
  const { currentRole, setCurrentRole, currentUser, isOfflineMode, setIsOfflineMode, language, setLanguage } = useUserRole()
  const navigate = useNavigate()
  const isIndependent = currentUser.accountType === 'PERSONAL'
  const filteredNav = navItems.filter(item => {
    if (!item.roles?.includes(currentRole)) return false
    if (!isIndependent) return true
    return ['/app', '/app/independent', '/app/cours', '/app/emploi-du-temps', '/app/devoirs', '/app/notes', '/app/profil', '/app/parametres', '/app/messages', '/app/bibliotheque', '/app/presences', '/app/notifications', '/app/visio', '/app/aide', '/pricing'].includes(item.to)
  })
  const role = isIndependent ? roleConfig.independent : roleConfig[currentRole]
  const RoleIcon = role.icon

  return (
    <aside className="flex h-full flex-col bg-white">
      {/* Logo + Close */}
      <div className="flex items-center justify-between border-b border-[#e5e7eb] px-5 py-4">
        <div className="flex items-center gap-3">
          <img
            src="https://i.imgur.com/GAiZ7WY.png"
            alt="UniFlow"
            className="h-8 w-auto object-contain"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              if (!target.dataset.triedFallback1) {
                target.dataset.triedFallback1 = 'true'
                target.src = '/logo_1.png'
              } else if (!target.dataset.triedFallback2) {
                target.dataset.triedFallback2 = 'true'
                target.src = '/logo.png'
              }
            }}
          />
        </div>
        <button onClick={onClose} className="rounded-xl p-2 hover:bg-[#f3f4f6] transition-colors">
          <X className="h-5 w-5 text-[#6b7280]" />
        </button>
      </div>

      {/* User card */}
      <div className="border-b border-[#e5e7eb] px-3 py-3 space-y-2.5">
        <div
          onClick={() => { navigate('/app/profil'); onClose(); }}
          className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-[#f9fafb] to-[#eff3ff] px-3 py-2.5 cursor-pointer hover:from-[#eff3ff] hover:to-[#dce5fd] transition-all"
        >
          <div className="relative flex-shrink-0">
            <Avatar name={currentUser.name} size="md" />
            <span className={cn(
              'absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white',
              isOfflineMode ? 'bg-gray-400' : 'bg-emerald-500'
            )} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-[#111827]">{currentUser.name}</p>
            <p className="truncate text-xs text-[#6b7280]">{currentUser.roleLabel}</p>
          </div>
        </div>

      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        <p className="px-2 pb-2 text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest">Navigation</p>
        {filteredNav.map(item => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/app'}
              onClick={onClose}
              className={({ isActive }) => cn(
                'flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-all',
                isActive
                  ? `bg-gradient-to-r ${role.gradient} text-white shadow-md`
                  : 'text-[#6b7280] hover:bg-[#f3f4f6] hover:text-[#111827]'
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span>{language === 'FR' ? item.labelFr : item.labelEn}</span>
            </NavLink>
          )
        })}
      </nav>

      {/* Bottom controls */}
      <div className="border-t border-[#e5e7eb] p-3 space-y-2">
        <div className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#f9fafb] cursor-pointer"
          onClick={() => setLanguage(language === 'FR' ? 'EN' : 'FR')}>
          <div className="flex items-center gap-2 text-sm text-[#374151]">
            <Globe className="h-4 w-4 text-[#6b7280]" />
            <span>Langue</span>
          </div>
          <span className="text-xs font-bold text-[#1e3a8a] bg-[#eff3ff] px-2 py-0.5 rounded-md">{language}</span>
        </div>

        <div className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#f9fafb]">
          <div className="flex items-center gap-2 text-sm text-[#374151]">
            {isOfflineMode ? <WifiOff className="h-4 w-4 text-red-500" /> : <Wifi className="h-4 w-4 text-emerald-600" />}
            <span className={isOfflineMode ? 'font-semibold text-red-600' : ''}>{isOfflineMode ? 'Hors ligne' : 'En ligne'}</span>
          </div>
          <button
            onClick={() => setIsOfflineMode(!isOfflineMode)}
            className={cn('relative h-6 w-11 rounded-full transition-all', isOfflineMode ? 'bg-red-500' : 'bg-emerald-500')}
          >
            <span className={cn('absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all', isOfflineMode ? 'left-[24px]' : 'left-1')} />
          </button>
        </div>
      </div>
    </aside>
  )
}
