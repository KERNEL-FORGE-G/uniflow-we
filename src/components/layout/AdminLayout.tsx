import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  Search, Bell, LogOut, BarChart3, Database, BookOpen, BookMarked,
  Calendar, Users, GraduationCap, UserCheck, Settings, ChevronRight,
  Shield, TrendingUp, FileText, AlertCircle, Activity, Home
} from 'lucide-react'
import { adminNavGroups } from '../../data/navigation'
import { Avatar } from '../ui/Avatar'
import { cn } from '../../utils/cn'
import { useState } from 'react'

function AdminSidebar() {
  return (
    <aside className="flex h-screen w-[256px] shrink-0 flex-col border-r border-[#e5e7eb] bg-white sticky top-0 overflow-hidden">
      {/* Header with gradient */}
      <div className="admin-header-gradient px-5 py-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="text-[17px] font-black tracking-tight text-white">
              Uni<span className="text-[#0d9488]">Flow</span>
            </span>
            <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest -mt-0.5">Administration</p>
          </div>
        </div>

        {/* Admin user */}
        <div className="mt-4 flex items-center gap-3 rounded-xl bg-white/10 px-3 py-2.5 backdrop-blur-sm">
          <Avatar name="Admin UniFlow" size="sm" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white truncate">Administrateur</p>
            <div className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <p className="text-[10px] text-white/60">Super Admin · En ligne</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-3">
        {adminNavGroups.map((group) => (
          <div key={group.title} className="mb-5">
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-[#9ca3af]">{group.title}</p>
            <ul className="space-y-0.5">
              {group.items.map(({ to, icon: Icon, labelFr, end }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={end ?? false}
                    className={({ isActive }) => cn(
                      'flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 group',
                      isActive
                        ? 'bg-gradient-to-r from-[#1e3a8a] to-[#2d4fa8] text-white shadow-md'
                        : 'text-[#374151] hover:bg-[#f9fafb] hover:text-[#111827]',
                    )}
                  >
                    {({ isActive }) => (
                      <>
                        <div className={cn(
                          'flex h-7 w-7 items-center justify-center rounded-lg transition-all flex-shrink-0',
                          isActive ? 'bg-white/20' : 'bg-[#f3f4f6] group-hover:bg-[#eff3ff]'
                        )}>
                          <Icon className={cn('h-4 w-4', isActive ? 'text-white' : 'text-[#6b7280] group-hover:text-[#1e3a8a]')} />
                        </div>
                        <span className="truncate">{labelFr}</span>
                        {isActive && <ChevronRight className="ml-auto h-3.5 w-3.5 text-white/60" />}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* System status */}
      <div className="border-t border-[#e5e7eb] p-3">
        <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-3 py-2.5">
          <div className="flex items-center gap-2">
            <Activity className="h-3.5 w-3.5 text-emerald-600" />
            <span className="text-xs font-semibold text-emerald-700">Système opérationnel</span>
          </div>
          <p className="text-[10px] text-emerald-600 mt-0.5 ml-5.5">Tous les services actifs · 99.9% uptime</p>
        </div>
      </div>
    </aside>
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
          {i > 0 && <ChevronRight className="h-3.5 w-3.5" />}
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
  const [searchVal, setSearchVal] = useState('')
  const [notifCount] = useState(3)

  return (
    <div className="flex min-h-screen bg-[#f3f4f6]">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Admin Header */}
        <header className="sticky top-0 z-20 flex h-14 items-center gap-4 border-b border-[#e5e7eb] bg-white/95 backdrop-blur-sm px-6 shadow-sm">
          <AdminBreadcrumb />

          <div className="flex-1 hidden lg:block" />

          <button
            onClick={() => navigate('/')}
            title="Retour à l’accueil — session conservée"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-[#1e3a8a] hover:bg-[#eff3ff] transition-all"
          >
            <Home className="h-4 w-4" /> Accueil
          </button>

          {/* Search */}
          <div className="relative flex-1 max-w-sm lg:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]" />
            <input
              type="search"
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              placeholder="Rechercher utilisateurs, cours..."
              className="w-full rounded-xl border border-[#e5e7eb] bg-[#f9fafb] py-2 pl-9 pr-4 text-sm outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/10 focus:bg-white transition-all"
            />
          </div>

          {/* Notifications */}
          <button className="relative rounded-xl p-2 text-[#6b7280] hover:bg-[#f3f4f6] hover:text-[#111827] transition-all">
            <Bell className="h-5 w-5" />
            {notifCount > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                {notifCount}
              </span>
            )}
          </button>

          {/* Admin badge */}
          <div className="hidden md:flex items-center gap-1.5 rounded-xl bg-amber-50 border border-amber-200 px-3 py-1.5 text-xs font-bold text-amber-700">
            <Shield className="h-3.5 w-3.5" />
            Super Admin
          </div>

          {/* User */}
          <div className="flex items-center gap-2">
            <Avatar name="Admin UniFlow" size="sm" />
            <div className="hidden sm:block">
              <p className="text-sm font-bold text-[#111827]">Administrateur</p>
              <p className="text-xs text-[#6b7280]">Super Admin</p>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={() => navigate('/login')}
            className="rounded-xl p-2 text-[#6b7280] hover:bg-red-50 hover:text-red-600 transition-all"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
