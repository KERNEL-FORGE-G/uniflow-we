import { Link } from 'react-router-dom'
import { Monitor, Smartphone, Globe } from 'lucide-react'
import { LEGAL_DOCUMENTS } from '../../data/legal'
import { CONTACT_PHONE_DISPLAY, CONTACT_WHATSAPP_URL } from '../../lib/contactInfo'

/**
 * Pied de page de l'espace connecté.
 *
 * Toutes les entrées pointaient sur `#` (Blog, Carrières, Partenaires…) et le
 * copyright disait 2024 : chaque lien mène désormais à une page qui existe, et
 * les quatre documents juridiques (CGU, confidentialité, mentions légales,
 * droits des utilisateurs) sont accessibles depuis chaque écran.
 */
const COLUMNS: Array<{ title: string; links: Array<{ label: string; to: string; external?: boolean }> }> = [
  {
    title: 'Produit',
    links: [
      { label: 'Fonctionnalités', to: '/presentation' },
      { label: 'Tarifs', to: '/pricing' },
      { label: 'Sentinelle IoT', to: '/sentinelle' },
      { label: 'Forum', to: '/forum' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: "Centre d'aide", to: '/app/aide' },
      { label: 'Contact', to: '/contact' },
      { label: `WhatsApp ${CONTACT_PHONE_DISPLAY}`, to: CONTACT_WHATSAPP_URL, external: true },
    ],
  },
  {
    title: 'KERNEL FORGE',
    links: [
      { label: 'À propos', to: '/about' },
      { label: "L'équipe", to: '/teams' },
      ...LEGAL_DOCUMENTS.map((doc) => ({ label: doc.shortTitle, to: doc.path })),
    ],
  },
]

export function Footer() {
  return (
    <footer className="border-t border-[#e5e7eb] bg-white">
      <div className="mx-auto w-full max-w-[1920px] px-6 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-center gap-4">
          <div className="flex items-center gap-2 rounded-lg border border-[#e5e7eb] bg-[#f9fafb] px-4 py-2">
            <Smartphone className="h-4 w-4 text-[#1e3a8a]" />
            <span className="text-xs font-semibold text-[#374151]">Mobile Android & iOS</span>
            <span className="ml-1 text-xs text-[#6b7280]">(hors ligne)</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-[#e5e7eb] bg-[#f9fafb] px-4 py-2">
            <Globe className="h-4 w-4 text-[#0d9488]" />
            <span className="text-xs font-semibold text-[#374151]">Web progressive (PWA)</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-[#e5e7eb] bg-[#f9fafb] px-4 py-2">
            <Monitor className="h-4 w-4 text-[#7c3aed]" />
            <span className="text-xs font-semibold text-[#374151]">Desktop Windows, macOS & Linux</span>
            <span className="ml-1 text-xs text-[#6b7280]">(hors ligne, visio locale)</span>
          </div>
        </div>

        <div className="mb-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <img src="/logos/uniflow-wordmark.png" alt="UniFlow" className="mb-3 h-8 w-auto object-contain" loading="lazy" />
            <p className="text-xs leading-relaxed text-[#6b7280]">
              La plateforme académique de KERNEL FORGE : emploi du temps, cours, présences, notes et messagerie, reliés à Appwrite.
            </p>
          </div>
          {COLUMNS.map((column) => (
            <div key={column.title}>
              <h3 className="mb-3 text-sm font-bold text-[#111827]">{column.title}</h3>
              <ul className="space-y-2 text-xs text-[#6b7280]">
                {column.links.map((link) => (
                  <li key={link.label}>
                    {link.external ? (
                      <a href={link.to} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-[#1e3a8a]">{link.label}</a>
                    ) : (
                      <Link to={link.to} className="transition-colors hover:text-[#1e3a8a]">{link.label}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-[#e5e7eb] pt-6 sm:flex-row">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#9ca3af]">
            <span>© {new Date().getFullYear()} UniFlow — KERNEL FORGE. Tous droits réservés.</span>
            {LEGAL_DOCUMENTS.map((doc) => (
              <Link key={doc.slug} to={doc.path} className="transition-colors hover:text-[#1e3a8a]">{doc.shortTitle}</Link>
            ))}
          </div>
          <a href="https://uniflow.kernelforge.codes" className="text-xs text-[#9ca3af] transition-colors hover:text-[#1e3a8a]">
            uniflow.kernelforge.codes
          </a>
        </div>
      </div>
    </footer>
  )
}
