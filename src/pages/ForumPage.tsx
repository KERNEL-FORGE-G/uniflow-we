import { useState } from 'react'
import { Star, Send, ThumbsUp, MessageCircle, User } from 'lucide-react'
import { LandingNavbar, LandingFooter } from '../components/layout/LandingLayout'
import { AnimatedList } from '../components/ui/AnimatedList'

interface Comment {
  id: number
  name: string
  email: string
  rating: number
  text: string
  date: string
  likes: number
}

const mockComments: Comment[] = [
  { id: 1, name: 'Emma Martin', email: 'emma@uniflow.edu', rating: 5, text: 'Excellente plateforme ! L\'interface est intuitive et le mode offline est un vrai plus pour notre campus.', date: '12 mai 2026', likes: 8 },
  { id: 2, name: 'Lucas Dubois', email: 'lucas@uniflow.edu', rating: 4, text: 'Très bon outil pour la gestion des cours. Quelques petits bugs sur mobile mais globalement super !', date: '10 mai 2026', likes: 5 },
  { id: 3, name: 'Dr. Kamga', email: 'kamga@uniflow.edu', rating: 5, text: 'En tant qu\'enseignant, j\'apprécie énormément la simplicité de gestion des présences et des notes.', date: '8 mai 2026', likes: 12 },
]

export default function ForumPage() {
  const [comments, setComments] = useState<Comment[]>(mockComments)
  const [form, setForm] = useState({ name: '', email: '', rating: 5, text: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.text) return

    const newComment: Comment = {
      id: Date.now(),
      name: form.name,
      email: form.email,
      rating: form.rating,
      text: form.text,
      date: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
      likes: 0,
    }
    setComments([newComment, ...comments])
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setForm({ name: '', email: '', rating: 5, text: '' })
    }, 2000)
  }

  const avgRating = (comments.reduce((s, c) => s + c.rating, 0) / comments.length).toFixed(1)

  return (
    <div className="min-h-screen bg-white font-sans">
      <LandingNavbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1e3a8a] to-[#0d9488] py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/20 px-3 py-1 text-xs font-semibold text-white mb-5">
            <MessageCircle className="h-3 w-3" /> Forum communautaire
          </span>
          <h1 className="text-4xl font-extrabold text-white mb-4">Donnez votre avis sur UniFlow</h1>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto">
            Partagez votre expérience, notez la plateforme et aidez-nous à l'améliorer.
          </p>
          <div className="mt-6 flex items-center justify-center gap-6">
            <div className="text-center">
              <p className="text-4xl font-extrabold text-white">{avgRating}</p>
              <div className="flex gap-0.5 mt-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < Math.round(Number(avgRating)) ? 'fill-amber-300 text-amber-300' : 'text-white/40'}`} />
                ))}
              </div>
              <p className="text-xs text-blue-200 mt-1">{comments.length} avis</p>
            </div>
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="bg-[#f3f4f6] py-16">
        <div className="mx-auto max-w-3xl px-6">
          <div className="rounded-2xl border border-[#e5e7eb] bg-white p-8 shadow-sm">
            <h2 className="text-xl font-bold text-[#111827] mb-6">Laisser un commentaire</h2>
            {submitted ? (
              <div className="text-center py-8 animate-fade-in">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 mb-4">
                  <MessageCircle className="h-8 w-8 text-emerald-600" />
                </div>
                <p className="text-lg font-bold text-[#111827]">Merci pour votre avis !</p>
                <p className="text-sm text-[#6b7280] mt-1">Votre commentaire a été publié avec succès.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-[#374151] mb-1.5 uppercase tracking-wider">Nom *</label>
                    <input
                      value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required
                      placeholder="Votre nom"
                      className="w-full rounded-xl border border-[#e5e7eb] px-4 py-3 text-sm outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/10"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#374151] mb-1.5 uppercase tracking-wider">Email *</label>
                    <input
                      type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required
                      placeholder="votre@email.com"
                      className="w-full rounded-xl border border-[#e5e7eb] px-4 py-3 text-sm outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/10"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-2 uppercase tracking-wider">Notation *</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(r => (
                      <button
                        key={r} type="button"
                        onClick={() => setForm({ ...form, rating: r })}
                        className="group"
                      >
                        <Star className={`h-8 w-8 transition-all ${form.rating >= r ? 'fill-amber-400 text-amber-400' : 'text-[#e5e7eb] group-hover:text-amber-200'}`} />
                      </button>
                    ))}
                    <span className="ml-2 text-sm font-bold text-[#1e3a8a] self-center">{form.rating}/5</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-1.5 uppercase tracking-wider">Commentaire *</label>
                  <textarea
                    rows={5} value={form.text} onChange={e => setForm({ ...form, text: e.target.value })} required
                    placeholder="Partagez votre expérience avec UniFlow..."
                    className="w-full rounded-xl border border-[#e5e7eb] px-4 py-3 text-sm outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/10 resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-xl bg-[#1e3a8a] px-7 py-3 text-sm font-bold text-white hover:bg-[#2d4fa8] transition-all shadow-lg"
                >
                  <Send className="h-4 w-4" /> Publier mon avis
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Comments list */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-2xl font-bold text-[#111827] mb-8">Tous les avis ({comments.length})</h2>
          <AnimatedList
            items={comments}
            showGradients
            enableArrowNavigation={false}
            displayScrollbar={false}
            className="max-h-[800px]"
            renderItem={(c: Comment) => (
              <div className="rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#eff3ff] text-[#1e3a8a] font-bold">
                    <User className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div>
                        <p className="font-semibold text-[#111827] text-sm">{c.name}</p>
                        <p className="text-xs text-[#9ca3af]">{c.date}</p>
                      </div>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-3.5 w-3.5 ${i < c.rating ? 'fill-amber-400 text-amber-400' : 'text-[#e5e7eb]'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-[#374151] leading-relaxed mt-2">{c.text}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <button className="flex items-center gap-1.5 text-xs text-[#6b7280] hover:text-[#1e3a8a] transition-colors">
                        <ThumbsUp className="h-3.5 w-3.5" />
                        <span>{c.likes}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          />
        </div>
      </section>

      <LandingFooter />
    </div>
  )
}
