import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, HelpCircle, BookOpen, Video, MessageCircle, Mail, ChevronRight, X, Send, CheckCircle2 } from 'lucide-react'
import { supportApi, type SupportTicket } from '../lib/api'
import { useApi } from '../hooks/useApi'

const defaultFaqs = [
  { q: 'Comment réinitialiser mon mot de passe ?', a: 'Cliquez sur "Mot de passe oublié" sur la page de connexion, puis suivez les instructions envoyées par email.', cat: 'Compte' },
  { q: 'Comment télécharger un bulletin de notes en PDF ?', a: 'Allez dans Mes Notes > Bulletin du semestre > Télécharger PDF.', cat: 'Notes' },
  { q: 'Comment activer les notifications push ?', a: 'Paramètres > Notifications > Activer "Notifications push".', cat: 'Paramètres' },
  { q: 'Puis-je utiliser UniFlow hors ligne ?', a: 'Oui, UniFlow est Offline-First. Les données sont stockées localement et synchronisées au retour de connexion.', cat: 'Technique' },
  { q: 'Comment rejoindre une visioconférence ?', a: 'Cliquez sur le lien de visioconférence envoyé par votre enseignant, ou allez dans Visioconférence > Rejoindre.', cat: 'Visioconférence' },
  { q: 'Comment marquer les présences en tant que délégué ?', a: 'Espace Délégué > Gestion des présences > Sélectionner le cours > Marquer les présences.', cat: 'Présences' },
]

const guides = [
  { title: 'Guide de démarrage rapide', desc: 'Découvrez les fonctionnalités essentielles en 5 minutes.', icon: BookOpen, duration: '5 min', content: 'Bienvenue sur UniFlow! Commencez par configurer votre profil, consultez votre emploi du temps hebdomadaire dans l\'onglet "Planning", et accédez à vos cours en un clic.' },
  { title: 'Tutoriel vidéo : Mes Cours', desc: 'Comment naviguer dans vos cours et ressources.', icon: Video, duration: '8 min', content: 'Dans l\'onglet Cours, retrouvez vos unités d\'enseignement (UE), vos travaux dirigés (TD) et travaux pratiques (TP). Vous pouvez télécharger vos supports de cours directement en mode hors ligne.' },
  { title: 'Tutoriel vidéo : Visioconférence', desc: 'Organiser et rejoindre une visioconférence.', icon: Video, duration: '12 min', content: 'Créez une salle de visioconférence sécurisée depuis l\'onglet Visioconférence pour échanger en direct avec vos enseignants et vos camarades de promotion.' },
  { title: 'Présentation vidéo du projet', desc: 'Regardez la démo et découvrez l’interface UniFlow.', icon: Video, duration: '10 min', content: 'Explorez toutes les innovations d\'UniFlow : PWA Offline First, QR-code d\'émargement dynamique et synchronisation hybride.' },
  { title: 'Guide Offline First', desc: 'Utiliser UniFlow sans connexion Internet.', icon: BookOpen, duration: '7 min', content: 'UniFlow enregistre automatiquement vos actions en local si le réseau est indisponible. Vos modifications sont transmises au serveur dès qu\'une connexion stable est rétablie.' },
]

