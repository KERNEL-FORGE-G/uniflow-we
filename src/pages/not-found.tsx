import { Link } from 'react-router-dom'
import { AlertCircle, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f3f4f6]">
      <div className="w-full max-w-md mx-4 rounded-2xl border border-[#e5e7eb] bg-white p-8 shadow-lg text-center">
        <div className="flex justify-center mb-4">
          <AlertCircle className="h-16 w-16 text-red-400" />
        </div>
        <h1 className="text-4xl font-black text-[#111827] mb-2">404</h1>
        <p className="text-lg font-semibold text-[#374151] mb-2">Page introuvable</p>
        <p className="text-sm text-[#6b7280] mb-6">
          La page que vous cherchez n'existe pas ou a été déplacée.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-xl bg-[#1e3a8a] px-6 py-3 text-sm font-bold text-white hover:bg-[#2d4fa8] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à l'accueil
        </Link>
      </div>
    </div>
  )
}
