import { ArrowLeft, VideoOff, WifiOff } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useUserRole } from '../utils/userRole'

export default function VideoConfPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { isOfflineMode } = useUserRole()
  const roomTitle = searchParams.get('title')

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          {isOfflineMode ? <WifiOff className="h-7 w-7" /> : <VideoOff className="h-7 w-7" />}
        </div>
        <h1 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">Visioconférence indisponible</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
          {roomTitle ? `La salle « ${roomTitle} » ne peut pas être ouverte pour le moment.` : 'Aucune salle de visioconférence active n’est disponible.'}
          {' '}UniFlow ne dispose pas actuellement d’un endpoint backend réel pour les salles, les participants et les échanges vidéo.
        </p>
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          Aucun participant, message, sondage ou contenu de démonstration n’est affiché sans données serveur vérifiables.
        </p>
        <button
          type="button"
          onClick={() => navigate('/app')}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#1e3a8a] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#163276]"
        >
          <ArrowLeft className="h-4 w-4" /> Retour au tableau de bord
        </button>
      </div>
    </div>
  )
}