export default function HelpPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('Tous')
  const [showSupportModal, setShowSupportModal] = useState(false)
  const [supportMessage, setSupportMessage] = useState('')
  const [supportSubmitted, setSupportSubmitted] = useState(false)
  const [selectedGuide, setSelectedGuide] = useState<typeof guides[number] | null>(null)

  const { data: apiFaqs } = useApi(() => supportApi.faqs())
  const faqs = (apiFaqs && apiFaqs.length > 0) ? apiFaqs : defaultFaqs

  const filtered = faqs.filter(f => {
    const matchSearch = !search || f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase())
    const matchCat = category === 'Tous' || f.cat === category
    return matchSearch && matchCat
  })

  const cats = ['Tous', ...Array.from(new Set(faqs.map(f => f.cat)))]

  const handleSendSupport = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supportMessage.trim()) return
    await supportApi.sendTicket({ message: supportMessage, category: category !== 'Tous' ? category : 'Général' }).catch(() => null)
    setSupportSubmitted(true)
    setTimeout(() => {
      setSupportSubmitted(false)
      setShowSupportModal(false)
      setSupportMessage('')
    }, 2000)
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="rounded-xl bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] text-white p-8 text-center shadow-lg">
        <HelpCircle className="mx-auto h-12 w-12 mb-3 opacity-90" />
        <h1 className="text-2xl font-extrabold">Centre d'aide UniFlow</h1>
        <p className="text-sm text-blue-100 mt-2 max-w-md mx-auto">
          Trouvez des réponses à vos questions ou contactez notre équipe support.
        </p>
      </div>

      {/* Search */}
      <div className="rounded-xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9ca3af]" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Recherchez votre question..."
            className="w-full rounded-xl border border-[#e5e7eb] bg-[#f9fafb] py-3 pl-12 pr-4 text-sm outline-none focus:border-[#1e3a8a] focus:bg-white" />
        </div>
      </div>

      {/* Quick links */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { icon: MessageCircle, label: 'Chat en direct', desc: 'Parlez à un agent', color: 'text-[#1e3a8a]', bg: 'bg-[#eff3ff]', action: () => setShowSupportModal(true) },
          { icon: Mail, label: 'Email support', desc: 'support@uniflow.edu', color: 'text-[#0d9488]', bg: 'bg-[#f0fdfa]', action: () => window.location.href = 'mailto:support@uniflow.edu' },
          { icon: Video, label: 'Tutoriels vidéo', desc: '12 vidéos disponibles', color: 'text-[#7c3aed]', bg: 'bg-[#ede9fe]', action: () => setSelectedGuide(guides[1]) },
        ].map(l => (
          <button key={l.label} onClick={l.action} className="rounded-xl border border-[#e5e7eb] bg-white p-4 shadow-sm hover:shadow-md transition-all text-left">
            <div className={`inline-flex rounded-lg p-2 ${l.bg} mb-2`}>
              <l.icon className={`h-5 w-5 ${l.color}`} />
            </div>
            <h3 className="font-semibold text-[#111827] text-sm">{l.label}</h3>
            <p className="text-xs text-[#6b7280] mt-0.5">{l.desc}</p>
          </button>
        ))}
      </div>

      {/* Guides */}
      <div className="rounded-xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
        <h2 className="text-sm font-bold text-[#111827] mb-4 flex items-center gap-1.5"><BookOpen className="h-4 w-4 text-[#1e3a8a]" /> Guides & Tutoriels</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {guides.map(g => {
            const card = (
              <div className="flex items-center gap-3 rounded-lg border border-[#e5e7eb] p-3 hover:bg-[#f9fafb] transition-colors text-left w-full">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#f3f4f6]">
                  <g.icon className="h-5 w-5 text-[#1e3a8a]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[#111827] text-sm">{g.title}</h3>
                  <p className="text-xs text-[#9ca3af] mt-0.5">{g.desc} · {g.duration}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-[#9ca3af] shrink-0" />
              </div>
            )

            return g.title === 'Présentation vidéo du projet' ? (
              <Link key={g.title} to="/app/demo">{card}</Link>
            ) : (
              <button key={g.title} type="button" onClick={() => setSelectedGuide(g)} className="w-full text-left">{card}</button>
            )
          })}
        </div>
      </div>

      {/* FAQ */}
      <div className="rounded-xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <h2 className="text-sm font-bold text-[#111827] flex items-center gap-1.5"><HelpCircle className="h-4 w-4 text-[#1e3a8a]" /> Questions fréquentes</h2>
          <div className="flex flex-wrap gap-1">
            {cats.map(c => (
              <button key={c} onClick={() => setCategory(c)}
                className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${category === c ? 'bg-[#1e3a8a] text-white' : 'bg-[#f3f4f6] text-[#6b7280] hover:bg-[#e5e7eb]'}`}>
                {c}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          {filtered.length === 0 && (
            <p className="text-sm text-[#9ca3af] py-8 text-center">Aucune question trouvée. Essayez un autre terme de recherche.</p>
          )}
          {filtered.map((f, i) => (
            <details key={i} className="group rounded-lg border border-[#e5e7eb] bg-white hover:bg-[#f9fafb] transition-colors">
              <summary className="flex cursor-pointer items-center justify-between p-4 text-sm font-semibold text-[#111827]">
                <span>{f.q}</span>
                <ChevronRight className="h-4 w-4 text-[#9ca3af] transition-transform group-open:rotate-90" />
              </summary>
              <div className="border-t border-[#f3f4f6] px-4 py-3 text-sm text-[#6b7280]">
                {f.a}
              </div>
            </details>
          ))}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="rounded-xl bg-[#f3f4f6] border border-[#e5e7eb] p-6 text-center">
        <p className="text-sm font-semibold text-[#111827] mb-2">Vous ne trouvez pas votre réponse ?</p>
        <p className="text-xs text-[#6b7280] mb-4">Notre équipe support est disponible 24/7 pour vous aider.</p>
        <button onClick={() => setShowSupportModal(true)} className="inline-flex items-center gap-2 rounded-lg bg-[#1e3a8a] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#2d4fa8] transition-colors shadow-md">
          <MessageCircle className="h-4 w-4" /> Contacter le support
        </button>
      </div>

      {/* Modal Guide Detail */}
      {selectedGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#f3f4f6] pb-3">
              <div className="flex items-center gap-2">
                <selectedGuide.icon className="h-5 w-5 text-[#1e3a8a]" />
                <h3 className="font-bold text-base text-[#111827]">{selectedGuide.title}</h3>
              </div>
              <button onClick={() => setSelectedGuide(null)} className="rounded-lg p-1 text-[#9ca3af] hover:bg-[#f3f4f6]">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-xs font-semibold text-[#1e3a8a] bg-[#eff3ff] px-3 py-1 rounded-full w-fit">
              {selectedGuide.desc} · Durée estimée : {selectedGuide.duration}
            </p>
            <div className="rounded-xl bg-[#f9fafb] border border-[#e5e7eb] p-4 text-sm text-[#374151] leading-relaxed">
              {selectedGuide.content}
            </div>
            <div className="flex justify-end">
              <button onClick={() => setSelectedGuide(null)} className="rounded-xl bg-[#1e3a8a] px-5 py-2 text-sm font-semibold text-white hover:bg-[#2d4fa8]">
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Support Form */}
      {showSupportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#f3f4f6] pb-3">
              <h3 className="font-bold text-base text-[#111827] flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-[#1e3a8a]" /> Contacter le Support UniFlow
              </h3>
              <button onClick={() => setShowSupportModal(false)} className="rounded-lg p-1 text-[#9ca3af] hover:bg-[#f3f4f6]">
                <X className="h-5 w-5" />
              </button>
            </div>

            {supportSubmitted ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500 animate-bounce" />
                <p className="text-base font-bold text-[#111827]">Message envoyé !</p>
                <p className="text-xs text-[#6b7280]">Un membre de l'équipe académique vous répondra sous quelques minutes.</p>
              </div>
            ) : (
              <form onSubmit={handleSendSupport} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#374151] mb-1 uppercase tracking-wider">Votre message / sujet</label>
                  <textarea
                    required
                    rows={4}
                    value={supportMessage}
                    onChange={e => setSupportMessage(e.target.value)}
                    placeholder="Décrivez votre problème ou posez votre question..."
                    className="w-full rounded-xl border border-[#e5e7eb] p-3 text-sm outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/10"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setShowSupportModal(false)} className="rounded-xl border border-[#e5e7eb] px-4 py-2 text-sm font-semibold text-[#374151] hover:bg-[#f9fafb]">
                    Annuler
                  </button>
                  <button type="submit" className="flex items-center gap-2 rounded-xl bg-[#1e3a8a] px-5 py-2 text-sm font-bold text-white hover:bg-[#2d4fa8]">
                    <Send className="h-4 w-4" /> Envoyer
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

