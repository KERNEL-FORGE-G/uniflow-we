import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Building2, Edit, Loader2, Plus, RefreshCw, Search, ShieldCheck, Trash2, UserPlus, Users } from 'lucide-react'
import { executeAdminDirectoryAction, type AdminDirectoryEntry } from '@/lib/appwrite'
import { assignableRoles, canAssignRole, ROLE_LABELS_FR, type RoleCaller, type UniFlowRole } from '@/lib/roles'
import { useUniversities } from '@/lib/referenceData'
import { useUserRole } from '@/utils/userRole'
import { AcademicScopeSelect } from '@/components/academic/AcademicScopeSelect'
import { ActionResultSlot, type ActionResultProps } from '@/components/feedback/ActionResult'
import { StaggerItem, StaggerList } from '@/components/motion/PageTransition'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { Modal } from '@/components/ui/Modal'
import { cn } from '@/utils/cn'

const ROLE_STYLES: Record<UniFlowRole, string> = {
  STUDENT: 'bg-[#eff3ff] text-[#1e3a8a] border-[#1e3a8a]/20',
  DELEGATE: 'bg-purple-50 text-purple-700 border-purple-200',
  TEACHER: 'bg-[#f0fdfa] text-[#0d9488] border-[#0d9488]/20',
  ADMIN: 'bg-amber-50 text-amber-700 border-amber-200',
}

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Actif' },
  { value: 'SUSPENDED', label: 'Suspendu' },
]

interface AccountForm {
  userId?: string
  name: string
  email: string
  password: string
  role: UniFlowRole
  university: string
  program: string
  level: string
  matricule: string
  status: string
}

const EMPTY_FORM: AccountForm = { name: '', email: '', password: '', role: 'STUDENT', university: '', program: '', level: '', matricule: '', status: 'ACTIVE' }

/**
 * Gestion des comptes universitaires. La matrice de droits est appliquée par
 * la Function `/admin-directory` ; l'écran ne propose que ce qui aboutira :
 * un ADMIN crée/modifie enseignants, délégués et étudiants de son université,
 * seul le `superadmin` crée des comptes administration.
 */
