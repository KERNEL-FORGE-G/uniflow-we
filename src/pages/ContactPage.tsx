import { useState } from 'react'
import { Mail, Phone, MapPin, Send, CheckCircle, MessageSquare, Clock, Loader2 } from 'lucide-react'
import { LandingNavbar, LandingFooter } from '../components/layout/LandingLayout'
import { ScrollFloat } from '../components/ui/ScrollFloat'

const contactInfo = [
  { icon: Mail,    label: 'Email', value: 'ravelnghomsi@gmail.com', sub: 'Réponse sous 24h' },
  { icon: Phone,   label: 'Téléphone', value: '+237 657 635 644', sub: 'Lun–Ven 8h–18h' },
  { icon: MapPin,  label: 'Adresse', value: 'Université de Yaoundé I', sub: 'Yaoundé, Cameroun' },
  { icon: Clock,   label: 'Horaires', value: 'Lundi – Vendredi', sub: '08h00 – 18h00' },
]

const subjects = [
  'Question générale',
  'Support technique',
  'Partenariat institutionnel',
  'Déploiement campus',
  'Extension Sentinelle',
  'Autre',
]

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: subjects[0], message: '' })
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.name || !form.email || !form.message) {
      setError('Veuillez remplir tous les champs obligatoires.')
      return
    }
    setLoading(true)
    await new Promise(r => setTimeout(r, 1200))
    setLoading(false)
    setSent(true)
  }

  return (
    <div className="min-h-screen bg-white font-sans">
      <LandingNavbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1e3a8a] to-[#0d9488] py-16 text-center">
        <div className="mx-auto max-w-3xl px-6">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/20 px-3 py-1 text-xs font-semibold text-white mb-5">
            <MessageSquare className="h-3 w-3" /> On est là pour vous aider
          </span>
          <ScrollFloat 
            containerClassName="text-4xl font-extrabold text-white mb-4"
            textClassName="text-white"
            animationDuration={0.8}
            stagger={0.02}
          >
            Contactez l'équipe UniFlow
          </ScrollFloat>
          <p className="text-lg text-blue-100">
            Une question, un partenariat, un déploiement campus ? Notre équipe vous répond sous 24h.
          </p>
        </div>
      </section>

      {/* Contact section */}
      <section className="bg-[#f3f4f6] py-16">
        <div className="mx-auto max-w-[1920px] px-6">
          <div className="grid gap-10 lg:grid-cols-3">

            {/* Info cards */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-[#111827] mb-2">Nos coordonnées</h2>
              {contactInfo.map(({ icon: Icon, label, value, sub }) => (
                <div key={label} className="flex items-start gap-4 rounded-2xl border border-[#e5e7eb] bg-white p-4 shadow-sm">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eff3ff]">
                    <Icon className="h-5 w-5 text-[#1e3a8a]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#9ca3af] font-medium">{label}</p>
                    <p className="text-sm font-semibold text-[#111827] mt-0.5">{value}</p>
                    <p className="text-xs text-[#6b7280] mt-0.5">{sub}</p>
                  </div>
                </div>
              ))}

              {/* Mascot */}
              <div className="rounded-2xl bg-gradient-to-br from-[#1e3a8a] to-[#0d9488] p-6 text-center">
                <img src="/logos/mascotte.png" alt="Mascotte" className="mx-auto h-20 w-20 object-contain mb-3 animate-float" />
                <p className="text-sm font-semibold text-white">Pas de réponse ?</p>
                <p className="text-xs text-blue-200 mt-1">Notre chouette répond toujours !</p>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-2 rounded-2xl border border-[#e5e7eb] bg-white p-8 shadow-sm">
              {sent ? (
                <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 mb-4">
                    <CheckCircle className="h-8 w-8 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-bold text-[#111827] mb-2">Message envoyé !</h3>
                  <p className="text-[#6b7280] mb-6 max-w-sm">
                    Merci pour votre message. Notre équipe vous répondra dans les 24 heures.
                  </p>
                  <button
                    onClick={() => { setSent(false); setForm({ name: '', email: '', subject: subjects[0], message: '' }) }}
                    className="rounded-xl bg-[#1e3a8a] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#2d4fa8] transition-all"
                  >
                    Envoyer un autre message
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-[#111827] mb-6">Envoyer un message</h2>
                  {error && (
                    <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                      {error}
                    </div>
                  )}
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-semibold text-[#374151] mb-1.5 uppercase tracking-wider">
                          Nom complet *
                        </label>
                        <input
                          value={form.name} onChange={e => set('name', e.target.value)} required
                          placeholder="Emma Martin"
                          className="w-full rounded-xl border border-[#e5e7eb] px-4 py-3 text-sm outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/10 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#374151] mb-1.5 uppercase tracking-wider">
                          Adresse email *
                        </label>
                        <input
                          type="email" value={form.email} onChange={e => set('email', e.target.value)} required
                          placeholder="emma@uniflow.edu"
                          className="w-full rounded-xl border border-[#e5e7eb] px-4 py-3 text-sm outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/10 transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#374151] mb-1.5 uppercase tracking-wider">
                        Sujet
                      </label>
                      <select
                        value={form.subject} onChange={e => set('subject', e.target.value)}
                        className="w-full rounded-xl border border-[#e5e7eb] px-4 py-3 text-sm outline-none focus:border-[#1e3a8a] transition-all"
                      >
                        {subjects.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#374151] mb-1.5 uppercase tracking-wider">
                        Message *
                      </label>
                      <textarea
                        rows={6} value={form.message} onChange={e => set('message', e.target.value)} required
                        placeholder="Décrivez votre demande..."
                        className="w-full rounded-xl border border-[#e5e7eb] px-4 py-3 text-sm outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/10 transition-all resize-none"
                      />
                    </div>
                    <button
                      type="submit" disabled={loading}
                      className="flex items-center gap-2 rounded-xl bg-[#1e3a8a] px-8 py-3.5 text-sm font-bold text-white hover:bg-[#2d4fa8] disabled:opacity-60 transition-all shadow-lg"
                    >
                      {loading ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /> Envoi en cours...</>
                      ) : (
                        <><Send className="h-4 w-4" /> Envoyer le message</>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Map placeholder */}
      <section className="bg-white py-8">
        <div className="mx-auto max-w-[1920px] px-6">
          <div className="rounded-2xl overflow-hidden border border-[#e5e7eb] bg-[#f3f4f6] h-48 flex items-center justify-center">
            <div className="text-center text-[#9ca3af]">
              <MapPin className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Université de Yaoundé I — Yaoundé, Cameroun</p>
            </div>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  )
}
