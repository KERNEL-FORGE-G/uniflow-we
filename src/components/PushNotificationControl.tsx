import React, { useState, useEffect } from 'react'
import {
  Bell,
  BellOff,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Smartphone,
  Send,
  Sparkles,
  ShieldCheck,
  RefreshCw
} from 'lucide-react'
import { pushNotificationService } from '../services/pushNotificationService'

interface PushNotificationControlProps {
  compact?: boolean
  className?: string
}

export const PushNotificationControl: React.FC<PushNotificationControlProps> = ({
  compact = false,
  className = ''
}) => {
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default')
  const [enabled, setEnabled] = useState<boolean>(false)
  const [appwriteChannel, setAppwriteChannel] = useState(pushNotificationService.getAppwritePushState())
  const [loading, setLoading] = useState<boolean>(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  useEffect(() => {
    checkStatus()
  }, [])

  const checkStatus = () => {
    const perm = pushNotificationService.getPermissionState()
    setPermission(perm)
    setEnabled(pushNotificationService.isEnabled())
    setAppwriteChannel(pushNotificationService.getAppwritePushState())
  }

  const handleToggle = async () => {
    setLoading(true)
    setStatusMessage(null)
    try {
      if (!enabled) {
        const granted = await pushNotificationService.setEnabled(true)
        if (granted) {
          setEnabled(true)
          setPermission('granted')
          const appwriteResult = await pushNotificationService.registerAppwritePushTarget()
          setAppwriteChannel(appwriteResult.state)
          setStatusMessage(appwriteResult.state === 'registered' ? appwriteResult.message : `Notifications locales PWA activées. ${appwriteResult.message}`)
          // Trigger initial test
          await pushNotificationService.sendTestNotification()
        } else {
          setEnabled(false)
          setPermission(pushNotificationService.getPermissionState())
          setStatusMessage('Permission refusée par le navigateur.')
        }
      } else {
        await pushNotificationService.setEnabled(false)
        setEnabled(false)
        setStatusMessage('Notifications Push désactivées.')
      }
    } catch (e: any) {
      setStatusMessage('Erreur lors de la configuration des notifications.')
    } finally {
      setLoading(false)
    }
  }

  const handleTestPush = async (type: 'test' | 'devoir' | 'annonce') => {
    if (!enabled && permission !== 'granted') {
      const perm = await pushNotificationService.requestPermission()
      if (perm !== 'granted') {
        setStatusMessage('Veuillez d\'abord autoriser les notifications.')
        return
      }
      setEnabled(true)
      setPermission('granted')
    }

    if (type === 'devoir') {
      await pushNotificationService.notifyNewAssignment({
        title: 'TP n°3 - PWA & Web Workers',
        courseName: 'INF305 - Dev Mobile',
        dueDate: '15 Août 2026'
      })
      setStatusMessage('Notification de devoir envoyée via ServiceWorker !')
    } else if (type === 'annonce') {
      await pushNotificationService.notifyNewAnnouncement({
        title: 'Modification d\'emploi du temps ICT4D L1',
        author: 'Chef de Département',
        content: 'Le cours de Sécurité Informatique aura lieu en Amphi 250 ce vendredi.'
      })
      setStatusMessage('Notification d\'annonce envoyée via ServiceWorker !')
    } else {
      await pushNotificationService.sendTestNotification()
      setStatusMessage('Notification test envoyée via ServiceWorker !')
    }
  }

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-2 rounded-xl bg-white border border-[#e5e7eb] px-3 py-1.5 shadow-xs ${className}`}>
        <Bell className={`h-4 w-4 ${enabled ? 'text-emerald-600 animate-pulse' : 'text-[#6b7280]'}`} />
        <span className="text-xs font-bold text-[#374151]">
          Push PWA: {enabled ? 'Activé' : 'Désactivé'}
        </span>
        <button
          onClick={handleToggle}
          disabled={loading}
          className="ml-1 rounded-lg bg-[#1e3a8a] px-2 py-0.5 text-[11px] font-bold text-white hover:bg-[#1e3a8a]/90 transition-colors"
        >
          {enabled ? 'Désactiver' : 'Activer'}
        </button>
      </div>
    )
  }

  return (
    <div className={`rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-sm space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f3f4f6] pb-4">
        <div className="flex items-center gap-3">
          <div className={`rounded-xl p-3 ${enabled ? 'bg-emerald-50 text-emerald-600' : 'bg-[#eff3ff] text-[#1e3a8a]'}`}>
            {enabled ? <Bell className="h-6 w-6" /> : <BellOff className="h-6 w-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-[#111827]">Notifications Web</h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-[#1e3a8a] border border-[#1e3a8a]/20">
                <Smartphone className="h-3 w-3" /> API ServiceWorker
              </span>
            </div>
              <p className="text-xs text-[#6b7280] mt-0.5">Les alertes locales utilisent le Service Worker ; les envois distants Appwrite nécessitent un fournisseur FCM configuré.</p>
          </div>
        </div>

        {/* Toggle Switch */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs font-bold text-[#374151]">
            {enabled ? 'Alertes activées' : 'Alertes désactivées'}
          </span>
          <button
            type="button"
            onClick={handleToggle}
            disabled={loading || permission === 'unsupported'}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              enabled ? 'bg-emerald-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                enabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Permission Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-[#f9fafb] border border-[#e5e7eb] p-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#374151]">Statut du navigateur :</span>
          {permission === 'granted' ? (
            <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
              <CheckCircle2 className="h-3.5 w-3.5" /> Autorisé
            </span>
          ) : permission === 'denied' ? (
            <span className="inline-flex items-center gap-1 font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-md">
              <XCircle className="h-3.5 w-3.5" /> Bloqué
            </span>
          ) : permission === 'unsupported' ? (
            <span className="inline-flex items-center gap-1 font-bold text-gray-700 bg-gray-200 px-2 py-0.5 rounded-md">
              <AlertCircle className="h-3.5 w-3.5" /> Non supporté
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
              <AlertCircle className="h-3.5 w-3.5" /> En attente de permission
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-[11px] text-[#6b7280]">
          <ShieldCheck className="h-3.5 w-3.5 text-blue-600" /> Worker registered: <code className="font-mono text-[#1e3a8a]">/sw.js</code>
        </div>
      </div>

      <div className={`rounded-xl border p-3 text-xs ${appwriteChannel === 'registered' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-amber-200 bg-amber-50 text-amber-800'}`}>
        <span className="font-bold">Canal Appwrite : </span>{appwriteChannel === 'registered' ? 'cible push enregistrée pour cet appareil.' : appwriteChannel === 'not-configured' ? 'configuration FCM requise pour les notifications distantes.' : 'cible distante indisponible sur cet appareil.'}
      </div>

      {statusMessage && (
        <div className="rounded-xl bg-blue-50 border border-blue-200 p-3 text-xs font-semibold text-[#1e3a8a] flex items-center justify-between">
          <span>{statusMessage}</span>
          <button onClick={() => setStatusMessage(null)} className="text-xs text-blue-800 hover:underline">
            Fermer
          </button>
        </div>
      )}

      {/* Action Buttons for Testing */}
      <div className="space-y-2 pt-2">
        <h4 className="text-xs font-bold text-[#6b7280] uppercase tracking-wider">
          Tester le Service Worker Push
        </h4>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleTestPush('test')}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-xl border border-[#e5e7eb] bg-white px-3.5 py-2 text-xs font-bold text-[#374151] hover:bg-[#f9fafb] hover:border-[#1e3a8a] transition-all shadow-xs"
          >
            <Send className="h-3.5 w-3.5 text-[#1e3a8a]" /> Tester une alerte locale
          </button>

          <button
            onClick={() => handleTestPush('devoir')}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2 text-xs font-bold text-amber-800 hover:bg-amber-100 transition-all shadow-xs"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-600" /> Alerte Devoir
          </button>

          <button
            onClick={() => handleTestPush('annonce')}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-xl border border-purple-200 bg-purple-50 px-3.5 py-2 text-xs font-bold text-purple-800 hover:bg-purple-100 transition-all shadow-xs"
          >
            <Bell className="h-3.5 w-3.5 text-purple-600" /> Alerte Annonce
          </button>

          <button
            onClick={checkStatus}
            title="Rafraîchir statut"
            className="rounded-xl border border-[#e5e7eb] bg-white p-2 text-[#6b7280] hover:text-[#111827] hover:bg-[#f9fafb] transition-all"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default PushNotificationControl
