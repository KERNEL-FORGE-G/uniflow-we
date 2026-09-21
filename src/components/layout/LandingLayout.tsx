import { Link, useLocation } from 'react-router-dom'
import { ArrowRight, Download, Menu, X, Lock } from 'lucide-react'
import { useState } from 'react'
import { KERNEL_FORGE_LOGO_ALT, KERNEL_FORGE_LOGO_FALLBACK_URL, KERNEL_FORGE_LOGO_URL, UNIFLOW_PRIMARY_LOGO_ALT, UNIFLOW_PRIMARY_LOGO_URL, UNIFLOW_WORDMARK_SVG, UNIFLOW_WORDMARK_WHITE_SVG } from '../../lib/brandAssets'
import { useUserRole } from '../../utils/userRole'
import { CONTACT_PHONE_DISPLAY, COVERAGE_LABEL, COVERAGE_SHORT, KERNEL_FORGE_GITHUB_URL, KERNEL_FORGE_WHATSAPP_GROUP_URL } from '../../lib/contactInfo'
import { LEGAL_DOCUMENTS } from '../../data/legal'
import { findRelease, releaseFallbackUrl, useAppReleases } from '../../lib/appReleases'

// Le SVG local d'abord (net, aucun aller-retour réseau) ; le PNG du bucket
// Appwrite ne sert plus que de repli si le SVG venait à manquer.
const logo = UNIFLOW_WORDMARK_SVG
const restoreOriginalLogo = (event: React.SyntheticEvent<HTMLImageElement>) => {
  event.currentTarget.onerror = null
  event.currentTarget.src = UNIFLOW_PRIMARY_LOGO_URL
}

// « Télécharger » est mis en avant (pastille) : c'est la porte d'entrée vers
// l'APK Android et la version de bureau, dont les liens vivent dans la
// collection `app_releases` et sont réglés depuis la page Administration.
const navLinks = [
  { to: '/about',        label: 'À propos' },
  { to: '/teams',        label: 'Équipe' },
  { to: '/sentinelle',   label: 'Sentinelle' },
  { to: '/pricing',      label: 'Tarifs' },
  { to: '/presentation', label: 'Présentation' },
  { to: '/forum',        label: 'Forum' },
  { to: '/contact',      label: 'Contact' },
  { to: '/download',     label: 'Télécharger', highlight: true },
]

