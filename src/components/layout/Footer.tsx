import { Monitor, Smartphone, Download, Globe } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-[#e5e7eb] bg-white">
      <div className="w-full max-w-[1920px] mx-auto px-6 py-8">
        {/* Platform badges */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#f9fafb] border border-[#e5e7eb]">
            <Smartphone className="h-4 w-4 text-[#1e3a8a]" />
            <span className="text-xs font-semibold text-[#374151]">Mobile iOS & Android</span>
            <span className="ml-1 text-xs text-[#6b7280]">(Offline)</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#f9fafb] border border-[#e5e7eb]">
            <Globe className="h-4 w-4 text-[#0d9488]" />
            <span className="text-xs font-semibold text-[#374151]">Web Progressive (PWA)</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#f9fafb] border border-[#e5e7eb]">
            <Monitor className="h-4 w-4 text-[#7c3aed]" />
            <span className="text-xs font-semibold text-[#374151]">Desktop Win, Mac & Linux</span>
            <span className="ml-1 text-xs text-[#6b7280]">(Offline)</span>
          </div>
        </div>

        {/* Main footer content */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <img
                src="https://i.imgur.com/GAiZ7WY.png"
                alt="UniFlow"
                className="h-8 w-auto object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  if (!target.dataset.triedFallback) {
                    target.dataset.triedFallback = 'true'
                    target.src = '/logo_1.png'
                  }
                }}
              />
            </div>
            <p className="text-xs text-[#6b7280] leading-relaxed">
              La plateforme universitaire intelligente pour la gestion académique complète.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-bold text-[#111827] mb-3">Produit</h3>
            <ul className="space-y-2 text-xs text-[#6b7280]">
              <li><a href="#" className="hover:text-[#1e3a8a] transition-colors">Fonctionnalités</a></li>
              <li><a href="#" className="hover:text-[#1e3a8a] transition-colors">Tarifs</a></li>
              <li><a href="#" className="hover:text-[#1e3a8a] transition-colors">Téléchargements</a></li>
              <li><a href="#" className="hover:text-[#1e3a8a] transition-colors">Mises à jour</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold text-[#111827] mb-3">Support</h3>
            <ul className="space-y-2 text-xs text-[#6b7280]">
              <li><a href="#" className="hover:text-[#1e3a8a] transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-[#1e3a8a] transition-colors">Tutoriels</a></li>
              <li><a href="#" className="hover:text-[#1e3a8a] transition-colors">Centre d'aide</a></li>
              <li><a href="#" className="hover:text-[#1e3a8a] transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold text-[#111827] mb-3">Entreprise</h3>
            <ul className="space-y-2 text-xs text-[#6b7280]">
              <li><a href="#" className="hover:text-[#1e3a8a] transition-colors">À propos</a></li>
              <li><a href="#" className="hover:text-[#1e3a8a] transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-[#1e3a8a] transition-colors">Carrières</a></li>
              <li><a href="#" className="hover:text-[#1e3a8a] transition-colors">Partenaires</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#e5e7eb]">
          <div className="flex items-center gap-4 text-xs text-[#9ca3af]">
            <span>© 2024 UniFlow. Tous droits réservés.</span>
            <a href="#" className="hover:text-[#1e3a8a] transition-colors">Confidentialité</a>
            <a href="#" className="hover:text-[#1e3a8a] transition-colors">CGU</a>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#9ca3af]">
            <Download className="h-3.5 w-3.5" />
            <span>Version 1.0.0</span>
            <span>•</span>
            <a href="https://uniflow.kernelforge.codes" className="hover:text-[#1e3a8a] transition-colors">
              uniflow.kernelforge.codes
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
