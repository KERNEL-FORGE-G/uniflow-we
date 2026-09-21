import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { IconTile, UniIcon, type UniIconName } from '../../components/ui/UniIcon'
import { APPWRITE_BUCKET_ID, APPWRITE_DATABASE_ID, APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, appwriteClient } from '../../lib/appwrite'
import { usePublicStats } from '../../lib/publicStats'
import { clearPersistedQueries } from '../../lib/offline/queryPersistence'
import { CONTACT_EMAIL_SECONDARY, CONTACT_PHONE_DISPLAY, CONTACT_WHATSAPP_URL, COVERAGE_LABEL } from '../../lib/contactInfo'
import { useUserRole } from '../../utils/userRole'

/**
 * Paramètres de la plateforme, côté administration.
 *
 * L'ancienne page était une maquette : « Uptime 99,9 % », « 2 847 utilisateurs »,
 * configuration SMTP, sauvegardes, cache Redis, « redémarrer les services »…
 * rien de tout cela n'existe — le backend est Appwrite Cloud, sans serveur à
 * nous. La page ne montre plus que ce qui est vrai : les compteurs réels
 * (Function `/public-stats`), l'infrastructure Appwrite et son temps de
 * réponse mesuré, les règles de la plateforme telles qu'elles sont codées, et
 * les seules actions qui ont un effet (vider le cache local, recharger).
 */

type Section = 'overview' | 'infra' | 'rules' | 'maintenance'

const sections: Array<{ id: Section; label: string; icon: UniIconName }> = [
  { id: 'overview', label: 'Vue d’ensemble', icon: 'activity' },
  { id: 'infra', label: 'Infrastructure', icon: 'server' },
  { id: 'rules', label: 'Règles de la plateforme', icon: 'security' },
  { id: 'maintenance', label: 'Maintenance locale', icon: 'database' },
]

const APP_VERSION = String(import.meta.env.VITE_APP_VERSION || '1.0.0')

function formatNumber(value: number | undefined) {
  return value == null ? '…' : value.toLocaleString('fr-FR')
}

