import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock, Calendar, AlertTriangle, RefreshCw, CheckCircle2, CreditCard, ArrowRight } from 'lucide-react'
import { subscriptionApi, type SubscriptionStatus as SubscriptionStatusType } from '../../lib/api'

export const SubscriptionStatus: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const [status, setStatus] = useState<SubscriptionStatusType | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [statusError, setStatusError] = useState<string | null>(null)
  const navigate = useNavigate()

  const fetchStatus = async () => {
    setLoading(true)
    setStatusError(null)
    try {
      setStatus(await subscriptionApi.getStatus())
    } catch (error) {
      setStatus(null)
      setStatusError(error instanceof Error ? error.message : 'Impossible de charger le statut depuis Appwrite.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchStatus()
    const retryAfterSession = () => { void fetchStatus() }
    window.addEventListener('uniflow:session-restored', retryAfterSession)
    return () => window.removeEventListener('uniflow:session-restored', retryAfterSession)
  }, [])

  if (!status && !loading) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Abonnement indisponible</h3>
            <p className="mt-1 text-xs text-slate-500">Aucun statut d’abonnement n’est encore fourni par Appwrite pour ce compte.</p>
            {statusError && <p className="mt-1 text-[11px] text-slate-400">{statusError}</p>}
          </div>
          <button onClick={fetchStatus} className="rounded-xl bg-slate-100 p-2.5 text-slate-600 hover:bg-slate-200" title="Actualiser le statut">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>
    )
  }

  if (!status) return null
  if (status.status === 'PENDING') {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm dark:border-amber-800 dark:bg-amber-950/30">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200"><Clock className="h-4 w-4" /><h3 className="text-sm font-bold">Demande de paiement en attente</h3></div>
            <p className="mt-1 text-xs text-amber-900/80 dark:text-amber-100/80">Votre demande {status.planCode ? `pour ${status.planCode}` : ''} est enregistrée dans Appwrite. L’accès sera activé uniquement après vérification manuelle de votre preuve de paiement.</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button onClick={fetchStatus} className="rounded-xl bg-white/70 p-2.5 text-amber-700 hover:bg-white" title="Actualiser le statut"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /></button>
            <button onClick={() => navigate('/subscribe')} className="rounded-xl bg-amber-700 px-3 py-2.5 text-xs font-bold text-white hover:bg-amber-800">Voir la demande</button>
          </div>
        </div>
      </div>
    )
  }
  if (status.status === 'NONE' || !status.currency || status.monthlyAmount == null) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900">Aucun abonnement actif</h3>
        <p className="mt-1 text-xs text-slate-500">Aucune souscription persistée n’est associée à ce compte.</p>
        {statusError && <p className="mt-1 text-[11px] text-slate-400">{statusError}</p>}
      </div>
    )
  }

  const now = new Date()
  const periodEnd = new Date(status.currentPeriodEnd ?? '')
  const hasPeriodEnd = Number.isFinite(periodEnd.getTime())
  const diffMs = hasPeriodEnd ? periodEnd.getTime() - now.getTime() : 0
  const remainingDays = Math.max(0, Math.floor(diffMs / (24 * 3600 * 1000)))
  const remainingHours = Math.max(0, Math.floor((diffMs % (24 * 3600 * 1000)) / (3600 * 1000)))
  const isUnder7Days = status.status === 'EXPIRED' || remainingDays < 7
  const formattedExpDate = hasPeriodEnd
    ? periodEnd.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'non communiquée'
  const priceFormatted = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: status.currency }).format(status.monthlyAmount)
  const statusLabel = status.status === 'ACTIVE' ? 'Abonnement actif' : status.status === 'TRIAL' ? 'Période d’essai' : `Abonnement ${status.status.toLowerCase()}`

  const handleRenewClick = () => {
    navigate('/subscribe')
  }

  return (
    <>
      <div
        id="subscription-status-card"
        className={`relative overflow-hidden rounded-2xl border transition-all duration-300 ${
          isUnder7Days
            ? 'bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-rose-500/10 dark:from-amber-950/30 dark:to-rose-950/30 border-amber-300 dark:border-amber-800 shadow-md'
            : compact
            ? 'bg-gradient-to-r from-slate-900 to-blue-950 text-white p-5 border-slate-800 shadow-md'
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md'
        }`}
      >
        {/* Ambient Glow */}
        <div
          className={`absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-48 h-48 rounded-full blur-2xl pointer-events-none ${
            isUnder7Days ? 'bg-amber-500/20' : 'bg-teal-500/10'
          }`}
        />

        {/* Header & Alert if under 7 days */}
        {isUnder7Days && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-amber-500/15 border border-amber-500/30 px-3.5 py-2 text-xs font-semibold text-amber-800 dark:text-amber-300">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 animate-pulse" />
            <span>
              <strong>Attention :</strong> Votre formule expire dans <strong>{remainingDays} jours</strong>. Renouvelez dès maintenant pour conserver vos accès illimités.
            </span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Main Info */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-extrabold ${
                  isUnder7Days
                    ? 'bg-amber-500/20 border border-amber-500/40 text-amber-700 dark:text-amber-300'
                    : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                }`}
              >
                <CheckCircle2 className="h-3 w-3" />
                {statusLabel}
              </span>

              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                • {priceFormatted} · {status.countryCode}
              </span>
            </div>

            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Clock className={`h-5 w-5 ${isUnder7Days ? 'text-amber-500' : 'text-[#0d9488]'}`} />
              <span>{hasPeriodEnd ? `${remainingDays} ${remainingDays > 1 ? 'jours' : 'jour'} et ${remainingHours}h restants` : 'Durée non communiquée'}</span>
            </h3>

            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <span>Cycle mensuel · Expire le <strong>{formattedExpDate}</strong></span>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              id="subscription-status-refresh-btn"
              onClick={fetchStatus}
              disabled={loading}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all active:scale-95 cursor-pointer"
              title="Actualiser le temps restant"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              id="subscription-status-renew-btn"
              onClick={handleRenewClick}
              className={`flex items-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer ${
                isUnder7Days
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white animate-bounce'
                  : 'bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] hover:opacity-95 text-white'
              }`}
            >
              <CreditCard className="h-3.5 w-3.5" />
              <span>{isUnder7Days ? 'Renouveler Maintenant' : 'Renouveler'}</span>
              {isUnder7Days && <ArrowRight className="h-3.5 w-3.5 ml-0.5" />}
            </button>
          </div>
        </div>

      </div>
    </>
  )
}
