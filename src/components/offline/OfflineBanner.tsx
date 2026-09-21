import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useQueryClient } from '@tanstack/react-query'
import { UniMascot } from '../mascot/UniMascot'
import { cn } from '../../utils/cn'
import { useOnlineStatus } from '../../lib/offline/networkStatus'
import { latestDataTimestamp, offlineBannerDetail, offlineBannerTitle } from '../../lib/offline/offlineModel'
import { usePendingWriteCount } from '../../lib/offline/writeQueue'
import type { ReplayReport } from '../../lib/offline/writeQueue'

/**
 * Bandeau persistant hors ligne : Uni dort, la date des données affichées
 * (la lecture réussie la plus récente du cache) et le nombre d'écritures en
 * attente. Au retour du réseau, un court message résume ce qui a été envoyé.
 */
export function OfflineBanner({ className }: { className?: string }) {
  const online = useOnlineStatus()
  const queryClient = useQueryClient()
  const pendingWrites = usePendingWriteCount()
  const [latestDataAt, setLatestDataAt] = useState<number | null>(null)
  const [replayNotice, setReplayNotice] = useState<string | null>(null)

  useEffect(() => {
    if (online) return
    // Calculée à l'entrée en mode hors ligne : la date ne bouge plus ensuite,
    // puisque plus rien ne peut se rafraîchir.
    const entries = queryClient.getQueryCache().getAll().map((query) => ({ dataUpdatedAt: query.state.dataUpdatedAt, hasData: query.state.data !== undefined }))
    setLatestDataAt(latestDataTimestamp(entries))
  }, [online, queryClient])

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined
    const onReplay = (event: Event) => {
      const report = (event as CustomEvent<ReplayReport>).detail
      if (!report) return
      const parts: string[] = []
      if (report.sent.length) parts.push(`${report.sent.length} action${report.sent.length > 1 ? 's' : ''} envoyée${report.sent.length > 1 ? 's' : ''}`)
      if (report.dropped.length) parts.push(`${report.dropped.length} refusée${report.dropped.length > 1 ? 's' : ''} par le serveur`)
      if (!parts.length) return
      setReplayNotice(`Réseau retrouvé : ${parts.join(', ')}.`)
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => setReplayNotice(null), 6000)
    }
    window.addEventListener('uniflow:offline-replay', onReplay)
    return () => {
      window.removeEventListener('uniflow:offline-replay', onReplay)
      if (timer) clearTimeout(timer)
    }
  }, [])

  return (
    <AnimatePresence>
      {!online && (
        <motion.div
          key="offline"
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 60, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 26 }}
          role="status"
          aria-live="polite"
          className={cn('fixed bottom-4 left-1/2 z-[70] flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center gap-3 rounded-2xl border border-slate-200 bg-white/95 px-4 py-2.5 shadow-xl backdrop-blur dark:border-slate-700 dark:bg-slate-900/95', className)}
        >
          <UniMascot pose="sleeping" size={44} safe effects={false} />
          <div className="min-w-0 text-left">
            <p className="text-sm font-black text-slate-900 dark:text-white">{offlineBannerTitle(latestDataAt)}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{offlineBannerDetail(pendingWrites)}</p>
          </div>
        </motion.div>
      )}
      {online && replayNotice && (
        <motion.div
          key="replay"
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 60, opacity: 0 }}
          role="status"
          className="fixed bottom-4 left-1/2 z-[70] -translate-x-1/2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-800 shadow-xl"
        >
          {replayNotice}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default OfflineBanner
