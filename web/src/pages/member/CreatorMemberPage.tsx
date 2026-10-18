import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import {
  Code2,
  Upload,
  User,
  Sparkles,
  ArrowRight,
  Check,
  X,
  Plus,
  ExternalLink,
  ShieldCheck,
  Camera,
  Layers,
  Globe,
  Github,
  Linkedin,
  Mail,
  RefreshCw,
  Eye,
} from 'lucide-react'
import { useUserRole } from '@/utils/userRole'
import {
  isProjectCreatorMember,
  getMatchedTeamMember,
  setCreatorInterfacePreference,
} from '@/lib/teamMemberAuth'
import {
  listTeamMembers,
  uploadAvatarImage,
  executeTeamRosterAction,
  type TeamMemberDocument,
} from '@/lib/appwrite'
import { DEFAULT_TEAM_ROSTER, parseStacks } from '@/lib/teamModel'
import { TeamMemberAvatar } from '@/components/team/TeamMemberAvatar'
import { TeamMemberCard } from '@/components/team/TeamMemberCard'
import { UniIcon } from '@/components/ui/UniIcon'

const POPULAR_STACKS = [
  'React',
  'TypeScript',
  'Flutter',
  'Dart',
  'NestJS',
  'Node.js',
  'Appwrite BaaS',
  'Tailwind CSS',
  'PostgreSQL',
  'Docker',
  'Python',
  'Cybersécurité',
  'Réseaux & Infra',
  'UI/UX Figma',
  'Architecture Logicielle',
  'Microservices',
  'Mobile Android',
  'Linux SysAdmin',
  'Git / CI-CD',
  'Marketing Tech',
]

