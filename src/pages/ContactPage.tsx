import { useState } from 'react'
import { 
  Mail, Phone, MapPin, Send, MessageSquare, Clock, CheckCircle2, 
  Copy, ExternalLink, Sparkles, Building2, Globe, Shield
} from 'lucide-react'
import { LandingNavbar, LandingFooter } from '../components/layout/LandingLayout'

export default function ContactPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('Démo & Déploiement Campus')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [copiedText, setCopiedText] = useState<string | null>(null)

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopiedText(label)
    setTimeout(() => setCopiedText(null), 2000)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubmitted(true)
      setFullName('')
      setEmail('')
      setMessage('')
    }, 1200)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans selection:bg-[#1e3a8a] selection:text-white">
      <LandingNavbar />

      {/* Hero Header */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/80 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 pt-16 pb-14 border-b border-slate-200/80 dark:border-slate-800">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-700/50 px-4 py-1.5 text-xs font-bold text-[#1e3a8a] dark:text-blue-300 mb-6 shadow-2xs">
            <Mail className="h-3.5 w-3.5 text-[#1e3a8a] dark:text-blue-300" />
            Équipe KERNEL FORGE à Votre Écoute
          </span>

          <h1 className="text-3xl font-black text-slate-900 dark:text-white sm:text-5xl tracking-tight mb-4 leading-tight">
            Contactez <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1e3a8a] via-[#2d4fa8] to-[#0d9488] dark:from-blue-400 dark:via-indigo-300 dark:to-teal-300">L'Équipe UniFlow</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-medium leading-relaxed">
            Une question sur le déploiement, une demande de démonstration personnalisée ou un projet de partenariat ? Nous vous répondons sous 24h.
          </p>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="py-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid lg:grid-cols-12 gap-10 items-start">
            
            {/* Left Column: Direct Contact Info */}
            <div className="lg:col-span-5 space-y-6">
              
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 sm:p-8 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-[#1e3a8a]" /> Coordonnées Directes
                </h2>

                <div className="space-y-5">
                  {/* Email Card */}
                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-[#1e3a8a]">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Général & Support</p>
                      <p className="text-xs sm:text-sm font-bold text-slate-900 truncate mt-0.5">ravelnghomsi@gmail.com</p>
                      <p className="text-[11px] text-slate-500 truncate">uniflow@kernelforge.codes</p>
                    </div>
                    <button
                      onClick={() => handleCopy('ravelnghomsi@gmail.com', 'email')}
                      className="p-2 text-slate-400 hover:text-[#1e3a8a] transition-colors cursor-pointer"
                      title="Copier l'email"
                    >
                      {copiedText === 'email' ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>

                  {/* Phone Card */}
                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-800">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Téléphone & WhatsApp</p>
                      <p className="text-xs sm:text-sm font-bold text-slate-900 truncate mt-0.5">+237 6 90 00 00 00</p>
                      <p className="text-[11px] text-slate-500">Disponible du Lun au Ven (8h-18h)</p>
                    </div>
                    <button
                      onClick={() => handleCopy('+237 6 90 00 00 00', 'phone')}
                      className="p-2 text-slate-400 hover:text-teal-700 transition-colors cursor-pointer"
                      title="Copier le numéro"
                    >
                      {copiedText === 'phone' ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>

                  {/* Campus Address */}
                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-800">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Localisation du Projet</p>
                      <p className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5">Université de Yaoundé I</p>
                      <p className="text-xs text-slate-600 leading-snug">Faculté des Sciences — Ngoa-Ekellé, Yaoundé, Cameroun</p>
                    </div>
                  </div>

                  {/* Opening Hours */}
                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Horaires de Permanence</p>
                      <p className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5">Lundi — Vendredi</p>
                      <p className="text-xs text-slate-600">08:00 – 17:30 (Heure de Yaoundé / WAT)</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mascotte & Quick Links */}
              <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-blue-50 to-teal-50 p-6 flex items-center gap-5 shadow-sm">
                <img 
                  src="/logos/mascotte.png" 
                  alt="UniFlow Mascotte" 
                  className="h-16 w-16 object-contain shrink-0 drop-shadow-sm" 
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = '/mascotte.png'
                  }}
                />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">KERNEL FORGE Labs</h4>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    Projet Open Source développé sous licence MIT pour les universités africaines.
                  </p>
                </div>
              </div>

            </div>

            {/* Right Column: Contact Form */}
            <div className="lg:col-span-7">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-lg">
                <h2 className="text-2xl font-black text-slate-900 mb-2">Envoyez-nous un Message</h2>
                <p className="text-xs sm:text-sm text-slate-600 mb-8">
                  Remplissez le formulaire ci-dessous et notre équipe technique vous recontactera rapidement.
                </p>

                {isSubmitted ? (
                  <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-8 text-center space-y-4 animate-in fade-in duration-300">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 mx-auto">
                      <CheckCircle2 className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-bold text-emerald-900">Message Envoyé avec Succès !</h3>
                    <p className="text-xs sm:text-sm text-emerald-700 max-w-md mx-auto leading-relaxed">
                      Merci pour votre intérêt envers UniFlow. Un membre de l'équipe KERNEL FORGE prendra contact avec vous à l'adresse indiquée sous 24h ouvrées.
                    </p>
                    <button
                      onClick={() => setIsSubmitted(false)}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
                    >
                      Envoyer un autre message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Nom & Prénom *</label>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Ex: Prof. MPOUO Alain"
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs sm:text-sm font-medium text-slate-900 focus:border-[#1e3a8a] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Adresse Email *</label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Ex: mpouo@univ-yaounde1.cm"
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs sm:text-sm font-medium text-slate-900 focus:border-[#1e3a8a] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Sujet de la Demande *</label>
                      <select
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs sm:text-sm font-bold text-slate-900 focus:border-[#1e3a8a] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 transition-all cursor-pointer"
                      >
                        <option value="Démo & Déploiement Campus">Demande de Démonstration & Déploiement Campus</option>
                        <option value="Support Technique">Support Technique & Assistance</option>
                        <option value="Partenariat & Contribution">Partenariat & Contribution Open Source</option>
                        <option value="Autre">Autre Demande</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Votre Message *</label>
                      <textarea
                        required
                        rows={5}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Décrivez votre projet, le nombre d'étudiants concernés ou toute question particulière..."
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs sm:text-sm font-medium text-slate-900 focus:border-[#1e3a8a] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 transition-all"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1e3a8a] hover:bg-[#2d4fa8] py-4 text-xs sm:text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-blue-900/20 transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          <span>Envoi en cours...</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          <span>Envoyer le message</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  )
}
