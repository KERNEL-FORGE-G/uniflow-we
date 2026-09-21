import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, FileSpreadsheet, FileText, Loader2, XCircle } from 'lucide-react'
import { cn } from '../../utils/cn'
import { downloadExport, type ExportDocument, type ExportFormat } from '../../lib/exports'

interface ExportButtonsProps {
  /**
   * Construit le document au clic et non au rendu : les pages listent souvent
   * des centaines de lignes et le calcul n'a de sens que si l'utilisateur exporte.
   * Renvoyer `null` signale qu'il n'y a rien à exporter.
   */
  getDocument: () => ExportDocument | null | Promise<ExportDocument | null>
  /** Force la désactivation (liste vide, chargement en cours…). */
  disabled?: boolean
  /** Info-bulle expliquant pourquoi les boutons sont grisés. */
  disabledReason?: string
  size?: 'sm' | 'md'
  className?: string
  /** Formats proposés ; PDF et Excel par défaut. */
  formats?: ExportFormat[]
}

const FORMAT_META: Record<ExportFormat, { label: string; icon: typeof FileText; title: string }> = {
  pdf: { label: 'PDF', icon: FileText, title: 'Télécharger au format PDF' },
  xlsx: { label: 'Excel', icon: FileSpreadsheet, title: 'Télécharger au format Excel (.xlsx)' },
}

export function ExportButtons({ getDocument, disabled = false, disabledReason, size = 'sm', className, formats = ['pdf', 'xlsx'] }: ExportButtonsProps) {
  const [busy, setBusy] = useState<ExportFormat | null>(null)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    if (!feedback) return
    const timer = setTimeout(() => setFeedback(null), feedback.type === 'error' ? 6000 : 3500)
    return () => clearTimeout(timer)
  }, [feedback])

  const run = async (format: ExportFormat) => {
    if (busy || disabled) return
    setBusy(format)
    setFeedback(null)
    try {
      const doc = await getDocument()
      if (!doc || doc.rows.length === 0) {
        setFeedback({ type: 'error', text: 'Aucune donnée à exporter.' })
        return
      }
      const fileName = await downloadExport(doc, format)
      setFeedback({ type: 'success', text: `${fileName} téléchargé` })
    } catch (error) {
      setFeedback({ type: 'error', text: error instanceof Error && error.message ? error.message : 'Export impossible pour le moment.' })
    } finally {
      setBusy(null)
    }
  }

  const buttonClass = cn(
    'inline-flex items-center gap-1.5 rounded-lg border font-semibold transition-colors',
    'border-[#e5e7eb] bg-white text-[#374151] hover:border-[#1e3a8a]/40 hover:bg-[#eef2ff] hover:text-[#1e3a8a]',
    'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-[#374151] disabled:hover:border-[#e5e7eb]',
    size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm',
  )
  const iconClass = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {formats.map((format) => {
        const meta = FORMAT_META[format]
        const Icon = busy === format ? Loader2 : meta.icon
        return (
          <button
            key={format}
            type="button"
            onClick={() => void run(format)}
            disabled={disabled || busy !== null}
            title={disabled && disabledReason ? disabledReason : meta.title}
            aria-label={meta.title}
            className={buttonClass}
          >
            <Icon className={cn(iconClass, busy === format && 'animate-spin')} />
            {busy === format ? 'Préparation…' : meta.label}
          </button>
        )
      })}
      <AnimatePresence>
        {feedback && (
          <motion.span
            key={feedback.text}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            role="status"
            className={cn('inline-flex items-center gap-1 text-xs font-medium', feedback.type === 'success' ? 'text-emerald-700' : 'text-red-600')}
          >
            {feedback.type === 'success' ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
            {feedback.text}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ExportButtons
