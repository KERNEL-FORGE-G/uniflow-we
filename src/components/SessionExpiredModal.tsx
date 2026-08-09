import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function SessionExpiredModal() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function onExpired() { setVisible(true) }
    function onRestored() { setVisible(false) }
    window.addEventListener('uniflow:session-expired', onExpired as EventListener)
    window.addEventListener('uniflow:session-restored', onRestored as EventListener)
    return () => {
      window.removeEventListener('uniflow:session-expired', onExpired as EventListener)
      window.removeEventListener('uniflow:session-restored', onRestored as EventListener)
    }
  }, [])
  const navigate = useNavigate()

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
        <h3 className="text-lg font-semibold mb-2">Session expirée</h3>
        <p className="text-sm text-gray-600 mb-4">Votre session a expiré ou une reconnexion est requise. Veuillez vous reconnecter.</p>
        <div className="flex gap-2 justify-end">
          <button className="px-3 py-2 rounded border" onClick={() => { setVisible(false) }}>Fermer</button>
          <button className="px-3 py-2 rounded bg-blue-600 text-white" onClick={() => { navigate('/login') }}>Se reconnecter</button>
        </div>
      </div>
    </div>
  )
}
