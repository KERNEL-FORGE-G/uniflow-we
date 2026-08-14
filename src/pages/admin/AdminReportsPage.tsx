import { BarChart3, FileWarning } from 'lucide-react'

export default function AdminReportsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Rapports & Analyses</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Les indicateurs administratifs seront affichés uniquement après leur chargement depuis le backend.</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <FileWarning className="mx-auto h-10 w-10 text-slate-400" />
        <h2 className="mt-4 text-base font-bold text-slate-800 dark:text-slate-200">Rapports indisponibles</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">
          Le backend universitaire ne fournit pas encore d’endpoint pour les rapports agrégés, les séries historiques, les KPI par département ou l’export PDF. Aucun chiffre fictif n’est affiché.
        </p>
      </div>
    </div>
  )
}
