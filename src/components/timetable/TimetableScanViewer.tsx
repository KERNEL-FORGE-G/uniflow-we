import React, { useState } from 'react'
import { TIMETABLE_SCANS, getScanUrl, TimetableScan, findScanForProgram } from '../../data/timetableScans'
import { UniIcon } from '../ui/UniIcon'

interface TimetableScanViewerProps {
  initialProgram?: string
  initialLevel?: string
  isOpen: boolean
  onClose: () => void
}

export const TimetableScanViewer: React.FC<TimetableScanViewerProps> = ({
  initialProgram,
  initialLevel,
  isOpen,
  onClose,
}) => {
  const initial = findScanForProgram(initialProgram, initialLevel) || TIMETABLE_SCANS[0]
  const [selectedScan, setSelectedScan] = useState<TimetableScan>(initial)
  const [zoom, setZoom] = useState<number>(1)
  const [rotation, setRotation] = useState<number>(0)
  const [useFallback, setUseFallback] = useState<boolean>(false)

  if (!isOpen) return null

  const urls = getScanUrl(selectedScan)
  const currentImgSrc = useFallback ? urls.localUrl : urls.appwriteUrl

  const isICT4D = (initialProgram || '').toUpperCase() === 'ICT4D'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-2 sm:p-4 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="flex flex-col h-[92vh] w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1E3A8A] text-white shadow-sm">
              <UniIcon name="document" size={20} weight="fill" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900">
                  Affichage Officiel — Faculté des Sciences
                </h3>
                <span className="rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-bold text-teal-800">
                  UY1 2026-2027
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Scan papier certifié par le Doyen Luc C. Owono Owono
              </p>
            </div>
          </div>

          {/* Selector & Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={`${selectedScan.program}-${selectedScan.level}`}
              onChange={(e) => {
                const [p, l] = e.target.value.split('-')
                const found = findScanForProgram(p, l)
                if (found) {
                  setSelectedScan(found)
                  setZoom(1)
                  setRotation(0)
                  setUseFallback(false)
                }
              }}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 shadow-sm focus:border-teal-500 focus:outline-none"
            >
              {TIMETABLE_SCANS.map((s) => (
                <option key={`${s.program}-${s.level}-${s.photo}`} value={`${s.program}-${s.level}`}>
                  {s.program} {s.level} — {s.label}
                </option>
              ))}
            </select>

            {/* Zoom & Rotation controls */}
            <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(0.5, z - 0.2))}
                className="rounded p-1 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                title="Zoom arrière"
              >
                <UniIcon name="chevronLeft" size={14} weight="bold" />
              </button>
              <span className="px-1 text-[11px] font-bold text-slate-600">
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(3, z + 0.2))}
                className="rounded p-1 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                title="Zoom avant"
              >
                <UniIcon name="chevronRight" size={14} weight="bold" />
              </button>
              <button
                type="button"
                onClick={() => setRotation((r) => (r + 90) % 360)}
                className="rounded p-1 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border-l border-slate-200 pl-1.5 ml-0.5"
                title="Pivoter 90°"
              >
                <UniIcon name="refresh" size={14} weight="bold" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setZoom(1)
                  setRotation(0)
                }}
                className="rounded px-1.5 py-0.5 text-[10px] font-bold text-slate-500 hover:bg-slate-100"
                title="Réinitialiser"
              >
                1:1
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-slate-200 p-2 text-slate-700 hover:bg-slate-300"
              title="Fermer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Notice for ICT4D */}
        {isICT4D && (
          <div className="bg-blue-50 border-b border-blue-200 px-4 py-2.5 text-xs text-blue-900 flex items-center justify-between">
            <span className="font-semibold">
              ℹ️ Filière ICT4D (L1, L2, L3) : emploi du temps départemental interactif actif sur votre écran.
            </span>
            <span className="text-blue-700 font-bold">
              Affichage ci-dessous : référentiel Faculté des Sciences
            </span>
          </div>
        )}

        {/* Viewport for Image */}
        <div className="relative flex-1 overflow-auto bg-slate-900/95 flex items-center justify-center p-4">
          <div
            className="transition-transform duration-200 ease-out origin-center"
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
            }}
          >
            <img
              src={currentImgSrc}
              alt={selectedScan.label}
              className="max-h-[80vh] w-auto rounded-lg shadow-2xl object-contain"
              onError={() => {
                if (!useFallback) {
                  setUseFallback(true)
                }
              }}
            />
          </div>
        </div>

        {/* Footer info */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-[#1E3A8A]">{selectedScan.label}</span>
            {selectedScan.classroom && (
              <span className="text-slate-500">· Salles : {selectedScan.classroom}</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <a
              href={currentImgSrc}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 font-bold text-teal-700 hover:text-teal-800"
            >
              Ouvrir en plein écran ↗
            </a>
            <span className="text-slate-400">|</span>
            <span className="text-[11px] text-slate-500">
              Source : Appwrite Bucket <code className="font-mono text-slate-700">uniflow_academic</code> ({selectedScan.fileId})
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