export default function CreatorMemberPage() {
  const navigate = useNavigate()
  const { currentUser, authUser } = useUserRole()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [members, setMembers] = useState<TeamMemberDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Champs modifiables du profil membre
  const [memberDoc, setMemberDoc] = useState<TeamMemberDocument | null>(null)
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [subTeam, setSubTeam] = useState('')
  const [bio, setBio] = useState('')
  const [github, setGithub] = useState('')
  const [linkedin, setLinkedin] = useState('')
  const [website, setWebsite] = useState('')
  const [email, setEmail] = useState('')
  const [avatarFileId, setAvatarFileId] = useState('')
  const [stacks, setStacks] = useState<string[]>([])
  const [customStackInput, setCustomStackInput] = useState('')

  // Aperçu photo locale
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)

  // Chargement de l'équipe et association du membre
  useEffect(() => {
    let cancelled = false
    listTeamMembers()
      .then((docs) => {
        if (cancelled) return
        const loaded = docs.length > 0 ? docs : (DEFAULT_TEAM_ROSTER as unknown as TeamMemberDocument[])
        setMembers(loaded)
        const match = getMatchedTeamMember(currentUser || authUser, loaded)
        if (match) {
          initMemberFields(match)
        }
      })
      .catch((err) => {
        if (cancelled) return
        console.warn('Erreur chargement équipe:', err)
        const fallback = DEFAULT_TEAM_ROSTER as unknown as TeamMemberDocument[]
        setMembers(fallback)
        const match = getMatchedTeamMember(currentUser || authUser, fallback)
        if (match) {
          initMemberFields(match)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [currentUser, authUser])

  function initMemberFields(doc: TeamMemberDocument) {
    setMemberDoc(doc)
    setName(doc.name || '')
    setRole(doc.role || '')
    setSubTeam(doc.subTeam || '')
    setBio(doc.bio || '')
    setGithub(doc.github || '')
    setLinkedin(doc.linkedin || '')
    setWebsite(doc.website || '')
    setEmail(doc.email || currentUser?.email || '')
    setAvatarFileId(doc.avatarFileId || '')
    setStacks(parseStacks(doc.stacks))
  }

  // Bascule vers l'interface standard
  const handleSwitchToStandard = () => {
    setCreatorInterfacePreference('standard')
    navigate('/app')
  }

  // Gestion des stacks
  const handleAddStack = (stackName: string) => {
    const trimmed = stackName.trim()
    if (!trimmed) return
    if (!stacks.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      setStacks([...stacks, trimmed])
    }
    setCustomStackInput('')
  }

  const handleRemoveStack = (stackToRemove: string) => {
    setStacks(stacks.filter((s) => s !== stackToRemove))
  }

  // Gestion de la photo
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Veuillez sélectionner un fichier image valide (JPG, PNG ou WebP).')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('La taille de la photo ne doit pas dépasser 5 Mo.')
      return
    }

    setErrorMessage(null)
    setPhotoFile(file)
    const previewUrl = URL.createObjectURL(file)
    setPhotoPreview(previewUrl)
  }

  // Enregistrement des modifications
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!memberDoc) return

    setSaving(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      let finalAvatarFileId = avatarFileId

      // Si une nouvelle photo a été choisie, téléversement dans le bucket Appwrite
      if (photoFile) {
        try {
          finalAvatarFileId = await uploadAvatarImage(photoFile)
          setAvatarFileId(finalAvatarFileId)
        } catch (uploadErr) {
          console.warn('Téléversement photo échoué via function, conservation de la référence locale:', uploadErr)
          // Si le bucket direct échoue, on conserve la photo en prévisualisation
        }
      }

      const stacksString = stacks.join(', ')

      const payload = {
        action: 'update' as const,
        memberId: memberDoc.$id,
        slug: memberDoc.slug,
        name: name.trim() || memberDoc.name,
        role: role.trim() || memberDoc.role,
        team: memberDoc.team,
        subTeam: subTeam.trim() || memberDoc.subTeam,
        badge: memberDoc.badge || 'Membre Bâtisseur',
        accent: memberDoc.accent || 'cyan',
        github: github.replace(/^@/, '').trim(),
        email: email.trim(),
        avatarFileId: finalAvatarFileId,
        bio: bio.trim(),
        linkedin: linkedin.trim(),
        website: website.trim(),
        stacks: stacksString,
        displayOrder: memberDoc.displayOrder || 0,
      }

      await executeTeamRosterAction(payload)

      // Mise à jour de l'état local
      const updatedDoc: TeamMemberDocument = {
        ...memberDoc,
        ...payload,
        stacks: stacksString,
      }
      setMemberDoc(updatedDoc)
      setSuccessMessage('Vos modifications ont été enregistrées avec succès et sont visibles sur la page Équipe !')
      setPhotoFile(null)
    } catch (err) {
      console.error('Erreur enregistrement membre:', err)
      setErrorMessage(
        err instanceof Error ? err.message : 'Erreur lors de la mise à jour de votre fiche membre.'
      )
    } finally {
      setSaving(false)
    }
  }

  // Création du document d'aperçu dynamique
  const previewMember: TeamMemberDocument = memberDoc
    ? {
        ...memberDoc,
        name: name || memberDoc.name,
        role: role || memberDoc.role,
        subTeam: subTeam || memberDoc.subTeam,
        bio: bio || memberDoc.bio,
        github,
        linkedin,
        website,
        email,
        avatarFileId: photoPreview || avatarFileId || memberDoc.avatarFileId,
        stacks: stacks.join(', '),
      }
    : (DEFAULT_TEAM_ROSTER[0] as unknown as TeamMemberDocument)

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070B14] text-slate-900 dark:text-slate-100 font-sans pb-20">
      {/* ── 1. Hero Bento Header ────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0B132B] via-[#1E3A8A] to-[#0D9488] px-6 py-12 text-white shadow-xl">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-10 h-64 w-64 rounded-full bg-blue-600/25 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/20 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-amber-300 border border-amber-400/30 backdrop-blur-md">
                  <Sparkles className="h-3.5 w-3.5" />
                  Bâtisseur Officiel KERNEL FORGE
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-cyan-200 border border-white/15">
                  Projet UniFlow
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Mon Espace Membre Bâtisseur
              </h1>
              <p className="mt-2 text-sm sm:text-base text-blue-100 max-w-2xl leading-relaxed">
                Personnalisez votre identité officielle au sein de l'équipe de conception : téléversez votre photo haute définition et gérez vos stacks technologiques qui s'affichent publiquement.
              </p>
            </div>

            {/* Actions d'en-tête */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleSwitchToStandard}
                className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-3 text-xs sm:text-sm font-bold text-white border border-white/20 hover:bg-white/20 transition-all shadow-sm"
              >
                <User className="h-4 w-4 text-cyan-300" />
                Interface Standard
              </button>
              <Link
                to="/teams"
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-xs sm:text-sm font-bold text-[#1e3a8a] shadow-lg shadow-black/20 hover:bg-blue-50 transition-all"
              >
                <Eye className="h-4 w-4" />
                Voir la page Équipe
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Contenu Principal Bento ───────────────────────────────────── */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 mt-8">
        {/* Messages de retour */}
        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/40 p-4 text-sm font-semibold text-emerald-800 dark:text-emerald-300 shadow-sm"
            >
              <Check className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span className="flex-1">{successMessage}</span>
              <button
                type="button"
                onClick={() => setSuccessMessage(null)}
                className="rounded-full p-1 text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          )}

          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 flex items-center gap-3 rounded-2xl border border-rose-500/30 bg-rose-50 dark:bg-rose-950/40 p-4 text-sm font-semibold text-rose-800 dark:text-rose-300 shadow-sm"
            >
              <X className="h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400" />
              <span className="flex-1">{errorMessage}</span>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="rounded-full p-1 text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Colonne Gauche : Formulaire & Configuration (7 colonnes) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Bento Card 1 : Téléversement Photo */}
            <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0F172A] p-6 sm:p-7 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 dark:bg-cyan-950/50 text-[#0d9488]">
                  <Camera className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">
                    Photo de Profil Officielle
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Image haute définition affichée sur votre carte membre et le portail
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* Photo Preview avec anneau */}
                <div className="relative group shrink-0">
                  <div className="h-28 w-28 overflow-hidden rounded-2xl border-2 border-dashed border-[#0d9488] bg-slate-100 dark:bg-slate-800 p-1 shadow-md">
                    <img
                      src={photoPreview || avatarFileId || memberDoc?.avatarFileId || '/illustrations/uni_copilot_3d.png'}
                      alt={name || 'Photo membre'}
                      className="h-full w-full rounded-xl object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/illustrations/uni_copilot_3d.png'
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Upload className="h-6 w-6" />
                  </button>
                </div>

                <div className="flex-1 space-y-3 text-center sm:text-left">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handlePhotoSelect}
                    className="hidden"
                  />
                  <div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-800 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                      <Upload className="h-4 w-4" />
                      Choisir une nouvelle photo…
                    </button>
                    {photoFile && (
                      <span className="block mt-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        Image sélectionnée : {photoFile.name} ({(photoFile.size / 1024).toFixed(0)} Ko)
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Formats acceptés : JPG, PNG ou WebP. Dimension recommandée : carré 800×800 px ou plus.
                  </p>
                </div>
              </div>
            </div>

            {/* Bento Card 2 : Gestion des Stacks Technologiques */}
            <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0F172A] p-6 sm:p-7 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                  <Code2 className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">
                    Mes Stacks Technologiques & Compétences
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Technologies, frameworks et langages que vous maîtrisez sur le projet UniFlow
                  </p>
                </div>
              </div>

              {/* Badges actuels */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Stacks sélectionnées ({stacks.length}) :
                </label>
                <div className="min-h-[52px] rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-3 flex flex-wrap gap-2">
                  {stacks.length === 0 ? (
                    <span className="text-xs text-slate-400 italic">
                      Aucune stack ajoutée. Cliquez sur une suggestion ci-dessous ou saisissez-en une.
                    </span>
                  ) : (
                    stacks.map((stack) => (
                      <span
                        key={stack}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-500/30 bg-cyan-50 dark:bg-cyan-950/60 px-3 py-1.5 text-xs font-bold text-[#0d9488] dark:text-cyan-300 shadow-xs"
                      >
                        {stack}
                        <button
                          type="button"
                          onClick={() => handleRemoveStack(stack)}
                          className="rounded-full p-0.5 hover:bg-cyan-200 dark:hover:bg-cyan-900 text-cyan-700 dark:text-cyan-400 transition-colors"
                          aria-label={`Supprimer ${stack}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Champ d'ajout personnalisé */}
              <div className="mt-4 flex gap-2">
                <input
                  type="text"
                  value={customStackInput}
                  onChange={(e) => setCustomStackInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddStack(customStackInput)
                    }
                  }}
                  placeholder="Ajouter une stack (ex: Next.js, Rust, GraphQL...)"
                  className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
                />
                <button
                  type="button"
                  onClick={() => handleAddStack(customStackInput)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#0d9488] px-4 py-2 text-xs font-bold text-white hover:bg-[#0f766e] transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" /> Ajouter
                </button>
              </div>

              {/* Suggestions rapides en 1 clic */}
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
                <span className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2.5">
                  Suggestions rapides (cliquer pour ajouter) :
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_STACKS.map((stack) => {
                    const isAdded = stacks.some((s) => s.toLowerCase() === stack.toLowerCase())
                    return (
                      <button
                        key={stack}
                        type="button"
                        disabled={isAdded}
                        onClick={() => handleAddStack(stack)}
                        className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all ${
                          isAdded
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed opacity-50'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-[#1e3a8a] hover:text-white'
                        }`}
                      >
                        {isAdded ? `✓ ${stack}` : `+ ${stack}`}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Bento Card 3 : Informations & Liens */}
            <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0F172A] p-6 sm:p-7 shadow-sm space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">
                    Identité & Liens Professionnels
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Coordonnées publiques visibles sur la carte membre
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nom complet :
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Rôle / Intitulé :
                  </label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="ex. Développeur Full-Stack"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Bio / Courte présentation :
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Présentez vos réalisations et votre mission sur UniFlow..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <Github className="h-3.5 w-3.5" /> GitHub :
                  </label>
                  <input
                    type="text"
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    placeholder="Pseudo sans @"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <Linkedin className="h-3.5 w-3.5" /> LinkedIn :
                  </label>
                  <input
                    type="text"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    placeholder="URL ou profil"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <Globe className="h-3.5 w-3.5" /> Site web :
                  </label>
                  <input
                    type="text"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://..."
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
                  />
                </div>
              </div>

              {/* Bouton d'enregistrement */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#1E3A8A] to-[#0D9488] px-6 py-3.5 text-sm font-black text-white shadow-lg shadow-teal-500/20 hover:opacity-95 transition-opacity disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Enregistrement en cours…
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Enregistrer mon profil membre
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Colonne Droite : Aperçu en Direct (5 colonnes) */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-8">
            <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0F172A] p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#0d9488]">
                  <Eye className="h-4 w-4" /> Aperçu en direct
                </span>
                <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-[11px] font-bold text-slate-500">
                  Rendu page /teams
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-6">
                Voici comment votre carte officielle apparaîtra instantanément auprès des étudiants et visiteurs :
              </p>

              {/* Live Team Member Card Preview */}
              <div className="flex justify-center p-2">
                <div className="w-full max-w-sm">
                  <TeamMemberCard member={previewMember} index={0} />
                </div>
              </div>
            </div>

            {/* Carte Info KERNEL FORGE */}
            <div className="rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-cyan-950/30 to-blue-950/30 p-6 text-slate-300 text-xs leading-relaxed space-y-3">
              <div className="flex items-center gap-2 text-cyan-300 font-bold">
                <ShieldCheck className="h-4 w-4" />
                Badge Bâtisseur KERNEL FORGE
              </div>
              <p>
                En tant que créateur du projet, vos modifications sont directement synchronisées sur la collection <code className="text-cyan-200">team_members</code> et répercutées sur la page Équipe publique.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSwitchToStandard}
                  className="text-xs font-bold text-cyan-400 hover:text-cyan-300 underline inline-flex items-center gap-1"
                >
                  Revenir à l'interface standard utilisateur →
                </button>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  )
}
