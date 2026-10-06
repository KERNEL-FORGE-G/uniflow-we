import React, { useState, useEffect } from 'react'
import {
  HiBell,
  HiNewspaper,
  HiPaperAirplane,
  HiTrash,
  HiCheckCircle,
  HiExclamationTriangle,
  HiUserGroup,
  HiSparkles,
  HiMegaphone,
  HiBookmark,
  HiArrowPath,
} from 'react-icons/hi2'
import { newsApi, notificationsApi, type NewsItem } from '../../lib/api'

type TargetGroup = 'ALL' | 'STUDENT' | 'TEACHER' | 'DELEGATE' | 'PERSONAL'

export default function AdminNewsAndNotificationsPage() {
  const [activeTab, setActiveTab] = useState<'news' | 'push'>('news')

  // État Actualités
  const [newsList, setNewsList] = useState<NewsItem[]>([])
  const [isLoadingNews, setIsLoadingNews] = useState(false)
  const [newsTitle, setNewsTitle] = useState('')
  const [newsContent, setNewsContent] = useState('')
  const [newsChannel, setNewsChannel] = useState('Administration UY1')
  const [isNewsImportant, setIsNewsImportant] = useState(false)
  const [isNewsPinned, setIsNewsPinned] = useState(false)
  const [isPublishingNews, setIsPublishingNews] = useState(false)

  // État Notifications Push Groupées
  const [targetGroup, setTargetGroup] = useState<TargetGroup>('ALL')
  const [pushTitle, setPushTitle] = useState('')
  const [pushMessage, setPushMessage] = useState('')
  const [pushType, setPushType] = useState('ANNOUNCEMENT')
  const [pushLink, setPushLink] = useState('')
  const [isSendingPush, setIsSendingPush] = useState(false)

  // Retours utilisateur
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message })
    setTimeout(() => setFeedback(null), 5000)
  }

  // Chargement des actualités
  const loadNews = async () => {
    setIsLoadingNews(true)
    try {
      const items = await newsApi.list()
      setNewsList(items)
    } catch {
      showFeedback('error', 'Impossible de charger les actualités.')
    } finally {
      setIsLoadingNews(false)
    }
  }

  useEffect(() => {
    loadNews()
  }, [])

  // Publication d'une actualité
  const handlePublishNews = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newsTitle.trim() || !newsContent.trim()) {
      showFeedback('error', 'Le titre et le contenu sont requis.')
      return
    }

    setIsPublishingNews(true)
    try {
      await newsApi.create({
        title: newsTitle.trim(),
        content: newsContent.trim(),
        channel: newsChannel.trim(),
        important: isNewsImportant,
        pinned: isNewsPinned,
      })
      showFeedback('success', 'Actualité officielle publiée avec succès.')
      setNewsTitle('')
      setNewsContent('')
      setIsNewsImportant(false)
      setIsNewsPinned(false)
      loadNews()
    } catch (err: any) {
      showFeedback('error', err?.message || 'Erreur lors de la publication de l’actualité.')
    } finally {
      setIsPublishingNews(false)
    }
  }

  // Suppression d'une actualité
  const handleDeleteNews = async (id: string) => {
    if (!window.confirm('Voulez-vous vraiment retirer cette actualité ?')) return
    try {
      await newsApi.delete(id)
      showFeedback('success', 'Actualité supprimée.')
      setNewsList(prev => prev.filter(n => n.id !== id))
    } catch (err: any) {
      showFeedback('error', err?.message || 'Erreur de suppression.')
    }
  }

  // Diffusion d'une notification push au groupe
  const handleSendPush = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pushTitle.trim() || !pushMessage.trim()) {
      showFeedback('error', 'Le titre et le message de la notification sont obligatoires.')
      return
    }

    setIsSendingPush(true)
    try {
      const res = await notificationsApi.broadcast({
        targetGroup,
        title: pushTitle.trim(),
        message: pushMessage.trim(),
        type: pushType,
        link: pushLink.trim() || undefined,
      })
      showFeedback('success', res.message || 'Notification push diffusée avec succès.')
      setPushTitle('')
      setPushMessage('')
      setPushLink('')
    } catch (err: any) {
      showFeedback('error', err?.message || 'Échec de l’envoi de la notification push.')
    } finally {
      setIsSendingPush(false)
    }
  }

  return (
    <div className="space-y-8 pb-20 animate-fade-in font-sans text-slate-800">
      {/* Toast Feedback */}
      {feedback && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-bold text-white transition-all ${
            feedback.type === 'success'
              ? 'bg-[#0D9488] border border-teal-400/40'
              : 'bg-rose-600 border border-rose-400/40'
          }`}
        >
          {feedback.type === 'success' ? (
            <HiCheckCircle className="h-5 w-5 text-teal-100" />
          ) : (
            <HiExclamationTriangle className="h-5 w-5 text-rose-100" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* HEADER HERO */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 border border-slate-200/80 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 text-[#1E3A8A] text-[11px] font-black uppercase tracking-wider mb-2">
              <HiMegaphone className="h-3.5 w-3.5 text-[#0D9488]" />
              Centre de Diffusion & Communication
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Actualités & Notifications Push
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
              Publiez des actualités officielles pour toute la communauté et diffusez des alertes push ciblées par groupe d'utilisateurs.
            </p>
          </div>

          {/* Onglets de contrôle */}
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/80">
            <button
              onClick={() => setActiveTab('news')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
                activeTab === 'news'
                  ? 'bg-[#1E3A8A] text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <HiNewspaper className="h-4 w-4" />
              <span>Actualités Officielles</span>
            </button>
            <button
              onClick={() => setActiveTab('push')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
                activeTab === 'push'
                  ? 'bg-gradient-to-r from-[#1E3A8A] to-[#0D9488] text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <HiBell className="h-4 w-4" />
              <span>Diffusion Push Groupée</span>
            </button>
          </div>
        </div>
      </div>

      {/* CONTENU ONGLET 1 : GESTION DES ACTUALITÉS */}
      {activeTab === 'news' && (
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Formulaire de création */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-2 pb-4 mb-5 border-b border-slate-100">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[#1E3A8A]">
                <HiSparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Nouvelle Actualité Campus</h3>
                <p className="text-[11px] text-slate-500">Seul l’admin peut créer et définir les actualités</p>
              </div>
            </div>

            <form onSubmit={handlePublishNews} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Titre de l'annonce *</label>
                <input
                  type="text"
                  required
                  value={newsTitle}
                  onChange={e => setNewsTitle(e.target.value)}
                  placeholder="Ex: Calendrier officiel des examens — Semestre 1"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-2.5 text-xs font-medium text-slate-800 outline-none focus:border-[#1E3A8A] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Canal / Établissement</label>
                <select
                  value={newsChannel}
                  onChange={e => setNewsChannel(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-2.5 text-xs font-medium text-slate-800 outline-none focus:border-[#1E3A8A] focus:bg-white"
                >
                  <option value="Administration UY1">🏛️ Administration UY1</option>
                  <option value="Faculté des Sciences">🔬 Faculté des Sciences</option>
                  <option value="Département Informatique">💻 Département Informatique / ICT4D</option>
                  <option value="Vie du Campus">🎓 Vie du Campus & Scolarité</option>
                  <option value="Examens & Concours">📋 Examens & Concours</option>
                  <option value="Bibliothèque & Recherche">📚 Bibliothèque & Recherche</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Contenu / Message *</label>
                <textarea
                  required
                  rows={5}
                  value={newsContent}
                  onChange={e => setNewsContent(e.target.value)}
                  placeholder="Rédigez les détails de l'annonce officielle pour les étudiants et enseignants..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 p-4 text-xs font-medium text-slate-800 outline-none focus:border-[#1E3A8A] focus:bg-white transition-all resize-none"
                />
              </div>

              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={isNewsImportant}
                    onChange={e => setIsNewsImportant(e.target.checked)}
                    className="h-4 w-4 rounded text-[#1E3A8A] focus:ring-0"
                  />
                  <span>Marquer urgent</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={isNewsPinned}
                    onChange={e => setIsNewsPinned(e.target.checked)}
                    className="h-4 w-4 rounded text-[#0D9488] focus:ring-0"
                  />
                  <span>Épingler en haut</span>
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isPublishingNews}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#1E3A8A] hover:bg-[#2D4FA8] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-98 disabled:opacity-50 cursor-pointer"
                >
                  <HiPaperAirplane className="h-4 w-4" />
                  <span>{isPublishingNews ? 'Publication...' : 'Publier l’actualité'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Liste des actualités actives */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between pb-2">
              <h3 className="font-bold text-sm text-slate-900">
                Actualités Publiées ({newsList.length})
              </h3>
              <button
                onClick={loadNews}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1E3A8A] hover:underline"
              >
                <HiArrowPath className={`h-3.5 w-3.5 ${isLoadingNews ? 'animate-spin' : ''}`} />
                Actualiser
              </button>
            </div>

            {newsList.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-dashed border-slate-300 text-slate-400">
                <HiNewspaper className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-semibold">Aucune actualité publiée pour le moment.</p>
                <p className="text-[11px] text-slate-400 mt-1">Utilisez le formulaire pour diffuser votre première annonce.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {newsList.map(item => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-[#1E3A8A] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200/60">
                          {item.channel}
                        </span>
                        {item.pinned && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
                            <HiBookmark className="h-3 w-3" /> Épinglé
                          </span>
                        )}
                        {item.important && (
                          <span className="text-[10px] font-black uppercase text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200/60">
                            Urgent
                          </span>
                        )}
                        <span className="text-[11px] text-slate-400">
                          {new Date(item.createdAt).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <h4 className="font-bold text-sm text-slate-900">{item.title}</h4>
                      <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                        {item.content}
                      </p>
                      <div className="text-[10px] text-slate-400 font-semibold pt-1">
                        Publié par : {item.author || 'Administration'}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteNews(item.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0"
                      title="Supprimer cette annonce"
                    >
                      <HiTrash className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* CONTENU ONGLET 2 : DIFFUSION NOTIFICATIONS PUSH GROUPÉES */}
      {activeTab === 'push' && (
        <div className="max-w-3xl mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-3 pb-4 mb-6 border-b border-slate-100">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-50 text-[#0D9488]">
              <HiBell className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Diffuser une Notification Push Groupée
              </h3>
              <p className="text-xs text-slate-500">
                Envoyez une alerte push instantanée à un groupe d’utilisateurs ciblé.
              </p>
            </div>
          </div>

          <form onSubmit={handleSendPush} className="space-y-6">
            {/* Choix du groupe cible */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2.5">
                Groupe cible de destinataires *
              </label>
              <div className="grid sm:grid-cols-3 gap-3">
                {[
                  { id: 'ALL', label: 'Tous les Utilisateurs', desc: 'Diffusion globale', icon: HiUserGroup },
                  { id: 'STUDENT', label: 'Étudiants uniquement', desc: 'Tous les étudiants', icon: HiUserGroup },
                  { id: 'TEACHER', label: 'Enseignants uniquement', desc: 'Corps professoral', icon: HiUserGroup },
                  { id: 'DELEGATE', label: 'Délégués de classe', desc: 'Gestionnaires de séances', icon: HiUserGroup },
                  { id: 'PERSONAL', label: 'Comptes indépendants', desc: 'Abonnés UniFlow Personnel', icon: HiUserGroup },
                ].map(group => {
                  const isSelected = targetGroup === group.id
                  return (
                    <button
                      key={group.id}
                      type="button"
                      onClick={() => setTargetGroup(group.id as TargetGroup)}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50/80 border-[#1E3A8A] ring-2 ring-[#1E3A8A]/20'
                          : 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-slate-900">{group.label}</span>
                        {isSelected && <HiCheckCircle className="h-4 w-4 text-[#1E3A8A]" />}
                      </div>
                      <p className="text-[11px] text-slate-500">{group.desc}</p>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Type & Titre */}
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Type de notification</label>
                <select
                  value={pushType}
                  onChange={e => setPushType(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-2.5 text-xs font-medium text-slate-800 outline-none focus:border-[#1E3A8A] focus:bg-white"
                >
                  <option value="ANNOUNCEMENT">📢 Annonce officielle</option>
                  <option value="URGENT">⚠️ Alerte urgente</option>
                  <option value="COURSE_ALERT">📅 Cours / Emploi du temps</option>
                  <option value="SYSTEM">⚙️ Maintenance système</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Titre de la notification *</label>
                <input
                  type="text"
                  required
                  value={pushTitle}
                  onChange={e => setPushTitle(e.target.value)}
                  placeholder="Ex: Rappel : Émargement obligatoire pour le cours de ce matin"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-2.5 text-xs font-medium text-slate-800 outline-none focus:border-[#1E3A8A] focus:bg-white"
                />
              </div>
            </div>

            {/* Corps du message */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Corps du message push *</label>
              <textarea
                required
                rows={4}
                value={pushMessage}
                onChange={e => setPushMessage(e.target.value)}
                placeholder="Rédigez le texte envoyé aux utilisateurs du groupe sélectionné..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 p-4 text-xs font-medium text-slate-800 outline-none focus:border-[#1E3A8A] focus:bg-white resize-none"
              />
            </div>

            {/* Lien facultatif */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Lien de redirection (Optionnel)</label>
              <input
                type="text"
                value={pushLink}
                onChange={e => setPushLink(e.target.value)}
                placeholder="Ex: /app/cours ou /actualites"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-2.5 text-xs font-medium text-slate-800 outline-none focus:border-[#1E3A8A] focus:bg-white"
              />
            </div>

            {/* Avertissement informatif */}
            <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4 text-xs text-blue-900 leading-relaxed">
              💡 Cette action enregistre instantanément une notification pour chaque membre actif appartenant au groupe <strong>[{targetGroup}]</strong>. L’alerte apparaîtra sur leur mobile, desktop et web.
            </div>

            {/* Bouton d'envoi */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSendingPush}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#1E3A8A] to-[#0D9488] hover:opacity-95 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-lg active:scale-98 disabled:opacity-50 cursor-pointer"
              >
                <HiPaperAirplane className="h-4 w-4" />
                <span>
                  {isSendingPush ? 'Envoi en cours...' : `Diffuser la notification push au groupe [${targetGroup}]`}
                </span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
