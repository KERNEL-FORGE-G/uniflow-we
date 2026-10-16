import { useEffect } from 'react'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'
import { cn } from '../../utils/cn'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastProps {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
  onClose: (id: string) => void
}

const toastConfig = {
  success: {
    icon: CheckCircle,
    bg: 'bg-[#d1fae5]',
    border: 'border-[#a7f3d0]',
    text: 'text-[#065f46]',
    iconColor: 'text-[#059669]',
  },
  error: {
    icon: XCircle,
    bg: 'bg-[#fee2e2]',
    border: 'border-[#fecaca]',
    text: 'text-[#991b1b]',
    iconColor: 'text-[#dc2626]',
  },
  warning: {
    icon: AlertCircle,
    bg: 'bg-[#fef3c7]',
    border: 'border-[#fde68a]',
    text: 'text-[#92400e]',
    iconColor: 'text-[#d97706]',
  },
  info: {
    icon: Info,
    bg: 'bg-[#dbeafe]',
    border: 'border-[#bfdbfe]',
    text: 'text-[#1e40af]',
    iconColor: 'text-[#3b82f6]',
  },
}

export function Toast({ id, type, title, message, duration = 5000, onClose }: ToastProps) {
  const config = toastConfig[type]
  const Icon = config.icon

  useEffect(() => {
    const timer = setTimeout(() => onClose(id), duration)
    return () => clearTimeout(timer)
  }, [id, duration, onClose])

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-lg border border-l-4 p-4 shadow-lg animate-notification-in min-w-[320px] max-w-md',
        config.bg,
        config.border,
        config.text
      )}
    >
      <Icon className={cn('h-5 w-5 shrink-0 mt-0.5', config.iconColor)} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">{title}</p>
        {message && <p className="text-xs mt-1 opacity-90">{message}</p>}
      </div>
      <button
        onClick={() => onClose(id)}
        className="shrink-0 rounded p-0.5 hover:bg-black/10 active:scale-90 transition-all"
        aria-label="Fermer"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

interface ToastContainerProps {
  toasts: Array<{
    id: string
    type: ToastType
    title: string
    message?: string
    duration?: number
  }>
  onClose: (id: string) => void
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div className="fixed top-20 right-6 z-50 flex flex-col gap-3 pointer-events-none">
      <div className="pointer-events-auto space-y-3">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onClose={onClose} />
        ))}
      </div>
    </div>
  )
}
