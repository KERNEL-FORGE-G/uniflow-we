import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Clock, Calendar, Sparkles, AlertCircle, RefreshCw, CheckCircle2, Zap, ArrowRight, ShieldCheck, CreditCard } from 'lucide-react'
import { subscriptionApi, type SubscriptionStatus } from '../../lib/api'
import { SubscriptionModal } from './SubscriptionModal'

export const SubscriptionWidget: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const [status, setStatus] = useState<SubscriptionStatus | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [modalOpen, setModalOpen] = useState<boolean>(false)

  const fetchStatus = async () => {
    setLoading(true)
    try {
      const data = await subscriptionApi.getStatus()
      setStatus(data)
    } catch (err) {
      console.error('Erreur statut abonnement:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
  }, [])

  // Dynamic calculations for remaining time
  const now = new Date()
  const periodEnd = status?.currentPeriodEnd ? new Date(status.currentPeriodEnd) : new Date(now.getTime() + 30 * 24 * 3600 * 1000)
  const totalMs = 30 * 24 * 3600 * 1000 // 30 days standard
  const diffMs = periodEnd.getTime() - now.getTime()
  
  const remainingDays = Math.max(0, Math.floor(diffMs / (24 * 3600 * 1000)))
  const remainingHours = Math.max(0, Math.floor((diffMs % (24 * 3600 * 1000)) / (3600 * 1000)))
  const percentRemaining = Math.min(100, Math.max(0, Math.round((diffMs / totalMs) * 100)))

  const formattedExpDate = periodEnd.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  const priceFormatted = status?.currency === 'XAF' || status?.countryCode === 'CM' 
    ? '100 FCFA / mois' 
    : '1,00 € / mois'

  const countryLabel = status?.countryCode === 'CM' ? '🇨🇲 Cameroun' : '🇫🇷 France / Europe'

  return (
    <>
      <div className={`relative overflow-hidden rounded-2xl border transition-all duration-300 ${
        compact 
          ? 'bg-gradient-to-r from-slate-900 to-blue-950 text-white p-4 border-slate-800 shadow-md'
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md'
      }`}>
        {/* Glow effect */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-48 h-48 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          {/* Main Info */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-3 w-3" />
                Abonnement Actif
              </span>

              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                • {priceFormatted} ({countryLabel})
              </span>
            </div>

            <h3 className={`font-black tracking-tight flex items-center gap-2 ${compact ? 'text-lg text-white' : 'text-xl text-slate-900 dark:text-white'}`}>
              <Clock className="h-5 w-5 text-[#0d9488]" />
              <span>{remainingDays} jours et {remainingHours}h restants</span>
            </h3>

            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <span>Cycle mensuel · Expire le <strong>{formattedExpDate}</strong></span>
            </p>
          </div>

          {/* Action Button & Status */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={fetchStatus}
              disabled={loading}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 transition-all active:scale-95"
              title="Actualiser le temps restant"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] hover:opacity-95 text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all active:scale-95"
            >
              <CreditCard className="h-3.5 w-3.5" />
              <span>Renouveler</span>
            </button>
          </div>

        </div>

        {/* Progress Bar */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1.5">
            <span>Progression de la période mensuelle</span>
            <span className="text-[#0d9488] font-bold">{remainingDays} / 30 Jours restants ({percentRemaining}%)</span>
          </div>

          <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden p-0.5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentRemaining}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className={`h-full rounded-full ${
                remainingDays > 7 
                  ? 'bg-gradient-to-r from-[#1e3a8a] to-[#0d9488]' 
                  : remainingDays > 2
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                  : 'bg-gradient-to-r from-rose-500 to-red-600'
              }`}
            />
          </div>
        </div>
      </div>

      <SubscriptionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchStatus}
      />
    </>
  )
}
