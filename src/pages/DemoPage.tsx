import { Link } from 'react-router-dom'
import { ArrowLeft, VideoOff, Info } from 'lucide-react'

export default function DemoPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold text-[#1e3a8a]">
              <VideoOff className="h-5 w-5" /> Présentation UniFlow
            </p>
            <h1 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">Démonstration indisponible</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              Aucun fichier vidéo de démonstration n’est servi sans source vérifiable. Les parcours disponibles sont ceux exposés par le backend universitaire réel.
            </p>
          </div>
          <Link to="/app/aide" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-800 transition-colors hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
            <ArrowLeft className="h-4 w-4" /> Retour à la FAQ
          </Link>
        </div>

        <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center dark:border-slate-700 dark:bg-slate-950">
          <Info className="mx-auto h-10 w-10 text-slate-400" />
          <h2 className="mt-4 text-base font-bold text-slate-800 dark:text-slate-200">Aucun média de présentation configuré</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500 dark:text-slate-400">
            Cette page n’affiche ni contenu inventé ni vidéo locale de démonstration. Une URL média devra être fournie par un service officiel avant d’être rendue accessible ici.
          </p>
        </div>
      </div>
    </div>
  )
}