export default function AdminUsersPage() {
  const { currentUser } = useUserRole()
  const universities = useUniversities()
  const [entries, setEntries] = useState<AdminDirectoryEntry[]>([])
  const [caller, setCaller] = useState<RoleCaller | null>(null)
  const [loading, setLoading] = useState(true)
  const [result, setResult] = useState<ActionResultProps | null>(null)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<'ALL' | UniFlowRole>('ALL')
  const [scope, setScope] = useState({ program: '', level: '' })
  const [form, setForm] = useState<AccountForm | null>(null)
  const [saving, setSaving] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<AdminDirectoryEntry | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const response = await executeAdminDirectoryAction({ action: 'list' })
      setEntries(response.entries ?? [])
      setCaller(response.caller ? { role: response.caller.role, isSuperAdmin: response.caller.isSuperAdmin, university: response.caller.university } : null)
    } catch (error) {
      setResult({ status: 'error', title: 'Annuaire indisponible', description: 'La liste des comptes n’a pas pu être lue.', detail: error instanceof Error ? error.message : undefined, actions: [{ label: 'Réessayer', onClick: () => void load() }] })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const effectiveCaller: RoleCaller | null = caller ?? (currentUser.uniflowRole ? { role: currentUser.uniflowRole, isSuperAdmin: Boolean(currentUser.isSuperAdmin), university: currentUser.university } : null)
  const roles = assignableRoles(effectiveCaller)
  const canCreate = roles.length > 0

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase()
    return entries.filter((entry) => {
      if (roleFilter !== 'ALL' && entry.role !== roleFilter) return false
      if (scope.program && entry.program !== scope.program) return false
      if (scope.level && entry.level !== scope.level) return false
      if (!needle) return true
      return [entry.name, entry.email, entry.matricule, entry.program].some((value) => value?.toLowerCase().includes(needle))
    })
  }, [entries, roleFilter, scope, search])

  const counts = useMemo(() => entries.reduce<Record<string, number>>((acc, entry) => ({ ...acc, [entry.role]: (acc[entry.role] ?? 0) + 1 }), {}), [entries])

  const openCreate = () => setForm({ ...EMPTY_FORM, role: roles.includes('STUDENT') ? 'STUDENT' : roles[0], university: effectiveCaller?.university ?? '', program: scope.program, level: scope.level })
  const openEdit = (entry: AdminDirectoryEntry) => setForm({ userId: entry.userId, name: entry.name, email: entry.email, password: '', role: entry.role, university: entry.university ?? effectiveCaller?.university ?? '', program: entry.program ?? '', level: entry.level ?? '', matricule: entry.matricule, status: entry.status })

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!form) return
    const learner = form.role === 'STUDENT' || form.role === 'DELEGATE'
    if (!form.name.trim() || !form.email.trim()) return setResult({ status: 'warning', title: 'Champs manquants', description: 'Le nom et l’email sont obligatoires.' })
    if (!form.userId && form.password.length < 8) return setResult({ status: 'warning', title: 'Mot de passe trop court', description: 'Appwrite exige au moins 8 caractères.' })
    if (learner && (!form.program || !form.level)) return setResult({ status: 'warning', title: 'Filière et niveau requis', description: 'Un étudiant ou un délégué doit être rattaché à une filière et un niveau.' })
    setSaving(true)
    setResult(null)
    try {
      const payload = { name: form.name.trim(), email: form.email.trim(), role: form.role, matricule: form.matricule.trim(), status: form.status, university: form.university || undefined, program: form.program || undefined, level: form.level || undefined }
      if (form.userId) {
        await executeAdminDirectoryAction({ action: 'update', userId: form.userId, ...payload })
        setResult({ status: 'success', title: 'Compte mis à jour', description: `${payload.name} est désormais ${ROLE_LABELS_FR[form.role].toLowerCase()}.` })
      } else {
        await executeAdminDirectoryAction({ action: 'create', password: form.password, ...payload })
        setResult({ status: 'success', title: 'Compte créé', description: `${payload.name} (${payload.email}) peut se connecter avec le mot de passe transmis.` })
      }
      setForm(null)
      await load()
    } catch (error) {
      setResult({ status: 'error', title: form.userId ? 'Modification refusée' : 'Création refusée', description: 'Le serveur a refusé l’opération.', detail: error instanceof Error ? error.message : undefined })
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    if (!pendingDelete) return
    setSaving(true)
    try {
      await executeAdminDirectoryAction({ action: 'delete', userId: pendingDelete.userId })
      setResult({ status: 'success', title: 'Compte supprimé', description: `${pendingDelete.name} a été retiré de l’annuaire.` })
      setPendingDelete(null)
      await load()
    } catch (error) {
      setResult({ status: 'error', title: 'Suppression refusée', description: 'Le compte a été conservé.', detail: error instanceof Error ? error.message : undefined })
      setPendingDelete(null)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#0d9488]">Administration</p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-[#111827]">Comptes et rôles</h1>
          <p className="mt-1 text-sm text-[#6b7280]">
            {effectiveCaller?.isSuperAdmin ? 'Administrateur de la plateforme : toutes les universités, tous les rôles.' : effectiveCaller?.university ? `Université : ${effectiveCaller.university}` : 'Comptes de votre université'}
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => void load()} className="inline-flex items-center gap-2 rounded-xl border border-[#e5e7eb] bg-white px-3 py-2 text-xs font-bold text-[#374151] transition hover:bg-[#f9fafb]">
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} /> Actualiser
          </button>
          {canCreate && (
            <motion.button type="button" whileTap={{ scale: 0.97 }} onClick={openCreate} className="inline-flex items-center gap-2 rounded-xl bg-[#1e3a8a] px-4 py-2 text-xs font-bold text-white shadow transition hover:bg-[#2d4fa8]">
              <UserPlus className="h-4 w-4" /> Nouveau compte
            </motion.button>
          )}
        </div>
      </header>

      <ActionResultSlot result={result} />

      <StaggerList className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {(['STUDENT', 'DELEGATE', 'TEACHER', 'ADMIN'] as UniFlowRole[]).map((role) => (
          <StaggerItem key={role}>
            <button type="button" onClick={() => setRoleFilter(roleFilter === role ? 'ALL' : role)} className={cn('flex w-full items-center justify-between rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md', roleFilter === role ? 'border-[#1e3a8a] ring-2 ring-[#1e3a8a]/10' : 'border-[#e5e7eb]')}>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#6b7280]">{ROLE_LABELS_FR[role]}s</p>
                <p className="mt-1 text-2xl font-black text-[#111827]">{loading ? '…' : counts[role] ?? 0}</p>
              </div>
              <span className={cn('rounded-full border px-2.5 py-1 text-[10px] font-black', ROLE_STYLES[role])}>{role}</span>
            </button>
          </StaggerItem>
        ))}
      </StaggerList>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <label className="relative block">
          <span className="sr-only">Rechercher</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nom, email, matricule…" className="w-full rounded-xl border border-[#e5e7eb] bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/10" />
        </label>
        <AcademicScopeSelect universityName={effectiveCaller?.university} value={scope} onChange={setScope} />
      </div>

      <section className="overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white shadow-sm">
        {loading ? (
          <div className="space-y-3 p-5">{Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-12" />)}</div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={Users} title="Aucun compte ne correspond" description={entries.length === 0 ? 'L’annuaire de votre université est vide : créez le premier compte.' : 'Modifiez la recherche ou les filtres.'} action={canCreate && entries.length === 0 ? { label: 'Créer un compte', onClick: openCreate } : undefined} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e5e7eb] bg-[#f9fafb] text-left text-xs font-bold uppercase tracking-wider text-[#6b7280]">
                  <th className="px-5 py-3">Compte</th>
                  <th className="px-5 py-3">Rôle</th>
                  <th className="px-5 py-3">Filière · niveau</th>
                  <th className="px-5 py-3">Statut</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <motion.tbody initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.03 } } }} className="divide-y divide-[#f3f4f6]">
                {filtered.map((entry) => {
                  const editable = canAssignRole(effectiveCaller, entry.role, entry.university, entry.role) && !entry.isSuperAdmin
                  return (
                    <motion.tr key={entry.userId} variants={{ hidden: { opacity: 0, y: 6 }, show: { opacity: 1, y: 0 } }} className="transition-colors hover:bg-[#f9fafb]">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#eff3ff] text-xs font-black text-[#1e3a8a]">{initials(entry.name)}</div>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-[#111827]">{entry.name}{entry.isSuperAdmin && <ShieldCheck className="ml-1.5 inline h-4 w-4 text-amber-500" aria-label="Administrateur de la plateforme" />}</p>
                            <p className="truncate text-xs text-[#6b7280]">{entry.email || '—'}{entry.matricule ? ` · ${entry.matricule}` : ''}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3"><span className={cn('inline-block rounded-full border px-3 py-1 text-xs font-bold', ROLE_STYLES[entry.role])}>{ROLE_LABELS_FR[entry.role]}</span></td>
                      <td className="px-5 py-3 text-[#374151]">
                        {entry.program || entry.level ? <span>{entry.program}{entry.level ? ` · ${entry.level}` : ''}</span> : <span className="text-[#9ca3af]">—</span>}
                        {effectiveCaller?.isSuperAdmin && entry.university && <p className="text-xs text-[#9ca3af]">{entry.university}</p>}
                      </td>
                      <td className="px-5 py-3"><span className={cn('rounded-full px-3 py-1 text-xs font-semibold', entry.status === 'SUSPENDED' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700')}>{entry.status === 'SUSPENDED' ? 'Suspendu' : 'Actif'}</span></td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-1">
                          <button type="button" disabled={!editable} onClick={() => openEdit(entry)} title={editable ? 'Modifier le compte et son rôle' : 'Hors de votre périmètre'} className="rounded-lg p-2 text-[#1e3a8a] transition hover:bg-[#eff3ff] disabled:cursor-not-allowed disabled:opacity-30"><Edit className="h-4 w-4" /></button>
                          <button type="button" disabled={!editable} onClick={() => setPendingDelete(entry)} title={editable ? 'Supprimer' : 'Hors de votre périmètre'} className="rounded-lg p-2 text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-30"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </motion.tr>
                  )
                })}
              </motion.tbody>
            </table>
          </div>
        )}
      </section>

      <AnimatePresence>
        {form && (
          <Modal onClose={() => !saving && setForm(null)} title={form.userId ? 'Modifier le compte' : 'Nouveau compte universitaire'} icon={form.userId ? Edit : Plus}>
            <form onSubmit={submit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Nom complet" required><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} autoFocus /></Field>
                <Field label="Email" required><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} /></Field>
              </div>
              {!form.userId && <Field label="Mot de passe initial" required hint="Au moins 8 caractères ; à transmettre à la personne, qui pourra le changer."><input type="text" autoComplete="off" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={inputClass} /></Field>}
              <Field label="Rôle" required>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="radiogroup">
                  {roles.map((role) => (
                    <button key={role} type="button" role="radio" aria-checked={form.role === role} onClick={() => setForm({ ...form, role })} className={cn('rounded-xl border-2 px-3 py-2 text-xs font-bold transition', form.role === role ? 'border-[#1e3a8a] bg-[#eff3ff] text-[#1e3a8a]' : 'border-[#e5e7eb] text-[#6b7280] hover:border-slate-300')}>{ROLE_LABELS_FR[role]}</button>
                  ))}
                </div>
                {!roles.includes('ADMIN') && <p className="mt-1.5 text-xs text-[#9ca3af]">Les comptes administration sont créés par l’administrateur de la plateforme.</p>}
              </Field>
              {effectiveCaller?.isSuperAdmin ? (
                <Field label="Université" required>
                  <div className="relative">
                    <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]" />
                    <select value={form.university} onChange={(e) => setForm({ ...form, university: e.target.value, program: '', level: '' })} className={cn(inputClass, 'appearance-none pl-9')}>
                      <option value="">Choisir une université</option>
                      {(universities.data ?? []).map((university) => <option key={university.code} value={university.name}>{university.name}</option>)}
                    </select>
                  </div>
                </Field>
              ) : (
                <p className="rounded-xl bg-[#f9fafb] px-3 py-2 text-xs text-[#6b7280]">Université : <strong className="text-[#374151]">{form.university || effectiveCaller?.university || 'non renseignée'}</strong></p>
              )}
              {(form.role === 'STUDENT' || form.role === 'DELEGATE') && (
                <Field label="Filière et niveau" required>
                  <AcademicScopeSelect universityName={form.university || effectiveCaller?.university} value={{ program: form.program, level: form.level }} onChange={(next) => setForm({ ...form, ...next })} allowAll={false} compact />
                </Field>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Matricule" hint="Facultatif"><input value={form.matricule} onChange={(e) => setForm({ ...form, matricule: e.target.value })} className={inputClass} /></Field>
                <Field label="Statut"><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={cn(inputClass, 'appearance-none')}>{STATUS_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></Field>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setForm(null)} disabled={saving} className="rounded-xl border border-[#e5e7eb] px-4 py-2.5 text-xs font-bold text-[#374151] hover:bg-[#f9fafb]">Annuler</button>
                <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-[#1e3a8a] px-5 py-2.5 text-xs font-bold text-white shadow transition hover:bg-[#2d4fa8] disabled:opacity-60">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}{form.userId ? 'Enregistrer' : 'Créer le compte'}
                </button>
              </div>
            </form>
          </Modal>
        )}
        {pendingDelete && (
          <Modal onClose={() => !saving && setPendingDelete(null)} title="Supprimer ce compte ?" icon={Trash2} tone="danger">
            <p className="text-sm leading-6 text-[#374151]">
              <strong>{pendingDelete.name}</strong> ({pendingDelete.email}) sera retiré d’Appwrite et de l’annuaire. Si le compte porte des notes ou des présences, le serveur refusera : suspendez-le plutôt.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setPendingDelete(null)} disabled={saving} className="rounded-xl border border-[#e5e7eb] px-4 py-2.5 text-xs font-bold text-[#374151] hover:bg-[#f9fafb]">Annuler</button>
              <button type="button" onClick={() => void confirmDelete()} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-bold text-white shadow transition hover:bg-rose-700 disabled:opacity-60">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />} Supprimer</button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  )
}

const inputClass = 'w-full rounded-xl border border-[#e5e7eb] bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/10'

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || '?'
}

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold text-[#374151]">{label}{required && <span className="text-rose-500"> *</span>}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-[#9ca3af]">{hint}</span>}
    </label>
  )
}
