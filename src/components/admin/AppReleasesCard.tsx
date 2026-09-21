import { useEffect, useState, type FormEvent } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { UniIcon, type UniIconName } from '../ui/UniIcon'
import { ToastContainer } from '../ui/Toast'
import { useToast } from '../../utils/useToast'
import {
  APP_RELEASES_QUERY_KEY,
  RELEASE_PLATFORMS,
  RELEASE_PLATFORM_LABELS,
  formatSize,
  isValidReleaseUrl,
  parseSizeInput,
  releaseFallbackUrl,
  releaseFormFrom,
  releaseFormProblem,
  upsertAppRelease,
  useAdminAppReleases,
  type AppRelease,
  type ReleaseFormState,
  type ReleasePlatform,
} from '../../lib/appReleases'

/**
 * Carte « Applications à télécharger » de Paramètres (administration).
 *
 * Le lien de l'APK Android change à chaque version publiée dans les releases
 * GitHub de `KERNEL-FORGE-G/uniflow-apps` : plutôt qu'un redéploiement du
 * site, l'admin de la plateforme le saisit ici (action `upsert` du service
 * `/app-releases`). Seul le label `superadmin` y a droit — la Function le
 * vérifie côté serveur ; le web ne fait que masquer le formulaire aux autres
 * administrations, avec une note explicative.
 */

const PLATFORM_ICON: Record<ReleasePlatform, UniIconName> = {
  android: 'android',
  windows: 'windows',
  linux: 'linux',
  macos: 'apple',
}

function formatDate(iso: string | null) {
  if (!iso) return ''
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })
}

const inputClass = 'w-full rounded-xl border border-[#e5e7eb] bg-white px-3.5 py-2.5 text-sm text-[#111827] placeholder:text-[#9ca3af] focus:border-[#1e3a8a] focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20'
const labelClass = 'block text-[11px] font-bold uppercase tracking-wider text-[#6b7280] mb-1.5'

