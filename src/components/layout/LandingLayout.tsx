import { Link, useLocation } from 'react-router-dom'
import { ArrowRight, Menu, X, Lock } from 'lucide-react'
import { useState } from 'react'
import { UNIFLOW_PRIMARY_LOGO_ALT, UNIFLOW_PRIMARY_LOGO_FALLBACK_URL, UNIFLOW_PRIMARY_LOGO_URL } from '../../lib/brandAssets'
import { useUserRole } from '../../utils/userRole'

const logo = UNIFLOW_PRIMARY_LOGO_URL
const restoreOriginalLogo = (event: React.SyntheticEvent<HTMLImageElement>) => {
  event.currentTarget.onerror = null
  event.currentTarget.src = UNIFLOW_PRIMARY_LOGO_FALLBACK_URL
}

const navLinks = [
  { to: '/about',        label: 'À propos' },
  { to: '/teams',        label: 'Équipe' },
  { to: '/sentinelle',   label: 'Sentinelle' },
  { to: '/pricing',      label: 'Tarifs' },
  { to: '/presentation', label: 'Présentation' },
  { to: '/forum',        label: 'Forum' },
  { to: '/contact',      label: 'Contact' },
]

export function LandingNavbar() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const { currentUser, authUser, isSessionReady } = useUserRole()
  const isConnected = isSessionReady && currentUser.email !== '—'
  const workspacePath = authUser?.role === 'ADMIN' ? '/admin' : '/app'

  return (
    <nav className="sticky top-0 z-50 border-b border-[#e5e7eb] bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-[1920px] items-center justify-between px-6 py-3.5">
        {/* Logo */}
        <Link to="/" className="flex items-center shrink-0">
          <img
            src={logo}
            alt={UNIFLOW_PRIMARY_LOGO_ALT}
            loading="eager"
            decoding="async"
            onError={restoreOriginalLogo}
            className="h-10 w-auto object-contain"
          />
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map(l => (
            <Link
              key={l.to}
              to={l.to}
              className={`text-sm font-medium transition-colors ${
                pathname === l.to
                  ? 'text-[#1e3a8a] font-semibold'
                  : 'text-[#6b7280] hover:text-[#1e3a8a]'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden items-center gap-2 md:flex">
          {isConnected ? <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">Connecté</span> : <Link to="/login" className="rounded-lg border border-[#e5e7eb] px-4 py-2 text-sm font-medium text-[#374151] hover:bg-[#f9fafb] transition-colors">Se connecter</Link>}
          <Link
            to={workspacePath}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#1e3a8a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2d4fa8] transition-colors"
          >
            {isConnected ? 'Mon espace' : 'Démo gratuite'} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Mobile burger */}
        <button
          className="md:hidden rounded-lg p-2 text-[#374151] hover:bg-[#f9fafb]"
          onClick={() => setOpen(v => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-[#e5e7eb] bg-white px-6 py-4 space-y-3 md:hidden animate-fade-in">
          {navLinks.map(l => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="block text-sm font-medium text-[#374151] hover:text-[#1e3a8a]"
            >
              {l.label}
            </Link>
          ))}
          <div className="flex gap-2 pt-3 border-t border-[#e5e7eb]">
            {isConnected ? <span className="flex-1 rounded-lg border border-emerald-200 bg-emerald-50 py-2 text-center text-sm font-semibold text-emerald-700">Connecté</span> : <Link to="/login" onClick={() => setOpen(false)} className="flex-1 rounded-lg border border-[#e5e7eb] py-2 text-center text-sm font-medium text-[#374151]">Se connecter</Link>}
            <Link to={workspacePath} onClick={() => setOpen(false)}
              className="flex-1 rounded-lg bg-[#1e3a8a] py-2 text-center text-sm font-semibold text-white">
              {isConnected ? 'Mon espace' : 'Démo'}
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}

export function LandingFooter() {
  return (
    <footer className="bg-[#0f172a] text-slate-300">
      <div className="mx-auto w-full max-w-[1920px] px-6 py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img 
                src={logo}
                alt={UNIFLOW_PRIMARY_LOGO_ALT}
                onError={restoreOriginalLogo}
                className="h-10 w-auto rounded-sm bg-white px-1 object-contain"
              />
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
              Une plateforme académique UniFlow reliée à Appwrite, validée sur le périmètre UY1 / ICT4D / L1.
            </p>
            <div className="mt-5 flex gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Données Appwrite
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300">
                <Lock className="h-3 w-3 text-slate-400" /> Accès par rôle
              </span>
            </div>
          </div>

          {/* Produit */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Produit</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { to: '/#fonctionnalites', label: 'Fonctionnalités' },
                { to: '/presentation', label: 'Présentation' },
                { to: '/pricing', label: 'Tarifs' },
                { to: '/forum', label: 'Forum' },
              ].map(l => (
                <li key={l.label}>
                  <Link to={l.to} className="text-slate-400 hover:text-white transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Ressources */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Ressources</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { to: '/presentation', label: 'Documentation du projet' },
                { to: '/contact', label: 'Support' },
                { to: '/forum', label: 'Communauté' },
              ].map(l => (
                <li key={l.label}>
                  <Link to={l.to} className="text-slate-400 hover:text-white transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Entreprise */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Entreprise</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { to: '/about', label: 'À propos' },
                { to: '/contact', label: 'Contact' },
                { to: '/about', label: 'KERNEL FORGE' },
                { to: '/presentation', label: 'Présentation' },
              ].map(l => (
                <li key={l.label}>
                  <Link to={l.to} className="text-slate-400 hover:text-white transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800 pt-8 text-xs text-slate-500">
          <p>© 2026 UniFlow — KERNEL FORGE · Périmètre validé : UY1 / ICT4D / L1</p>
          <div className="flex items-center gap-4">
            <Link to="/about" className="hover:text-slate-300 transition-colors">Confidentialité</Link>
            <Link to="/about" className="hover:text-slate-300 transition-colors">CGU</Link>
            <a href="https://uniflow.kernelforge.codes" target="_blank" rel="noopener noreferrer"
              className="hover:text-slate-300 transition-colors">
              uniflow.kernelforge.codes
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
