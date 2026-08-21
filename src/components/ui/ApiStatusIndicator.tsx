import React, { useState, useEffect, useCallback } from 'react'
import { Wifi, WifiOff, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { appwriteAccount } from '../../lib/appwrite'
import { cn } from '../../utils/cn'

export type ApiStatus = 'checking' | 'connected' | 'offline' | 'error'

interface ApiStatusIndicatorProps {
  className?: string
  showLatency?: boolean
  autoRefreshIntervalMs?: number
  compact?: boolean
}

export const ApiStatusIndicator: React.FC<ApiStatusIndicatorProps> = ({
  className,
  showLatency = true,
  autoRefreshIntervalMs = 30000,
  compact = false,
}) => {
  const [status, setStatus] = useState<ApiStatus>('checking')
  const [latency, setLatency] = useState<number | null>(null)
  const [lastChecked, setLastChecked] = useState<Date | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [errorDetails, setErrorDetails] = useState<string | null>(null)

  const checkConnectivity = useCallback(async () => {
    setIsRefreshing(true)
    const startTime = performance.now()
    try {
      // Appwrite est l’unique source réseau : account.get() vérifie le VPS
      // avec la session active, ou produit une réponse Appwrite explicite.
      await appwriteAccount.get()
      const endTime = performance.now()
      const duration = Math.round(endTime - startTime)

      setStatus('connected')
      setLatency(duration)
      setErrorDetails(null)
    } catch (err: any) {
      const endTime = performance.now()
      const duration = Math.round(endTime - startTime)

      if (!navigator.onLine) {
        setStatus('offline')
        setErrorDetails('Pas de connexion internet client')
      } else if (err.code === 'ECONNABORTED' || err.message?.includes('timeout') || !err.response) {
        // Unreachable or timeout
        setStatus('offline')
        setLatency(duration)
        setErrorDetails('Serveur indisponible ou délai dépassé')
      } else {
        // Got a response with error status (4xx/5xx) or similar from server
        setStatus('error')
        setLatency(duration)
        setErrorDetails(`Code HTTP: ${err.response?.status || 'Inconnu'}`)
      }
    } finally {
      setLastChecked(new Date())
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    checkConnectivity()
    if (autoRefreshIntervalMs > 0) {
      const interval = setInterval(checkConnectivity, autoRefreshIntervalMs)
      return () => clearInterval(interval)
    }
  }, [checkConnectivity, autoRefreshIntervalMs])

  const renderStatusDot = () => {
    if (isRefreshing || status === 'checking') {
      return (
        <span className="relative flex h-2.5 w-2.5 items-center justify-center">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
        </span>
      )
    }

    if (status === 'connected') {
      return (
        <span className="relative flex h-2.5 w-2.5 items-center justify-center">
          <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
      )
    }

    if (status === 'offline') {
      return (
        <span className="relative flex h-2.5 w-2.5 items-center justify-center">
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
        </span>
      )
    }

    return (
      <span className="relative flex h-2.5 w-2.5 items-center justify-center">
        <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
      </span>
    )
  }

  const getStatusText = () => {
    if (isRefreshing || status === 'checking') return 'Vérification Appwrite...'
    if (status === 'connected') return 'Appwrite connecté'
    if (status === 'offline') return 'Appwrite hors ligne'
    return 'Erreur Appwrite'
  }

  const getBadgeStyle = () => {
    if (status === 'connected') {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200/80 hover:bg-emerald-100/80'
    }
    if (status === 'offline') {
      return 'bg-amber-50 text-amber-700 border-amber-200/80 hover:bg-amber-100/80'
    }
    if (status === 'error') {
      return 'bg-rose-50 text-rose-700 border-rose-200/80 hover:bg-rose-100/80'
    }
    return 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
  }

  if (compact) {
    return (
      <button
        type="button"
        onClick={checkConnectivity}
        title={`Status API: ${getStatusText()}${latency ? ` (${latency}ms)` : ''}${errorDetails ? ` - ${errorDetails}` : ''}. Cliquer pour rafraîchir.`}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-all duration-200 cursor-pointer select-none',
          getBadgeStyle(),
          className
        )}
      >
        {renderStatusDot()}
        <span>{getStatusText()}</span>
        {showLatency && latency !== null && status === 'connected' && (
          <span className="text-[10px] opacity-75 font-mono">({latency}ms)</span>
        )}
      </button>
    )
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all duration-200 shadow-xs',
        getBadgeStyle(),
        className
      )}
    >
      <div className="flex items-center gap-2">
        {renderStatusDot()}
        <span className="truncate">{getStatusText()}</span>
      </div>

      {showLatency && latency !== null && status === 'connected' && (
        <span className="rounded-md bg-emerald-100/80 px-1.5 py-0.5 text-[10px] font-mono font-bold text-emerald-800">
          {latency}ms
        </span>
      )}

      {errorDetails && (status === 'error' || status === 'offline') && (
        <span className="hidden sm:inline-block truncate max-w-[120px] text-[10px] opacity-80" title={errorDetails}>
          ({errorDetails})
        </span>
      )}

      <button
        type="button"
        onClick={checkConnectivity}
        disabled={isRefreshing}
        title="Tester à nouveau la connexion API"
        className="ml-0.5 rounded-md p-1 hover:bg-black/5 active:scale-95 transition-all text-current opacity-70 hover:opacity-100"
      >
        <RefreshCw className={cn('h-3 w-3', isRefreshing && 'animate-spin')} />
      </button>
    </div>
  )
}
export default ApiStatusIndicator