function ReleaseForm({ platform, release, open, notify }: {
  platform: ReleasePlatform
  release: AppRelease | null
  open: boolean
  notify: { success: (title: string, message?: string) => void; error: (title: string, message?: string) => void; warning: (title: string, message?: string) => void }
}) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState<ReleaseFormState>(() => releaseFormFrom(release))
  const [saving, setSaving] = useState(false)
  // Le document arrive après le premier rendu, ou change après un `upsert` :
  // le formulaire se recale alors sur la version serveur. Le partage structurel
  // de react-query conserve la même référence tant que le contenu est identique,
  // donc un simple rafraîchissement n'écrase pas une saisie en cours.
  useEffect(() => { setForm(releaseFormFrom(release)) }, [release])

  const set = (field: keyof ReleaseFormState) => (event: { target: { value: string } }) => setForm((current) => ({ ...current, [field]: event.target.value }))
  const sizeBytes = parseSizeInput(form.size)
  const sizePreview = sizeBytes && sizeBytes > 0 ? formatSize(sizeBytes) : ''
  const problem = releaseFormProblem(form)
  const label = RELEASE_PLATFORM_LABELS[platform]

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (problem) { notify.warning('Formulaire incomplet', problem); return }
    setSaving(true)
    try {
      const saved = await upsertAppRelease({
        platform,
        version: form.version.trim(),
        url: form.url.trim(),
        fileName: form.fileName.trim(),
        sizeBytes: sizeBytes ?? 0,
        sha256: form.sha256.trim().toLowerCase(),
        notes: form.notes.trim(),
        enabled: form.enabled,
        // Une nouvelle version est datée de maintenant ; une simple retouche garde la date.
        publishedAt: release && release.version === form.version.trim() ? release.publishedAt : null,
      })
      await queryClient.invalidateQueries({ queryKey: APP_RELEASES_QUERY_KEY })
      notify.success(
        `${label} : lien enregistré`,
        saved.enabled ? `Version ${saved.version} publiée sur le site${saved.sizeBytes ? ` (${formatSize(saved.sizeBytes)})` : ''}.` : `Version ${saved.version} enregistrée mais non publiée.`,
      )
    } catch (error) {
      notify.error(`${label} : enregistrement refusé`, error instanceof Error ? error.message : 'La Function n’a pas répondu.')
    } finally {
      setSaving(false)
    }
  }

  const testLink = () => {
    if (!isValidReleaseUrl(form.url)) { notify.warning('Lien invalide', 'Saisissez d’abord une URL complète en https://.'); return }
    window.open(form.url.trim(), '_blank', 'noopener,noreferrer')
  }

  const status = release
    ? `${release.enabled ? 'Publié' : 'Non publié'} · v${release.version}${release.sizeBytes ? ` · ${formatSize(release.sizeBytes)}` : ''}${release.updatedAt ? ` · mis à jour le ${formatDate(release.updatedAt)}` : ''}`
    : 'Aucune version publiée'

  return (
    <details open={open} className="group rounded-2xl border border-[#e5e7eb] bg-white shadow-sm open:shadow-md" data-testid={`release-form-${platform}`}>
      <summary className="flex cursor-pointer list-none items-center gap-3 px-5 py-4 [&::-webkit-details-marker]:hidden">
        <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${release?.enabled ? 'bg-[#eff3ff] text-[#1e3a8a]' : 'bg-[#f3f4f6] text-[#6b7280]'}`}>
          <UniIcon name={PLATFORM_ICON[platform]} weight="fill" size={18} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-bold text-[#111827]">{label}{platform === 'android' ? ' (APK)' : ''}</span>
          <span className={`block truncate text-xs ${release?.enabled ? 'text-[#0d9488] font-semibold' : 'text-[#6b7280]'}`}>{status}</span>
        </span>
        <UniIcon name="chevronDown" weight="bold" size={16} className="text-[#9ca3af] transition-transform group-open:rotate-180" />
      </summary>

      <form onSubmit={(event) => void submit(event)} className="space-y-4 border-t border-[#f3f4f6] px-5 py-5">
        <div>
          <label htmlFor={`${platform}-url`} className={labelClass}>URL de téléchargement</label>
          <input id={`${platform}-url`} className={inputClass} type="url" inputMode="url" placeholder="https://github.com/KERNEL-FORGE-G/uniflow-apps/releases/download/v1.0.0/uniflow-1.0.0.apk" value={form.url} onChange={set('url')} required />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor={`${platform}-version`} className={labelClass}>Version</label>
            <input id={`${platform}-version`} className={inputClass} placeholder="1.0.0" maxLength={32} value={form.version} onChange={set('version')} required />
          </div>
          <div>
            <label htmlFor={`${platform}-file`} className={labelClass}>Nom de fichier</label>
            <input id={`${platform}-file`} className={inputClass} placeholder="uniflow-1.0.0-arm64-v8a.apk" maxLength={255} value={form.fileName} onChange={set('fileName')} />
          </div>
          <div>
            <label htmlFor={`${platform}-size`} className={labelClass}>Taille</label>
            <input id={`${platform}-size`} className={inputClass} placeholder="44355174 ou 42,3 Mo" value={form.size} onChange={set('size')} aria-describedby={`${platform}-size-help`} />
            <p id={`${platform}-size-help`} className={`mt-1 text-[11px] ${sizeBytes === null ? 'text-red-600' : 'text-[#9ca3af]'}`}>
              {sizeBytes === null ? 'Illisible' : sizePreview ? `= ${sizePreview} (${sizeBytes.toLocaleString('fr-FR')} octets)` : 'Octets, ou valeur avec unité (Ko, Mo, Go).'}
            </p>
          </div>
        </div>
        <div>
          <label htmlFor={`${platform}-sha`} className={labelClass}>Empreinte SHA-256 <span className="font-normal normal-case">(facultative)</span></label>
          <input id={`${platform}-sha`} className={`${inputClass} font-mono text-xs`} placeholder="64 caractères hexadécimaux — sha256sum fichier.apk" maxLength={64} value={form.sha256} onChange={set('sha256')} spellCheck={false} />
        </div>
        <div>
          <label htmlFor={`${platform}-notes`} className={labelClass}>Notes de version <span className="font-normal normal-case">(facultatives)</span></label>
          <textarea id={`${platform}-notes`} className={`${inputClass} min-h-[72px]`} maxLength={2000} placeholder="Nouveautés, ABI concernée, prérequis Android…" value={form.notes} onChange={set('notes')} />
        </div>

        <label className="flex items-center gap-3 text-sm font-semibold text-[#374151]">
          <button
            type="button"
            role="switch"
            aria-checked={form.enabled}
            onClick={() => setForm((current) => ({ ...current, enabled: !current.enabled }))}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${form.enabled ? 'bg-[#0d9488]' : 'bg-[#d1d5db]'}`}
          >
            <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${form.enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
          Publié
          <span className="text-xs font-normal text-[#6b7280]">{form.enabled ? 'Le bouton de téléchargement est visible sur le site.' : 'Le site affiche « bientôt disponible ».'}</span>
        </label>

        {problem && (form.url || form.version) ? <p className="text-xs text-amber-700">{problem}</p> : null}

        <div className="flex flex-wrap gap-2 pt-1">
          <button type="submit" disabled={saving || Boolean(problem)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1e3a8a] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#2d4fa8] disabled:cursor-not-allowed disabled:opacity-50">
            {saving ? <UniIcon name="spinner" weight="bold" size={16} className="animate-spin" /> : <UniIcon name="save" size={16} />} Enregistrer
          </button>
          <button type="button" onClick={testLink} disabled={!isValidReleaseUrl(form.url)}
            className="inline-flex items-center gap-2 rounded-xl border border-[#e5e7eb] px-4 py-2.5 text-sm font-bold text-[#374151] transition-colors hover:bg-[#f9fafb] disabled:cursor-not-allowed disabled:opacity-50">
            <UniIcon name="externalLink" weight="bold" size={16} /> Tester le lien
          </button>
        </div>
      </form>
    </details>
  )
}

