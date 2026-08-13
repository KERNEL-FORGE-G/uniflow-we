import { useState } from 'react'
import { 
  MessageSquare, ThumbsUp, Star, Search, Filter, Plus, ShieldCheck, 
  UserCheck, GraduationCap, CheckCircle, Send, Award, Users, 
  MessageCircle, Sparkles, X
} from 'lucide-react'
import { LandingNavbar, LandingFooter } from '../components/layout/LandingLayout'

interface ForumPost {
  id: string
  author: string
  role: 'Étudiant' | 'Enseignant' | 'Délégué' | 'Administration'
  university: string
  avatarBg: string
  verified: boolean
  title: string
  content: string
  rating: number
  likes: number
  date: string
  category: string
  tags: string[]
  isLiked?: boolean
}

const INITIAL_POSTS: ForumPost[] = [
  {
    id: '1',
    author: 'KOUAMÉ Jean-Luc',
    role: 'Délégué',
    university: 'Université de Yaoundé I — ICT4D',
    avatarBg: 'bg-blue-600 text-white',
    verified: true,
    title: 'La prise de présence QR Code nous fait gagner 20 minutes par cours !',
    content: 'En tant que délégué du niveau 3 Informatique, faire l\'appel manuellement prenait énormément de temps avant chaque TPE. Avec le scanner QR Code d\'UniFlow, les étudiants flashent leur badge en entrant et le rapport PDF est généré immédiatement pour l\'enseignant. Un vrai soulagement !',
    rating: 5,
    likes: 42,
    date: 'Hier à 14:30',
    category: 'Prise de Présence',
    tags: ['QR Code', 'Délégué', 'Gain de Temps']
  },
  {
    id: '2',
    author: 'Dr. MBARGA Samuel',
    role: 'Enseignant',
    university: 'Faculté des Sciences — Département de Mathématiques',
    avatarBg: 'bg-teal-600 text-white',
    verified: true,
    title: 'Une aubaine pour la gestion des notes et la détection d\'anomalies',
    content: 'La possibilité de saisir les notes en mode offline sur mon ordinateur portable dans les amphis peu couverts par le réseau, puis d\'effectuer la synchronisation automatique dès que je rentre à mon bureau, change complètement la donne. Plus aucune perte de fichier Excel.',
    rating: 5,
    likes: 38,
    date: 'Il y a 2 jours',
    category: 'Gestion Académique',
    tags: ['Saisie Notes', 'Offline First', 'Enseignant']
  },
  {
    id: '3',
    author: 'NGONO Patricia',
    role: 'Étudiant',
    university: 'Niveau 2 — Biochimie',
    avatarBg: 'bg-purple-600 text-white',
    verified: false,
    title: 'Je consulte mon emploi du temps même sans connexion Internet',
    content: 'En début de semestre les emplois du temps bougent souvent. Avec la PWA UniFlow installée sur mon téléphone Android, j\'ai accès instantanément aux salles modifiées même quand je n\'ai plus de crédit data. Merci à l\'équipe KERNEL FORGE pour ce travail formidable.',
    rating: 5,
    likes: 29,
    date: 'Il y a 3 jours',
    category: 'Emploi du Temps',
    tags: ['Offline PWA', 'Mobile', 'Étudiant']
  },
  {
    id: '4',
    author: 'Prof. TCHAMBA Alexis',
    role: 'Administration',
    university: 'Doyen Adjoint — Université de Douala',
    avatarBg: 'bg-[#1e3a8a] text-white',
    verified: true,
    title: 'Un outil stratégique pour la gouvernance numérique de nos facultés',
    content: 'Nous avons testé la démo globale d\'UniFlow avec nos chefs de départements. Les tableaux de bord de présence par filière et les statistiques globales nous offrent une visibilité sans précédent sur le déroulement réel des enseignements.',
    rating: 5,
    likes: 56,
    date: 'Il y a 5 jours',
    category: 'Gouvernance',
    tags: ['Statistiques', 'Administration', 'Gouvernance']
  },
  {
    id: '5',
    author: 'BASSOMPIE Grace',
    role: 'Étudiant',
    university: 'Master 1 — Génie Logiciel',
    avatarBg: 'bg-emerald-600 text-white',
    verified: true,
    title: 'Le module Sentinelle IoT apporte un vrai sentiment de sécurité',
    content: 'Avoir un Kiosque Santé sur le campus capable de prendre les constantes vitale de base (température, tension, SpO2) en toute confidentialité et sans file d\'attente est une innovation fantastique pour les étudiants.',
    rating: 5,
    likes: 19,
    date: 'Il y a 1 semaine',
    category: 'Sentinelle IoT',
    tags: ['Santé', 'IoT', 'Campus Care']
  }
]

