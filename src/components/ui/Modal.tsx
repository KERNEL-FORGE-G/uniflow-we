import { useEffect, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { X, type LucideIcon } from 'lucide-react'
import { cn } from '@/utils/cn'

/**
 * Boîte de dialogue commune : fond flouté, apparition en glissement, fermeture
 * par Échap ou clic sur le fond. À rendre dans un `AnimatePresence` pour que
 * la sortie soit animée.
 */
export function Modal({ title, icon: Icon, tone = 'default', onClose, children }: { title: string; icon: LucideIcon; tone?: 'default' | 'danger'; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-4 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } }}
        exit={{ opacity: 0, y: 16, scale: 0.98, transition: { duration: 0.2 } }}
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl sm:p-7"
      >
        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className={cn('flex h-10 w-10 items-center justify-center rounded-xl', tone === 'danger' ? 'bg-rose-50 text-rose-600' : 'bg-[#eff3ff] text-[#1e3a8a]')}><Icon className="h-5 w-5" /></span>
            <h2 className="text-lg font-black text-[#111827]">{title}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Fermer" className="rounded-lg p-2 text-[#9ca3af] transition hover:bg-[#f3f4f6] hover:text-[#374151]"><X className="h-5 w-5" /></button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  )
}