export function AppReleasesCard({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  const { toasts, success, error, warning, removeToast } = useToast()
  const { data: releases, isPending, isError, error: loadError, refetch } = useAdminAppReleases(isSuperAdmin)

  if (!isSuperAdmin) {
    return (
      <div className="rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-sm space-y-3">
        <h2 className="flex items-center gap-2 text-base font-bold text-[#111827]"><UniIcon name="download" size={16} className="text-[#1e3a8a]" /> Applications à télécharger</h2>
        <p className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <UniIcon name="lock" weight="fill" size={16} className="mt-0.5 shrink-0" />
          Réglage de la plateforme, réservé à KERNEL FORGE.
        </p>
        <p className="text-sm text-[#6b7280]">
          Les liens de téléchargement (APK Android, applications de bureau) sont communs à toutes les universités et publiés dans les releases GitHub de KERNEL FORGE ; seul l’administrateur de la plateforme les modifie.
        </p>
        <a href={releaseFallbackUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-[#e5e7eb] px-3.5 py-2 text-xs font-bold text-[#1e3a8a] hover:bg-[#eff3ff]">
          <UniIcon name="externalLink" weight="bold" size={14} /> Voir les releases GitHub
        </a>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <ToastContainer toasts={toasts} onClose={removeToast} />
      <div className="rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-sm space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-base font-bold text-[#111827]"><UniIcon name="download" size={16} className="text-[#1e3a8a]" /> Applications à télécharger</h2>
            <p className="mt-1 text-sm text-[#6b7280]">
              Lien proposé sur la page d’accueil et dans le pied de page. Collez l’URL directe du fichier depuis les{' '}
              <a href={releaseFallbackUrl} target="_blank" rel="noreferrer" className="font-semibold text-[#1e3a8a] hover:underline">releases GitHub</a>
              {' '}; la version et la taille s’affichent sur le bouton. Sans lien publié, le site indique « bientôt disponible ».
            </p>
          </div>
          <button type="button" onClick={() => void refetch()} className="inline-flex items-center gap-2 rounded-xl border border-[#e5e7eb] px-3.5 py-2 text-xs font-bold text-[#374151] hover:bg-[#f9fafb]">
            <UniIcon name="refresh" weight="bold" size={14} className={isPending ? 'animate-spin' : ''} /> Recharger
          </button>
        </div>
        {isError ? (
          <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Liste indisponible : {loadError instanceof Error ? loadError.message : 'la Function n’a pas répondu.'} Le formulaire reste utilisable.
          </p>
        ) : null}
        <p className="text-xs text-[#9ca3af]">
          Ligne de commande équivalente : <code className="rounded bg-[#f3f4f6] px-1.5 py-0.5 font-mono text-[11px] text-[#374151]">node scripts/set-app-release.mjs android --url … --version … --file … --size … --sha256 …</code>
        </p>
      </div>

      {RELEASE_PLATFORMS.map((platform) => (
        <ReleaseForm
          key={platform}
          platform={platform}
          release={releases?.find((release) => release.platform === platform) ?? null}
          open={platform === 'android'}
          notify={{ success, error, warning }}
        />
      ))}
    </div>
  )
}