export default function ForumPage() {
  const [posts, setPosts] = useState<ForumPost[]>(() => {
    try {
      const saved = localStorage.getItem('uniflow_forum_posts')
      return saved ? JSON.parse(saved) : INITIAL_POSTS
    } catch {
      return INITIAL_POSTS
    }
  })

  // Synchroniser avec localStorage
  const updatePosts = (newPosts: ForumPost[] | ((prev: ForumPost[]) => ForumPost[])) => {
    setPosts(prev => {
      const updated = typeof newPosts === 'function' ? newPosts(prev) : newPosts
      try {
        localStorage.setItem('uniflow_forum_posts', JSON.stringify(updated))
      } catch {}
      return updated
    })
  }

  const [selectedRole, setSelectedRole] = useState<string>('Tous')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'rating'>('recent')
  const [showModal, setShowModal] = useState(false)

  // New post form state
  const [authorName, setAuthorName] = useState('')
  const [authorRole, setAuthorRole] = useState<'Étudiant' | 'Enseignant' | 'Délégué' | 'Administration'>('Étudiant')
  const [university, setUniversity] = useState('Université de Yaoundé I')
  const [postTitle, setPostTitle] = useState('')
  const [postContent, setPostContent] = useState('')
  const [postCategory, setPostCategory] = useState('Retour d\'expérience')
  const [postRating, setPostRating] = useState(5)

  const handleLike = (id: string) => {
    updatePosts(prev => prev.map(p => {
      if (p.id === id) {
        return {
          ...p,
          likes: p.isLiked ? p.likes - 1 : p.likes + 1,
          isLiked: !p.isLiked
        }
      }
      return p
    }))
  }

  const handleDeletePost = (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer ce message ?')) return
    updatePosts(prev => prev.filter(p => p.id !== id))
  }

  const handleSubmitPost = (e: React.FormEvent) => {
    e.preventDefault()
    if (!authorName.trim() || !postTitle.trim() || !postContent.trim()) return

    const newPost: ForumPost = {
      id: Date.now().toString(),
      author: authorName,
      role: authorRole,
      university: university || 'Université de Yaoundé I (Indépendant)',
      avatarBg: authorRole === 'Enseignant' ? 'bg-teal-600 text-white' : authorRole === 'Délégué' ? 'bg-blue-600 text-white' : authorRole === 'Administration' ? 'bg-[#1e3a8a] text-white' : 'bg-purple-600 text-white',
      verified: true,
      title: postTitle,
      content: postContent,
      rating: postRating,
      likes: 1,
      isLiked: true,
      date: 'À l\'instant',
      category: postCategory,
      tags: [authorRole, 'Avis']
    }

    updatePosts(prev => [newPost, ...prev])
    setShowModal(false)
    setAuthorName('')
    setPostTitle('')
    setPostContent('')
  }

  // Filter & Sort Logic
  const filteredPosts = posts.filter(post => {
    const matchesRole = selectedRole === 'Tous' || post.role === selectedRole
    const matchesSearch = searchQuery === '' || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.university.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesRole && matchesSearch
  }).sort((a, b) => {
    if (sortBy === 'popular') return b.likes - a.likes
    if (sortBy === 'rating') return b.rating - a.rating
    return 0 // Default recent
  })

  // Stats calculation
  const totalReviews = posts.length
  const avgRating = (posts.reduce((acc, p) => acc + p.rating, 0) / totalReviews).toFixed(1)
  const totalLikes = posts.reduce((acc, p) => acc + p.likes, 0)

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans selection:bg-[#1e3a8a] selection:text-white">
      <LandingNavbar />

      {/* Hero Header */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/80 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 pt-16 pb-14 border-b border-slate-200/80 dark:border-slate-800">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-700/50 px-4 py-1.5 text-xs font-bold text-[#1e3a8a] dark:text-blue-300 mb-6 shadow-2xs">
            <Users className="h-3.5 w-3.5 text-[#1e3a8a] dark:text-blue-300" />
            Espace Échange & Retours d'Expérience
          </span>

          <h1 className="text-3xl font-black text-slate-900 dark:text-white sm:text-5xl tracking-tight mb-4 leading-tight">
            Forum & Témoignages de la <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1e3a8a] via-[#2d4fa8] to-[#0d9488] dark:from-blue-400 dark:via-indigo-300 dark:to-teal-300">Communauté UniFlow</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-medium leading-relaxed mb-8">
            Découvrez les avis, conseils et retours d'utilisation des étudiants, enseignants, délégués et responsables administratifs.
          </p>

          {/* Stats Bar */}
          <div className="grid sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-sm text-center">
              <span className="text-2xl font-black text-[#1e3a8a]">{totalReviews}</span>
              <p className="text-xs text-slate-500 font-medium">Avis Vérifiés Publiés</p>
            </div>
            <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-sm text-center">
              <div className="flex items-center justify-center gap-1">
                <span className="text-2xl font-black text-amber-500">{avgRating}</span>
                <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
              </div>
              <p className="text-xs text-slate-500 font-medium">Note Moyenne Globale</p>
            </div>
            <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-sm text-center">
              <span className="text-2xl font-black text-teal-600">{totalLikes}</span>
              <p className="text-xs text-slate-500 font-medium">Recommandations & Likes</p>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN FORUM CONTENT */}
      <section className="py-12 bg-slate-50">
        <div className="mx-auto max-w-5xl px-6">
          
          {/* Controls Bar: Search, Category Filters, Create Post Button */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher par mot-clé, nom, université..."
                className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 py-3 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-[#1e3a8a] focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 shadow-2xs"
              />
            </div>

            {/* Sort Dropdown & Publish Button */}
            <div className="flex items-center gap-3 shrink-0">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="rounded-2xl border border-slate-200 bg-white px-3.5 py-3 text-xs font-bold text-slate-700 focus:outline-none shadow-2xs cursor-pointer"
              >
                <option value="recent">Plus récents</option>
                <option value="popular">Plus populaires</option>
                <option value="rating">Meilleures notes</option>
              </select>

              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#1e3a8a] hover:bg-[#2d4fa8] px-5 py-3 text-xs font-bold text-white shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <Plus className="h-4 w-4" /> Publier un avis
              </button>
            </div>

          </div>

          {/* Role Filter Tabs */}
          <div className="flex flex-wrap gap-2 mb-8 border-b border-slate-200 pb-4">
            {['Tous', 'Étudiant', 'Enseignant', 'Délégué', 'Administration'].map((role) => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedRole === role
                    ? 'bg-[#1e3a8a] text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {role}
              </button>
            ))}
          </div>

          {/* Posts List */}
          <div className="space-y-4">
            {filteredPosts.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-500">
                <MessageSquare className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                <p className="font-bold text-slate-700 text-sm">Aucun résultat ne correspond à votre recherche.</p>
                <p className="text-xs text-slate-500 mt-1">Essayez un autre mot-clé ou réinitialisez les filtres.</p>
              </div>
            ) : (
              filteredPosts.map((post) => (
                <div
                  key={post.id}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all"
                >
                  {/* Top row: Author Info & Date */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl font-black text-xs shadow-xs ${post.avatarBg}`}>
                        {post.author.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-slate-900">{post.author}</p>
                          {post.verified && (
                            <span title="Utilisateur Vérifié">
                              <ShieldCheck className="h-4 w-4 text-teal-600" />
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-bold text-slate-600 border border-slate-200">
                            {post.role}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">{post.university}</p>
                      </div>
                    </div>

                    <span className="text-[11px] text-slate-400 font-medium shrink-0">{post.date}</span>
                  </div>

                  {/* Rating & Category */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3.5 w-3.5 ${
                            i < post.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs font-bold text-[#1e3a8a] bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                      {post.category}
                    </span>
                  </div>

                  {/* Title & Body */}
                  <h2 className="text-base font-bold text-slate-900 mb-2 leading-snug">
                    {post.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                    {post.content}
                  </p>

                  {/* Bottom bar: Tags & Like Button */}
                  <div className="flex items-center justify-between gap-4 pt-3 border-t border-slate-100 text-xs">
                    <div className="flex flex-wrap gap-1.5">
                      {post.tags.map((tag) => (
                        <span key={tag} className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <button
                      onClick={() => handleLike(post.id)}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                        post.isLiked
                          ? 'bg-blue-100 text-[#1e3a8a] border border-blue-200 shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                      }`}
                    >
                      <ThumbsUp className={`h-3.5 w-3.5 ${post.isLiked ? 'fill-[#1e3a8a]' : ''}`} />
                      <span>{post.likes}</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </section>

      {/* PUBLISH MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-[#1e3a8a]" />
                Publier un retour d'expérience
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="rounded-xl p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitPost} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Votre Nom & Prénom *</label>
                <input
                  type="text"
                  required
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Ex: NGHOMSI Ravel"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-medium text-slate-900 focus:border-[#1e3a8a] focus:outline-none focus:bg-white"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Rôle *</label>
                  <select
                    value={authorRole}
                    onChange={(e) => setAuthorRole(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:border-[#1e3a8a] focus:outline-none focus:bg-white"
                  >
                    <option value="Étudiant">Étudiant</option>
                    <option value="Enseignant">Enseignant</option>
                    <option value="Délégué">Délégué</option>
                    <option value="Administration">Administration</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Note (sur 5 étoiles)</label>
                  <div className="flex items-center gap-1 pt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setPostRating(star)}
                        className="p-1 cursor-pointer"
                      >
                        <Star className={`h-5 w-5 ${star <= postRating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Université / Faculté</label>
                <input
                  type="text"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  placeholder="Ex: Université de Yaoundé I"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-medium text-slate-900 focus:border-[#1e3a8a] focus:outline-none focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Titre de votre avis *</label>
                <input
                  type="text"
                  required
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  placeholder="Ex: Un vrai gain de temps au quotidien"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-medium text-slate-900 focus:border-[#1e3a8a] focus:outline-none focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Détails de votre expérience *</label>
                <textarea
                  required
                  rows={4}
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="Partagez comment UniFlow vous aide dans votre travail ou vos études..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-medium text-slate-900 focus:border-[#1e3a8a] focus:outline-none focus:bg-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1e3a8a] hover:bg-[#2d4fa8] text-xs font-bold text-white shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" /> Publier mon avis
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <LandingFooter />
    </div>
  )
}
