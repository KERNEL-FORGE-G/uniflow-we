import { useState, useCallback } from 'react'
import type { ToastType } from '../components/ui/Toast'
import { playSuccessSound, playErrorSound } from './sound'

interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36)
    setToasts((prev) => [...prev, { ...toast, id }])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const success = useCallback(
    (title: string, message?: string, duration?: number) => {
      playSuccessSound()
      addToast({ type: 'success', title, message, duration })
    },
    [addToast]
  )

  const error = useCallback(
    (title: string, message?: string, duration?: number) => {
      playErrorSound()
      addToast({ type: 'error', title, message, duration })
    },
    [addToast]
  )

  const warning = useCallback(
    (title: string, message?: string, duration?: number) => {
      playErrorSound()
      addToast({ type: 'warning', title, message, duration })
    },
    [addToast]
  )

  const info = useCallback(
    (title: string, message?: string, duration?: number) => {
      addToast({ type: 'info', title, message, duration })
    },
    [addToast]
  )

  return {
    toasts,
    success,
    error,
    warning,
    info,
    removeToast,
  }
}