export default function AdminSettingsPage() {
  const { currentUser } = useUserRole()
  const queryClient = useQueryClient()
  const [section, setSection] = useState<Section>('overview')
  const { data: stats, isLoading: statsLoading, isError: statsError, refetch, dataUpdatedAt } = usePublicStats()

  const [ping, setPing] = useState<{ state: 'idle' | 'checking' | 'ok' | 'error'; ms?: number; message?: string }>({ state: 'idle' })
  const measurePing = useCallback(async () => {
    setPing({ state: 'checking' })
    const started = performance.now()
    try {
      await appwriteClient.ping()
      setPing({ state: 'ok', ms: Math.round(performance.now() - started) })
    } catch (error) {
      setPing({ state: 'error', message: error instanceof Error ? error.message : 'Appwrite ne répond pas.' })
    }
  }, [])
  useEffect(() => { void measurePing() }, [measurePing])

  const [cacheInfo, setCacheInfo] = useState<{ caches: number; swActive: boolean } | null>(null)
  const inspectCaches = useCallback(async () => {
    try {
      const names = typeof caches === 'undefined' ? [] : await caches.keys()
      const registrations = 'serviceWorker' in navigator ? await navigator.serviceWorker.getRegistrations() : []
      setCacheInfo({ caches: names.filter((name) => name.startsWith('uniflow-')).length, swActive: registrations.some((registration) => Boolean(registration.active)) })
    } catch {
      setCacheInfo({ caches: 0, swActive: false })
    }
  }, [])
  useEffect(() => { void inspectCaches() }, [inspectCaches])

  const [maintenance, setMaintenance] = useState<{ busy: boolean; message?: string }>({ busy: false })
  const clearLocalCaches = async () => {
    if (!window.confirm('Vider le cache local de cette machine ? Les écritures en attente de synchronisation sont conservées ; les données seront rechargées depuis Appwrite.')) return
    setMaintenance({ busy: true })
    try {
      await clearPersistedQueries(queryClient)
      if (typeof caches !== 'undefined') {
        const names = await caches.keys()
        await Promise.all(names.filter((name) => name.startsWith('uniflow-')).map((name) => caches.delete(name)))
      }
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations()
        await Promise.all(registrations.map((registration) => registration.update()))
      }
      await inspectCaches()
      setMaintenance({ busy: false, message: 'Cache local vidé. Les prochaines pages se rechargent depuis Appwrite Cloud.' })
    } catch (error) {
      setMaintenance({ busy: false, message: error instanceof Error ? error.message : 'Le nettoyage a échoué.' })
    }
  }

  const overviewCards: Array<{ label: string; value: string; icon: UniIconName; color: string; to?: string }> = [
    { label: 'Comptes utilisateurs', value: formatNumber(stats?.users), icon: 'accounts', color: '#1E3A8A', to: '/admin/utilisateurs' },
    { label: 'Étudiants · enseignants', value: stats ? `${formatNumber(stats.students)} · ${formatNumber(stats.teachers)}` : '…', icon: 'students', color: '#0D9488', to: '/admin/etudiants' },
    { label: 'Cours référencés', value: formatNumber(stats?.courses), icon: 'courseUnit', color: '#7C3AED', to: '/admin/ue' },
    { label: 'Créneaux planifiés', value: formatNumber(stats?.sessions), icon: 'schedule', color: '#F59E0B', to: '/admin/cours' },
    { label: 'Visites aujourd’hui', value: formatNumber(stats?.visitsToday), icon: 'audience', color: '#10B981', to: '/admin/audience' },
    { label: 'Documents publiés', value: formatNumber(stats?.documents), icon: 'library', color: '#64748B' },
  ]

  const consoleUrl = `https://cloud.appwrite.io/console/project-fra-${APPWRITE_PROJECT_ID}`

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white border border-[#e5e7eb] p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <UniIcon name="settings" size={20} className="text-[#1e3a8a]" />
            <h1 className="text-xl font-bold text-[#111827]">Plateforme UniFlow</h1>
          </div>
          <p className="text-sm text-[#6b7280]">État réel de la plateforme : compteurs Appwrite, infrastructure, règles en vigueur et maintenance locale.</p>
        </div>
        <button onClick={() => { void refetch(); void measurePing() }}
          className="flex items-center gap-2 rounded-xl border border-[#e5e7eb] bg-white px-4 py-2.5 text-sm font-semibold text-[#374151] hover:bg-[#f9fafb] transition-colors">
          <UniIcon name="refresh" weight="bold" size={16} className={statsLoading || ping.state === 'checking' ? 'animate-spin' : ''} /> Actualiser
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-4">
        <div className="rounded-2xl border border-[#e5e7eb] bg-white p-3 shadow-sm h-fit">
          {sections.map(({ id, label, icon }) => (
            <button key={id} onClick={() => setSection(id)}
              className={`w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-left transition-all mb-0.5 ${section === id ? 'bg-[#1e3a8a] text-white shadow-md' : 'text-[#374151] hover:bg-[#f9fafb]'}`}>
              <UniIcon name={icon} weight={section === id ? 'fill' : 'duotone'} size={16} className={`flex-shrink-0 ${section === id ? 'text-white' : 'text-[#6b7280]'}`} />
              {label}
            </button>
          ))}
        </div>

        <div className="lg:col-span-3 space-y-4">
          {section === 'overview' && (
            <>
              <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
                {overviewCards.map(({ label, value, icon, color, to }, index) => {
                  const body = (
                    <>
                      <div className="mb-3"><IconTile name={icon} color={color} variant="filled" size={36} index={index} /></div>
                      <p className="text-2xl font-extrabold text-[#111827]">{value}</p>
                      <p className="text-xs text-[#6b7280] mt-0.5">{label}</p>
                    </>
                  )
                  return to
                    ? <Link key={label} to={to} className="rounded-xl border border-[#e5e7eb] bg-white p-4 shadow-sm card-hover block">{body}</Link>
                    : <div key={label} className="rounded-xl border border-[#e5e7eb] bg-white p-4 shadow-sm">{body}</div>
                })}
              </div>
              <p className="text-xs text-[#9ca3af]">
                {statsError ? 'Compteurs indisponibles : la Function /public-stats n’a pas répondu.' : dataUpdatedAt ? `Compteurs calculés côté serveur par la Function uniflow-api (/public-stats) · actualisés ${new Date(dataUpdatedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}.` : 'Chargement des compteurs…'}
              </p>
            </>
          )}

          {section === 'infra' && (
            <div className="rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-sm space-y-5">
              <h2 className="text-base font-bold text-[#111827] flex items-center gap-2"><UniIcon name="server" size={16} className="text-[#1e3a8a]" /> Appwrite Cloud</h2>
              <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm ${ping.state === 'ok' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : ping.state === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-[#e5e7eb] bg-[#f9fafb] text-[#6b7280]'}`}>
                {ping.state === 'checking' && <UniIcon name="spinner" weight="bold" size={16} className="animate-spin" />}
                {ping.state === 'ok' && <UniIcon name="success" weight="fill" size={16} />}
                {ping.state === 'error' && <UniIcon name="warning" weight="fill" size={16} />}
                <span className="font-semibold">
                  {ping.state === 'checking' && 'Mesure du temps de réponse…'}
                  {ping.state === 'ok' && `Appwrite répond en ${ping.ms} ms depuis ce navigateur.`}
                  {ping.state === 'error' && `Appwrite injoignable : ${ping.message}`}
                  {ping.state === 'idle' && 'Temps de réponse non mesuré.'}
                </span>
                <button onClick={() => void measurePing()} className="ml-auto rounded-lg bg-white/70 px-2.5 py-1 text-xs font-semibold hover:bg-white">Re-mesurer</button>
              </div>
              <dl className="grid gap-3 sm:grid-cols-2 text-sm">
                {[
                  ['Point d’accès', APPWRITE_ENDPOINT],
                  ['Projet', APPWRITE_PROJECT_ID],
                  ['Région', 'Francfort (fra) — offre gratuite'],
                  ['Base de données', APPWRITE_DATABASE_ID],
                  ['Bucket de fichiers', `${APPWRITE_BUCKET_ID} (droits par fichier)`],
                  ['Functions', 'uniflow-api (routeur HTTP) · notification-alerts (événements)'],
                  ['Hébergement web', 'Vercel — uniflow.kernelforge.codes'],
                  ['Version de l’application', `${APP_VERSION} · ${import.meta.env.MODE}`],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-[#f3f4f6] bg-[#f9fafb] p-3">
                    <dt className="text-[11px] font-bold uppercase tracking-wider text-[#9ca3af]">{label}</dt>
                    <dd className="mt-1 break-all font-medium text-[#111827]">{value}</dd>
                  </div>
                ))}
              </dl>
              {currentUser.isSuperAdmin && (
                <a href={consoleUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-[#1e3a8a] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#2d4fa8] transition-colors">
                  <UniIcon name="externalLink" weight="bold" size={16} /> Ouvrir la console Appwrite
                </a>
              )}
              <p className="text-xs text-[#9ca3af]">Les quotas de stockage et d’exécution ne sont pas exposés aux clients ; ils se consultent dans la console Appwrite.</p>
            </div>
          )}

          {section === 'rules' && (
            <div className="space-y-4">
              {[
                {
                  icon: 'key' as UniIconName, title: 'Comptes et rôles',
                  lines: [
                    'L’inscription libre ne crée que des étudiants (compte universitaire) ou des comptes indépendants.',
                    'Les comptes administration sont créés par l’administrateur de la plateforme ; une administration crée ses enseignants, délégués et étudiants.',
                    'La preuve du rôle est le label Appwrite (ADMIN, TEACHER, DELEGATE, superadmin), posé côté serveur par la Function ; le champ users.role n’est qu’un miroir.',
                  ],
                },
                {
                  icon: 'notifications' as UniIconName, title: 'Alertes automatiques',
                  lines: [
                    'Chaque absence ou retard relevé déclenche une notification à l’étudiant (Function notification-alerts, sur événement de création de relevé).',
                    'Les notifications sont poussées en temps réel dans le web par Appwrite Realtime ; aucun service tiers (pas de Firebase).',
                  ],
                },
                {
                  icon: 'messages' as UniIconName, title: 'Facturation',
                  lines: [
                    `Aucun paiement en ligne : toute demande se règle par WhatsApp au ${CONTACT_PHONE_DISPLAY}, avec un message pré-rempli reprenant la référence.`,
                    'Les demandes en attente se valident dans Administration → Paiements.',
                  ],
                  action: { label: 'Ouvrir WhatsApp', href: CONTACT_WHATSAPP_URL },
                },
                {
                  icon: 'globe' as UniIconName, title: 'Périmètre couvert',
                  lines: [
                    `Référentiel académique actuel : ${COVERAGE_LABEL}. Toutes les filières et niveaux enregistrés en base sont proposés à l’inscription.`,
                    `Contact plateforme : ${CONTACT_EMAIL_SECONDARY}.`,
                  ],
                },
              ].map(({ icon, title, lines, action }) => (
                <div key={title} className="rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
                  <h2 className="text-base font-bold text-[#111827] flex items-center gap-2 mb-3"><UniIcon name={icon} size={16} className="text-[#1e3a8a]" /> {title}</h2>
                  <ul className="space-y-2 text-sm text-[#374151]">
                    {lines.map((line) => <li key={line} className="flex gap-2"><UniIcon name="success" weight="fill" size={16} className="mt-0.5 shrink-0 text-[#0d9488]" /> <span>{line}</span></li>)}
                  </ul>
                  {action && <a href={action.href} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 rounded-xl border border-[#e5e7eb] px-3.5 py-2 text-xs font-bold text-[#1e3a8a] hover:bg-[#eff3ff]"><UniIcon name="externalLink" weight="bold" size={14} /> {action.label}</a>}
                </div>
              ))}
            </div>
          )}

          {section === 'maintenance' && (
            <div className="rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-sm space-y-5">
              <h2 className="text-base font-bold text-[#111827] flex items-center gap-2"><UniIcon name="database" size={16} className="text-[#1e3a8a]" /> Cache de ce navigateur</h2>
              <p className="text-sm text-[#6b7280]">UniFlow garde une copie locale des dernières données (IndexedDB) et des fichiers de l’application (service worker) pour fonctionner hors ligne. Si une page affiche des données visiblement périmées après une correction en base, videz ce cache.</p>
              <dl className="grid gap-3 sm:grid-cols-2 text-sm">
                <div className="rounded-xl border border-[#f3f4f6] bg-[#f9fafb] p-3"><dt className="text-[11px] font-bold uppercase tracking-wider text-[#9ca3af]">Caches applicatifs</dt><dd className="mt-1 font-medium text-[#111827]">{cacheInfo ? `${cacheInfo.caches} cache${cacheInfo.caches > 1 ? 's' : ''} UniFlow` : '…'}</dd></div>
                <div className="rounded-xl border border-[#f3f4f6] bg-[#f9fafb] p-3"><dt className="text-[11px] font-bold uppercase tracking-wider text-[#9ca3af]">Service worker</dt><dd className="mt-1 font-medium text-[#111827]">{cacheInfo ? (cacheInfo.swActive ? 'Actif (mode hors ligne disponible)' : 'Inactif') : '…'}</dd></div>
              </dl>
              {maintenance.message && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{maintenance.message}</p>}
              <div className="flex flex-wrap gap-2">
                <button onClick={() => void clearLocalCaches()} disabled={maintenance.busy}
                  className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-700 hover:bg-red-100 disabled:opacity-60 transition-colors">
                  {maintenance.busy ? <UniIcon name="spinner" weight="bold" size={16} className="animate-spin" /> : <UniIcon name="trash" size={16} />} Vider le cache local
                </button>
                <button onClick={() => window.location.reload()} className="flex items-center gap-2 rounded-xl border border-[#e5e7eb] px-4 py-2.5 text-sm font-bold text-[#374151] hover:bg-[#f9fafb] transition-colors">
                  <UniIcon name="refresh" weight="bold" size={16} /> Recharger l’application
                </button>
              </div>
              <p className="text-xs text-[#9ca3af]">Les écritures faites hors ligne et non encore synchronisées ne sont pas supprimées par ce nettoyage.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
