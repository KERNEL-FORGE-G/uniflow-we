import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Plus, Edit, Trash2, X, Loader2, Upload, AlertTriangle, Users } from 'lucide-react'
import { TeamMemberAvatar } from '../../components/team/TeamMemberAvatar'
import {
  APPWRITE_AVATAR_BUCKET_ID,
  appwriteStorage,
  executeTeamRosterAction,
  listTeamMembers,
  uploadAvatarImage,
  validateAvatarFile,
  TEAM_ACCENTS,
  TEAM_NAMES,
  type TeamAccent,
  type TeamMemberDocument,
  type TeamMemberInput,
  type TeamName,
} from '../../lib/appwrite'
import { teamAccentClasses } from '../../utils/teamAccent'

/**
 * Gestion de l'équipe KERNEL FORGE.
 *
 * C'est le **seul** endroit d'où l'équipe se modifie : le mobile et le desktop
 * affichent la page en lecture seule, exactement comme la page publique du web.
 * Toutes les écritures passent par la Function `team-roster`, qui vérifie le
 * rôle ADMIN côté serveur — la collection `team_members` n'accorde aucune
 * écriture, sans quoi n'importe quel compte connecté pourrait effacer la page
 * publique de l'équipe.
 */

type FormState = {
  memberId: string
  slug: string
  name: string
  role: string
  team: TeamName
  subTeam: string
  badge: string
  accent: TeamAccent
  github: string
  email: string
  displayOrder: number
  avatarFileId: string
}

const EMPTY_FORM: FormState = {
  memberId: '',
  slug: '',
  name: '',
  role: '',
  team: 'Frontend',
  subTeam: '',
  badge: '',
  accent: 'blue',
  github: '',
  email: '',
  displayOrder: 0,
  avatarFileId: '',
}

/** Clé stable dérivée du nom, comme le fait la Function côté serveur. */
function slugify(value: string): string {
  return value
    .normalize('NFD')
    // Les diacritiques sont écrits en échappement Unicode : une plage de
    // caractères combinants est invisible dans le code source et se relit mal.
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64)
}

