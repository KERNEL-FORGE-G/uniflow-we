import { datedFileName, type ExportDocument } from './exportModel'
import type { PdfBrandAssets } from './exportPdf'

export * from './exportModel'

export type ExportFormat = 'pdf' | 'xlsx'

const LOGO_URL = '/logos/uniflow-wordmark.png'
let logoPromise: Promise<PdfBrandAssets> | null = null

/** Largeur d'incorporation : le logo fait 4 cm de large dans le PDF, 480 px suffisent même à l'impression. */
const LOGO_EMBED_WIDTH = 480

/**
 * Le logo est lu une fois puis mis en cache pour la session. En cas d'échec
 * (hors ligne sans cache, 404), on rend un en-tête texte plutôt que d'échouer :
 * un PDF sans logo vaut mieux qu'aucun PDF.
 */
export function loadBrandAssets(): Promise<PdfBrandAssets> {
  if (!logoPromise) {
    logoPromise = (async () => {
      try {
        const response = await fetch(LOGO_URL)
        if (!response.ok) return {}
        const blob = await response.blob()
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(String(reader.result))
          reader.onerror = () => reject(reader.error)
          reader.readAsDataURL(blob)
        })
        const image = await new Promise<HTMLImageElement | null>((resolve) => {
          const element = new Image()
          element.onload = () => resolve(element)
          element.onerror = () => resolve(null)
          element.src = dataUrl
        })
        if (!image || !image.naturalHeight) return { logoDataUrl: dataUrl }
        const ratio = image.naturalWidth / image.naturalHeight
        // Le PNG source (1200 px, ~190 Ko) était incorporé tel quel et faisait
        // peser 200 Ko chaque PDF ; on le réduit avant incorporation.
        const canvas = document.createElement('canvas')
        canvas.width = Math.min(LOGO_EMBED_WIDTH, image.naturalWidth)
        canvas.height = Math.round(canvas.width / ratio)
        const context = canvas.getContext('2d')
        if (!context) return { logoDataUrl: dataUrl, logoAspectRatio: ratio }
        context.drawImage(image, 0, 0, canvas.width, canvas.height)
        return { logoDataUrl: canvas.toDataURL('image/png'), logoAspectRatio: ratio }
      } catch {
        return {}
      }
    })()
  }
  return logoPromise
}

export function triggerDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  anchor.rel = 'noopener'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  // Révocation différée : Safari annule le téléchargement si l'URL disparaît dans le même tick.
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}

export async function buildExportBlob(doc: ExportDocument, format: ExportFormat): Promise<Blob> {
  if (format === 'pdf') {
    const [{ buildPdfBlob }, assets] = await Promise.all([import('./exportPdf'), loadBrandAssets()])
    return buildPdfBlob(doc, assets)
  }
  const { buildExcelBlob } = await import('./exportExcel')
  return buildExcelBlob(doc)
}

/** Construit puis télécharge le document ; renvoie le nom de fichier produit. */
export async function downloadExport(doc: ExportDocument, format: ExportFormat): Promise<string> {
  const blob = await buildExportBlob(doc, format)
  const fileName = datedFileName(doc.fileStem, format, doc.generatedAt)
  triggerDownload(blob, fileName)
  return fileName
}
