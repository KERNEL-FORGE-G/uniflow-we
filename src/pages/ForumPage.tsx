import { useEffect, useState } from 'react'
import { createForumPost, deleteForumPost, executeForumReactionAction, listForumPosts, type ForumPost as AppwriteForumPost } from '../lib/appwrite'
import { useAuth } from '../hooks/useAuth'
import { 
  MessageSquare, ThumbsUp, Star, Search, Filter, Plus, ShieldCheck, 
  UserCheck, GraduationCap, CheckCircle, Send, Award, Users, 
  MessageCircle, Sparkles, Trash2, X
} from 'lucide-react'
import { LandingNavbar, LandingFooter } from '../components/layout/LandingLayout'

type ForumPost = AppwriteForumPost & {
  id: string
  author: string
  avatarBg: string
  verified: boolean
  date: string
  isLiked?: boolean
}

function forumRoleLabel(role: string) {
  if (role === 'DELEGATE') return 'Délégué'
  if (role === 'TEACHER') return 'Enseignant'
  if (role === 'ADMIN') return 'Administration'
  return 'Étudiant'
}

export default function ForumPage() {
  const { getCurrentUser } = useAuth()
  const [posts, setPosts] = useState<ForumPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [isPublishing, setIsPublishing] = useState(false)

  useEffect(() => {
    let mounted = true
    const loadForum = async () => {
      try {
        const documents = await listForumPosts()
        let reactedPostIds = new Set<string>()
        if (getCurrentUser()) {
          try {
            const reactions = await executeForumReactionAction({ action: 'list' })
            reactedPostIds = new Set(reactions.reactedPostIds || [])
          } catch {
            // Les publications restent lisibles si le relevé des réactions est indisponible.
          }
        }
        if (!mounted) return
        setPosts(documents.map((post) => ({
          ...post,
          id: post.$id,
          author: post.authorName,
          avatarBg: 'bg-blue-600 text-white',
          verified: Boolean(post.authorId),
          date: new Date(post.createdAt).toLocaleString('fr-FR'),
          tags: Array.isArray(post.tags) && post.tags.length ? post.tags : [forumRoleLabel(post.role), post.category],
          isLiked: reactedPostIds.has(post.$id),
        })))
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : 'Impossible de charger le forum depuis Appwrite.')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    void loadForum()
    return () => { mounted = false }
  }, [getCurrentUser])

  const updatePosts = (newPosts: ForumPost[] | ((prev: ForumPost[]) => ForumPost[])) => {
    setPosts(prev => typeof newPosts === 'function' ? newPosts(prev) : newPosts)
  }

  const [selectedRole, setSelectedRole] = useState<string>('Tous')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'rating'>('recent')
  const [showModal, setShowModal] = useState(false)

  // New post form state
  const [postTitle, setPostTitle] = useState('')
  const [postContent, setPostContent] = useState('')
  const [postCategory, setPostCategory] = useState('Retour d\'expérience')
  const [postRating, setPostRating] = useState(5)

  const handleLike = async (id: string) => {
    if (!getCurrentUser()) {
      setActionError('Connectez-vous avec un compte UniFlow pour recommander une publication.')
      return
    }
    try {
      setActionError(null)
      const result = await executeForumReactionAction({ action: 'react', postId: id })
      updatePosts(prev => prev.map(post => post.id === id ? { ...post, likes: result.likes ?? post.likes, isLiked: Boolean(result.liked) } : post))
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Impossible de mettre à jour la recommandation.')
    }
  }

  const handleDeletePost = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer ce message ?')) return
    try {
      setActionError(null)
      await deleteForumPost(id)
      updatePosts(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Vous ne pouvez supprimer que vos propres publications.')
    }
  }

  const openPublishModal = () => {
    if (!getCurrentUser()) {
      setActionError('Connectez-vous avec un compte UniFlow pour publier dans le forum.')
      return
    }
    setActionError(null)
    setShowModal(true)
  }

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault()
    const user = getCurrentUser()
    if (!user) {
      setError('Connectez-vous avec un compte UniFlow pour publier dans le forum.')
      return
    }
    if (!postTitle.trim() || !postContent.trim()) return
    try {
      setIsPublishing(true)
      setActionError(null)
      const created = await createForumPost(user, {
        title: postTitle.trim(),
        content: postContent.trim(),
        category: postCategory,
        rating: postRating,
        tags: [],
      })
      const newPost: ForumPost = {
        ...(created as unknown as AppwriteForumPost),
        id: created.$id,
        author: created.authorName,
        avatarBg: 'bg-blue-600 text-white',
        verified: true,
        date: new Date(created.createdAt).toLocaleString('fr-FR'),
        tags: [forumRoleLabel(user.role), postCategory],
        isLiked: false,
      }
      updatePosts(prev => [newPost, ...prev])
      setShowModal(false)
      setPostTitle('')
      setPostContent('')
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'La publication n’a pas pu être enregistrée dans Appwrite.')
    } finally {
      setIsPublishing(false)
    }
  }

  // Filter & Sort Logic
  const filteredPosts = posts.filter(post => {
    const matchesRole = selectedRole === 'Tous' || forumRoleLabel(post.role) === selectedRole
    const matchesSearch = searchQuery === '' || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.university || '').toLowerCase().includes(searchQuery.toLowerCase())
    return matchesRole && matchesSearch
  }).sort((a, b) => {
    if (sortBy === 'popular') return b.likes - a.likes
    if (sortBy === 'rating') return b.rating - a.rating
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  // Stats calculation
  const totalReviews = posts.length
  const avgRating = totalReviews ? (posts.reduce((acc, p) => acc + p.rating, 0) / totalReviews).toFixed(1) : '—'
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
              <p className="text-xs text-slate-500 font-medium">Avis publiés dans cette session</p>
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
                onClick={openPublishModal}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#1e3a8a] hover:bg-[#2d4fa8] px-5 py-3 text-xs font-bold text-white shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <Plus className="h-4 w-4" /> Publier un avis
              </button>
            </div>

          </div>

          {actionError && (
            <div role="alert" className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {actionError}
            </div>
          )}

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
            {loading ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-500">Chargement des publications depuis Appwrite…</div>
            ) : error ? (
              <div className="rounded-3xl border border-red-200 bg-red-50 p-12 text-center text-red-700">{error}</div>
            ) : filteredPosts.length === 0 ? (
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
                            {forumRoleLabel(post.role)}
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

                    <div className="flex items-center gap-2">
                      {getCurrentUser()?.id === post.authorId && (
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-red-100 bg-red-50 px-3 py-1.5 font-bold text-xs text-red-700 transition-all hover:bg-red-100"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Supprimer
                        </button>
                      )}
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
                <p className="block text-xs font-bold text-slate-700 mb-1">Profil de publication</p>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-medium text-slate-700">
                  {getCurrentUser()?.name || 'Compte UniFlow requis'}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <p className="block text-xs font-bold text-slate-700 mb-1">Rôle</p>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-700">
                    {forumRoleLabel(getCurrentUser()?.role || 'STUDENT')}
                  </div>
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
                <label className="block text-xs font-bold text-slate-700 mb-1">Catégorie</label>
                <select
                  value={postCategory}
                  onChange={(e) => setPostCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:border-[#1e3a8a] focus:outline-none focus:bg-white"
                >
                  <option value="Retour d'expérience">Retour d’expérience</option>
                  <option value="Question">Question</option>
                  <option value="Suggestion">Suggestion</option>
                  <option value="Support">Support</option>
                </select>
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
                  disabled={isPublishing}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1e3a8a] hover:bg-[#2d4fa8] text-xs font-bold text-white shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" /> {isPublishing ? 'Publication…' : 'Publier mon avis'}
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
