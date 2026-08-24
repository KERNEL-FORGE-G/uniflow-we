import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

interface SEOHeadProps {
  title?: string
  description?: string
  canonicalUrl?: string
}

const PAGE_SEO_CONFIG: Record<string, { title: string; description: string }> = {
  '/': {
    title: 'UniFlow — Plateforme Universitaire Intelligente | KERNEL FORGE',
    description: 'UniFlow est la plateforme universitaire tout-en-un développée par KERNEL FORGE. Cours, emploi du temps, présences QR code, notes et visioconférence HD.'
  },
  '/about': {
    title: 'À propos — UniFlow & KERNEL FORGE | Innovation Éducative',
    description: 'Découvrez la vision d\'UniFlow par KERNEL FORGE : transformer la gestion universitaire en Afrique grâce aux technologies PWA Offline-First et IoT.'
  },
  '/teams': {
    title: 'L\'Équipe — KERNEL FORGE & Développeurs UniFlow',
    description: 'Faites connaissance avec les ingénieurs, designers et enseignants passionnés derrière le projet UniFlow.'
  },
  '/sentinelle': {
    title: 'Sentinelle IoT — Surveillance Intelligente des Salles | UniFlow',
    description: 'Système IoT de surveillance environnementale et d\'accès autonome pour amphis et salles de cours universitaires.'
  },
  '/pricing': {
    title: 'Tarifs & Offres — Déploiement Établissements | UniFlow',
    description: 'Consultez les offres d\'intégration UniFlow pour départements, facultés et universités. Version communautaire gratuite et licences pro.'
  },
  '/presentation': {
    title: 'Présentation & Vidéos Démo — UniFlow Platform',
    description: 'Visionnez les démonstrations interactives des fonctionnalités d\'UniFlow : Visioconférence, PWA offline, Sentinelle IoT et émargement QR Code.'
  },
  '/forum': {
    title: 'Forum Communautaire Universitaire — UniFlow',
    description: 'Espace d\'échange, d\'entraide académique et de discussion pour étudiants, délégués et enseignants.'
  },
  '/contact': {
    title: 'Contact & Support Technique — KERNEL FORGE',
    description: 'Contactez l\'équipe KERNEL FORGE pour toute demande de démonstration, partenariat ou assistance technique UniFlow.'
  },
  '/login': {
    title: 'Connexion — Espace Académique UniFlow',
    description: 'Accédez à votre espace sécurisé étudiant, enseignant ou délégué sur la plateforme UniFlow.'
  },
  '/register': {
    title: 'Inscription — Créer un Compte UniFlow',
    description: 'Inscrivez-vous sur UniFlow pour suivre vos cours, consulter votre emploi du temps et valider vos présences.'
  }
}

export default function SEOHead({ title, description, canonicalUrl }: SEOHeadProps) {
  const { pathname } = useLocation()

  useEffect(() => {
    const matched = PAGE_SEO_CONFIG[pathname]
    const finalTitle = title || (matched ? matched.title : 'UniFlow — Plateforme Universitaire Intelligente')
    const finalDesc = description || (matched ? matched.description : 'Plateforme universitaire intelligente de gestion académique par KERNEL FORGE.')
    const finalCanonical = canonicalUrl || `https://uniflow.kernelforge.codes${pathname}`

    // Update Document Title
    document.title = finalTitle

    // Helper to set meta content
    const setMeta = (selector: string, attr: string, value: string) => {
      let el = document.querySelector(selector)
      if (!el) {
        el = document.createElement('meta')
        if (selector.includes('name=')) {
          el.setAttribute('name', selector.split('name="')[1].split('"')[0])
        } else if (selector.includes('property=')) {
          el.setAttribute('property', selector.split('property="')[1].split('"')[0])
        }
        document.head.appendChild(el)
      }
      el.setAttribute(attr, value)
    }

    setMeta('meta[name="description"]', 'content', finalDesc)
    setMeta('meta[name="title"]', 'content', finalTitle)
    setMeta('meta[property="og:title"]', 'content', finalTitle)
    setMeta('meta[property="og:description"]', 'content', finalDesc)
    setMeta('meta[property="og:url"]', 'content', finalCanonical)
    setMeta('meta[name="twitter:title"]', 'content', finalTitle)
    setMeta('meta[name="twitter:description"]', 'content', finalDesc)

    const isPrivateRoute = pathname === '/login' || pathname === '/register' || pathname === '/subscribe' || pathname.startsWith('/app') || pathname.startsWith('/admin')
    setMeta(
      'meta[name="robots"]',
      'content',
      isPrivateRoute ? 'noindex, nofollow, noarchive' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    )

    // Update canonical link tag
    let canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', finalCanonical)

  }, [pathname, title, description, canonicalUrl])

  return null
}