export default function AdminTeamPage() {
  const [members, setMembers] = useState<TeamMemberDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [photo, setPhoto] = useState<File | null>(null)
  const [preview, setPreview] = useState('')
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [pendingDeletion, setPendingDeletion] = useState<TeamMemberDocument | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fileInput = useRef<HTMLInputElement>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setMembers(await listTeamMembers())
      setError(null)
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : "L'équipe n'a pas pu être chargée.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  // L'aperçu local est libéré à la fermeture : sans cela, chaque image choisie
  // garderait son blob en mémoire jusqu'au rechargement de la page.
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview) }, [preview])

  const nextOrder = useMemo(
    () => members.reduce((highest, member) => Math.max(highest, Number(member.displayOrder) || 0), -1) + 1,
    [members],
  )

  function openCreate() {
    setForm({ ...EMPTY_FORM, displayOrder: nextOrder })
    setPhoto(null)
    setPreview('')
    setFormError(null)
    setShowModal(true)
  }

  function openEdit(member: TeamMemberDocument) {
    setForm({
      memberId: member.$id,
      slug: member.slug,
      name: member.name,
      role: member.role,
      team: member.team,
      subTeam: member.subTeam || '',
      badge: member.badge || '',
      accent: member.accent || 'blue',
      github: member.github || '',
      email: member.email || '',
      displayOrder: Number(member.displayOrder) || 0,
      avatarFileId: member.avatarFileId || '',
    })
    setPhoto(null)
    setPreview('')
    setFormError(null)
    setShowModal(true)
  }

  function choosePhoto(file: File | null) {
    setFormError(null)
    if (!file) return
    const invalid = validateAvatarFile(file)
    if (invalid) {
      setFormError(invalid)
      return
    }
    if (preview) URL.revokeObjectURL(preview)
    setPhoto(file)
    setPreview(URL.createObjectURL(file))
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setFormError(null)
    setSaving(true)
    try {
      // La photo est téléversée avant l'appel à la Function, qui n'accepte
      // qu'un identifiant de fichier déjà présent dans le bucket. Si la
      // Function échoue ensuite, le fichier reste orphelin : on tente de le
      // retirer, mais un compte administrateur n'a pas forcément le droit de
      // supprimer dans le bucket — c'est la clé serveur qui l'a.
      let avatarFileId = form.avatarFileId
      let uploadedFileId = ''
      if (photo) {
        uploadedFileId = await uploadAvatarImage(photo)
        avatarFileId = uploadedFileId
      }

      const payload: TeamMemberInput & { action: 'create' | 'update' } = {
        action: form.memberId ? 'update' : 'create',
        memberId: form.memberId || undefined,
        slug: form.slug.trim() || slugify(form.name),
        name: form.name.trim(),
        role: form.role.trim(),
        team: form.team,
        subTeam: form.subTeam.trim(),
        badge: form.badge.trim(),
        accent: form.accent,
        github: form.github.replace(/^@/, '').trim(),
        email: form.email.trim(),
        displayOrder: Number(form.displayOrder) || 0,
        avatarFileId,
      }

      try {
        await executeTeamRosterAction(payload)
      } catch (exception) {
        if (uploadedFileId) {
          await appwriteStorage.deleteFile(APPWRITE_AVATAR_BUCKET_ID, uploadedFileId).catch(() => undefined)
        }
        throw exception
      }

      if (preview) URL.revokeObjectURL(preview)
      setPreview('')
      setPhoto(null)
      setShowModal(false)
      setNotice(form.memberId ? 'Membre mis à jour.' : 'Membre ajouté à l’équipe.')
      await load()
    } catch (exception) {
      setFormError(exception instanceof Error ? exception.message : "L'enregistrement a échoué.")
    } finally {
      setSaving(false)
    }
  }

  async function confirmDeletion() {
    if (!pendingDeletion) return
    setDeleting(true)
    setError(null)
    try {
      await executeTeamRosterAction({ action: 'delete', memberId: pendingDeletion.$id })
      setNotice(`${pendingDeletion.name} a été retiré de l'équipe.`)
      setPendingDeletion(null)
      await load()
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : 'La suppression a échoué.')
      setPendingDeletion(null)
    } finally {
      setDeleting(false)
    }
  }

  const previewSource = preview || ''

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Équipe KERNEL FORGE</h1>
          <p className="text-sm text-[#6b7280] mt-0.5">
            {members.length} membre{members.length > 1 ? 's' : ''} — la page publique /teams et les applications mobile et bureau affichent cette liste
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-xl bg-[#1e3a8a] px-4 py-2 text-xs font-semibold text-white hover:bg-[#2d4fa8] transition-all shadow"
        >
          <Plus className="h-4 w-4" /> Nouveau membre
        </button>
      </div>

      {notice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-medium flex items-start justify-between gap-3">
          <span>{notice}</span>
          <button onClick={() => setNotice(null)} className="text-emerald-700 shrink-0"><X className="h-4 w-4" /></button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
          Erreur : {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-[#1e3a8a]" />
        </div>
      ) : (
        <div className="rounded-xl border border-[#e5e7eb] bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e5e7eb] bg-[#f9fafb]">
                  <th className="py-3.5 px-5 text-center font-bold text-[#111827]">Ordre</th>
                  <th className="py-3.5 px-5 text-left font-bold text-[#111827]">Membre</th>
                  <th className="py-3.5 px-5 text-left font-bold text-[#111827]">Rôle</th>
                  <th className="py-3.5 px-5 text-center font-bold text-[#111827]">Équipe</th>
                  <th className="py-3.5 px-5 text-left font-bold text-[#111827]">GitHub</th>
                  <th className="py-3.5 px-5 text-left font-bold text-[#111827]">Email</th>
                  <th className="py-3.5 px-5 text-center font-bold text-[#111827]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f3f4f6]">
                {members.map(member => {
                  const accent = teamAccentClasses(member.accent)
                  return (
                    <tr key={member.$id} className="hover:bg-[#f9fafb] transition-colors">
                      <td className="py-3.5 px-5 text-center text-xs font-bold text-[#9ca3af]">{member.displayOrder}</td>
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <TeamMemberAvatar
                            avatarFileId={member.avatarFileId}
                            name={member.name}
                            className={`h-10 w-10 rounded-xl border border-[#e5e7eb] ${accent.soft}`}
                            iconClassName="h-5 w-5"
                          />
                          <div>
                            <div className="font-semibold text-[#111827]">{member.name}</div>
                            <div className="text-xs text-[#9ca3af]">{member.subTeam || '—'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 text-[#6b7280]">
                        {member.role}
                        {member.badge && (
                          <span className={`ml-2 inline-block rounded-md border px-2 py-0.5 text-[10px] font-bold ${accent.badge}`}>
                            {member.badge}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        <span className="inline-block rounded-full border border-[#e5e7eb] bg-[#f9fafb] px-3 py-1 text-xs font-bold text-[#374151]">
                          {member.team}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-[#6b7280] select-all">{member.github ? `@${member.github}` : '—'}</td>
                      <td className="py-3.5 px-5 text-[#6b7280] select-all">{member.email || '—'}</td>
                      <td className="py-3.5 px-5">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => openEdit(member)}
                            className="rounded-lg p-2 text-[#1e3a8a] hover:bg-[#eff3ff] transition-colors"
                            title={`Modifier ${member.name}`}
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setPendingDeletion(member)}
                            className="rounded-lg p-2 text-red-600 hover:bg-red-50 transition-colors"
                            title={`Retirer ${member.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {members.length === 0 && (
            <div className="py-12 text-center text-sm text-[#9ca3af]">
              <Users className="mx-auto mb-2 h-8 w-8 text-[#d1d5db]" />
              Aucun membre. Ajoutez le premier avec « Nouveau membre ».
            </div>
          )}
        </div>
      )}

      {/* Formulaire de création / modification */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4 border-b pb-2">
              <h3 className="text-lg font-bold text-[#111827]">
                {form.memberId ? 'Modifier le membre' : 'Ajouter un membre'}
              </h3>
              <button onClick={() => setShowModal(false)} className="rounded-lg p-1 hover:bg-[#f3f4f6] text-[#9ca3af]">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={submit} className="space-y-4">
              {/* Photo */}
              <div className="flex items-center gap-4">
                {previewSource ? (
                  <img src={previewSource} alt="Aperçu" className="h-20 w-20 rounded-2xl object-cover border border-[#e5e7eb]" />
                ) : (
                  <TeamMemberAvatar
                    avatarFileId={form.avatarFileId}
                    name={form.name || 'Nouveau membre'}
                    className="h-20 w-20 rounded-2xl border border-[#e5e7eb] bg-[#f9fafb]"
                  />
                )}
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Photo de profil</label>
                  <input
                    ref={fileInput}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={event => choosePhoto(event.target.files?.[0] ?? null)}
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInput.current?.click()}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#e5e7eb] px-3 py-2 text-xs font-semibold text-[#374151] hover:bg-[#f9fafb]"
                    >
                      <Upload className="h-3.5 w-3.5" /> Choisir une image
                    </button>
                    {(photo || form.avatarFileId) && (
                      <button
                        type="button"
                        onClick={() => {
                          if (preview) URL.revokeObjectURL(preview)
                          setPhoto(null)
                          setPreview('')
                          setForm({ ...form, avatarFileId: '' })
                        }}
                        className="rounded-lg px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                      >
                        Retirer la photo
                      </button>
                    )}
                  </div>
                  <p className="mt-1 text-[11px] text-[#9ca3af]">
                    JPEG, PNG ou WebP, 5 Mo au plus. Sans photo, une silhouette neutre s'affiche — jamais d'initiales.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Nom complet *</label>
                  <input
                    type="text" required value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-lg border border-[#e5e7eb] px-3 py-2.5 text-sm focus:border-[#1e3a8a]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Rôle *</label>
                  <input
                    type="text" required value={form.role}
                    onChange={e => setForm({ ...form, role: e.target.value })}
                    placeholder="Backend Developer"
                    className="w-full rounded-lg border border-[#e5e7eb] px-3 py-2.5 text-sm focus:border-[#1e3a8a]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Équipe *</label>
                  <select
                    value={form.team}
                    onChange={e => setForm({ ...form, team: e.target.value as TeamName })}
                    className="w-full rounded-lg border border-[#e5e7eb] px-3 py-2.5 text-sm focus:border-[#1e3a8a] bg-white"
                  >
                    {TEAM_NAMES.map(name => <option key={name} value={name}>{name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Sous-équipe</label>
                  <input
                    type="text" value={form.subTeam}
                    onChange={e => setForm({ ...form, subTeam: e.target.value })}
                    placeholder="Backend APIs & BD"
                    className="w-full rounded-lg border border-[#e5e7eb] px-3 py-2.5 text-sm focus:border-[#1e3a8a]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Pastille</label>
                  <input
                    type="text" value={form.badge}
                    onChange={e => setForm({ ...form, badge: e.target.value })}
                    placeholder="Backend & DB"
                    className="w-full rounded-lg border border-[#e5e7eb] px-3 py-2.5 text-sm focus:border-[#1e3a8a]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Pseudo GitHub</label>
                  <input
                    type="text" value={form.github}
                    onChange={e => setForm({ ...form, github: e.target.value })}
                    placeholder="sans le @"
                    className="w-full rounded-lg border border-[#e5e7eb] px-3 py-2.5 text-sm focus:border-[#1e3a8a]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Email</label>
                  <input
                    type="email" value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full rounded-lg border border-[#e5e7eb] px-3 py-2.5 text-sm focus:border-[#1e3a8a]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Clé (slug)</label>
                  <input
                    type="text" value={form.slug}
                    onChange={e => setForm({ ...form, slug: e.target.value })}
                    placeholder={form.name ? slugify(form.name) : 'derivee-du-nom'}
                    className="w-full rounded-lg border border-[#e5e7eb] px-3 py-2.5 text-sm focus:border-[#1e3a8a]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Ordre d'affichage</label>
                  <input
                    type="number" value={form.displayOrder}
                    onChange={e => setForm({ ...form, displayOrder: Number(e.target.value) })}
                    className="w-full rounded-lg border border-[#e5e7eb] px-3 py-2.5 text-sm focus:border-[#1e3a8a]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Couleur</label>
                  <div className="flex flex-wrap gap-2">
                    {TEAM_ACCENTS.map(accent => {
                      const classes = teamAccentClasses(accent)
                      return (
                        <button
                          key={accent}
                          type="button"
                          onClick={() => setForm({ ...form, accent })}
                          title={accent}
                          className={`h-9 rounded-lg border px-3 text-[11px] font-bold transition-all ${classes.badge} ${
                            form.accent === accent ? 'ring-2 ring-offset-1 ring-slate-400' : 'opacity-70 hover:opacity-100'
                          }`}
                        >
                          {accent}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-medium">
                  {formError}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button" onClick={() => setShowModal(false)}
                  className="rounded-xl border border-[#e5e7eb] px-4 py-2 text-xs font-semibold text-[#6b7280] hover:bg-[#f9fafb]"
                >
                  Annuler
                </button>
                <button
                  type="submit" disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#1e3a8a] px-4 py-2 text-xs font-semibold text-white hover:bg-[#2d4fa8] disabled:opacity-60"
                >
                  {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {form.memberId ? 'Enregistrer' : 'Ajouter le membre'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation de suppression */}
      {pendingDeletion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-red-50 p-2 text-red-600"><AlertTriangle className="h-5 w-5" /></div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-[#111827]">Retirer {pendingDeletion.name} ?</h3>
                <p className="mt-1 text-xs text-[#6b7280] leading-relaxed">
                  Le membre disparaîtra de la page publique <strong>/teams</strong>, ainsi que des applications mobile et
                  bureau, et sa photo sera supprimée du stockage. Cette action est immédiate.
                </p>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setPendingDeletion(null)}
                className="rounded-xl border border-[#e5e7eb] px-4 py-2 text-xs font-semibold text-[#6b7280] hover:bg-[#f9fafb]"
              >
                Annuler
              </button>
              <button
                onClick={confirmDeletion} disabled={deleting}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60"
              >
                {deleting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Retirer de l'équipe
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
