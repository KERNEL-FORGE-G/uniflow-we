import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Video, ArrowLeft, Info, Play } from 'lucide-react'

export default function DemoPage() {
  const [videoError, setVideoError] = useState(false)

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="rounded-3xl border border-[#e5e7eb] bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#1e3a8a] flex items-center gap-2">
              <Video className="h-5 w-5" /> Démo du projet
            </p>
            <h1 className="mt-2 text-3xl font-black text-[#111827]">Regardez la démo UniFlow</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6b7280]">
              Cette page contient la présentation vidéo du projet. Elle est disponible pour tous les utilisateurs et accessible depuis votre centre d'aide / FAQ.
            </p>
          </div>
          <Link to="/app/aide" className="inline-flex items-center gap-2 rounded-full border border-[#e5e7eb] bg-[#f9fafb] px-4 py-2 text-sm font-semibold text-[#111827] hover:bg-[#eef2ff] transition-colors">
            <ArrowLeft className="h-4 w-4" /> Retour à la FAQ
          </Link>
        </div>

        <div className="mt-8 space-y-4">
          <div className="rounded-3xl overflow-hidden border border-[#e5e7eb] bg-[#111827] aspect-video relative flex items-center justify-center">
            {!videoError ? (
              <video
                controls
                preload="metadata"
                playsInline
                onError={() => setVideoError(true)}
                className="w-full h-full object-contain bg-black"
                src="/video/demo.mp4"
                poster="https://i.imgur.com/GAiZ7WY.png"
              >
                Votre navigateur ne supporte pas la lecture vidéo.
              </video>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center text-white space-y-3">
                <div className="h-16 w-16 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
                  <Play className="h-8 w-8 text-blue-400" />
                </div>
                <h3 className="text-lg font-bold">Vidéo de Démo UniFlow</h3>
                <p className="text-xs text-gray-400 max-w-md">
                  Présentation des fonctionnalités clés : gestion pédagogique, visioconférence HD, QR/NFC et mode offline.
                </p>
                <a
                  href="/video/demo.mp4"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#1e3a8a] px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition-all"
                >
                  Télécharger ou lire directement
                </a>
              </div>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-[#e5e7eb] bg-[#f9fafb] p-5">
              <p className="text-sm font-semibold text-[#111827]">À propos de cette démo</p>
              <p className="mt-2 text-sm text-[#6b7280] leading-6">
                Découvrez les principales fonctionnalités du projet : tableau de bord, gestion de cours, visioconférence,
                supports pédagogiques, et workflow offline-first.
              </p>
            </div>
            <div className="rounded-2xl border border-[#e5e7eb] bg-[#f9fafb] p-5">
              <p className="text-sm font-semibold text-[#111827]">Conseils</p>
              <ul className="mt-2 space-y-2 text-sm text-[#6b7280]">
                <li className="flex items-start gap-2"><Info className="mt-0.5 h-4 w-4 text-[#1e3a8a]" /> Utilisez le lecteur pour mettre en pause et voir les sections importantes.</li>
                <li className="flex items-start gap-2"><Info className="mt-0.5 h-4 w-4 text-[#1e3a8a]" /> La vidéo est servie depuis le dossier public `/video/demo.mp4`.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