export function LandingNavbar() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const { currentUser, authUser, isSessionReady } = useUserRole()
  const isConnected = isSessionReady && currentUser.email !== '—'
  const workspacePath = authUser?.role === 'ADMIN' ? '/admin' : '/app'

  // Huit entrées plus le logo et les deux boutons ne tiennent pas entre 768 et
  // 1024 px : la barre complète attend `lg`, le menu replié sert jusque-là.
  return (
    <nav className="sticky top-0 z-50 border-b border-[#e5e7eb] bg-white/95 backdrop-blur-sm" aria-label="Navigation principale">
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
        <div className="hidden items-center gap-6 lg:flex xl:gap-8">
          {navLinks.map(l => (
            <Link
              key={l.to}
              to={l.to}
              aria-current={pathname === l.to ? 'page' : undefined}
              className={
                l.highlight
                  ? `inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                      pathname === l.to
                        ? 'bg-[#0d9488] text-white'
                        : 'bg-[#f0fdfa] text-[#0d9488] hover:bg-[#ccfbf1]'
                    }`
                  : `text-sm font-medium transition-colors ${
                      pathname === l.to
                        ? 'text-[#1e3a8a] font-semibold'
                        : 'text-[#6b7280] hover:text-[#1e3a8a]'
                    }`
              }
            >
              {l.highlight ? <Download className="h-3.5 w-3.5" /> : null}
              {l.label}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden items-center gap-2 lg:flex">
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
          type="button"
          className="lg:hidden rounded-lg p-2 text-[#374151] hover:bg-[#f9fafb]"
          onClick={() => setOpen(v => !v)}
          aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={open}
          aria-controls="menu-mobile"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div id="menu-mobile" className="border-t border-[#e5e7eb] bg-white px-6 py-4 space-y-3 lg:hidden animate-fade-in">
          {navLinks.map(l => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className={l.highlight
                ? 'inline-flex items-center gap-1.5 rounded-full bg-[#f0fdfa] px-3.5 py-1.5 text-sm font-semibold text-[#0d9488]'
                : 'block text-sm font-medium text-[#374151] hover:text-[#1e3a8a]'}
            >
              {l.highlight ? <Download className="h-3.5 w-3.5" /> : null}
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
  // Lien APK Android dynamique (collection `app_releases`) ; sans version
  // publiée, il mène à la page des releases GitHub.
  const { data: releases } = useAppReleases()
  const android = findRelease(releases, 'android')
  return (
    <footer className="bg-[#0f172a] text-slate-300">
      <div className="mx-auto w-full max-w-[1920px] px-6 py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              {/* Version blanche : plus besoin de la tuile blanche qui découpait le pied de page sombre */}
              <img
                src={UNIFLOW_WORDMARK_WHITE_SVG}
                alt={UNIFLOW_PRIMARY_LOGO_ALT}
                onError={restoreOriginalLogo}
                className="h-10 w-auto object-contain"
              />
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
              Une plateforme académique UniFlow reliée à Appwrite, déployée sur le périmètre {COVERAGE_LABEL} — toutes filières, de la L1 au M1.
            </p>
            <div className="mt-5 flex gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Données Appwrite
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300">
                <Lock className="h-3 w-3 text-slate-400" /> Accès par rôle
              </span>
            </div>
            <Link to="/about" className="mt-6 inline-flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 px-3 py-2 transition hover:border-slate-600 hover:bg-slate-800/80">
              <img
                src={KERNEL_FORGE_LOGO_URL}
                alt={KERNEL_FORGE_LOGO_ALT}
                loading="lazy"
                decoding="async"
                onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = KERNEL_FORGE_LOGO_FALLBACK_URL }}
                className="h-12 w-auto object-contain"
              />
              <span className="text-left">
                <span className="block text-xs font-black uppercase tracking-wider text-white">Un projet KERNEL FORGE</span>
                <span className="block text-[11px] text-slate-400">Startup technologique · Yaoundé</span>
              </span>
            </Link>
          </div>

          {/* Produit */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Produit</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { to: '/#fonctionnalites', label: 'Fonctionnalités' },
                { to: '/presentation', label: 'Présentation' },
                { to: '/pricing', label: 'Tarifs' },
                { to: '/download', label: 'Télécharger les applications' },
                { to: '/forum', label: 'Forum' },
              ].map(l => (
                <li key={l.label}>
                  <Link to={l.to} className="text-slate-400 hover:text-white transition-colors">{l.label}</Link>
                </li>
              ))}
              <li>
                <a
                  href={android?.url ?? releaseFallbackUrl}
                  target={android ? undefined : '_blank'}
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  {android ? `Application Android (APK ${android.version})` : 'Application Android (APK) — bientôt'}
                </a>
              </li>
            </ul>
          </div>

          {/* Ressources */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Ressources</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { to: '/presentation', label: 'Documentation du projet' },
                { to: '/contact', label: 'Support' },
                { to: '/forum', label: 'Forum' },
                { to: KERNEL_FORGE_WHATSAPP_GROUP_URL, label: 'Groupe WhatsApp KERNEL FORGE', external: true },
                { to: KERNEL_FORGE_GITHUB_URL, label: 'GitHub', external: true },
              ].map(l => (
                <li key={l.label}>
                  {l.external ? (
                    <a href={l.to} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">{l.label}</a>
                  ) : (
                    <Link to={l.to} className="text-slate-400 hover:text-white transition-colors">{l.label}</Link>
                  )}
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
          <p>© 2026 UniFlow — KERNEL FORGE · Périmètre : {COVERAGE_SHORT} · WhatsApp {CONTACT_PHONE_DISPLAY}</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {LEGAL_DOCUMENTS.map((doc) => (
              <Link key={doc.slug} to={doc.path} className="hover:text-slate-300 transition-colors">{doc.shortTitle}</Link>
            ))}
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
