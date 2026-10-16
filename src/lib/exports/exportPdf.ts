import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { EXPORT_BRAND_COLOR, EXPORT_FOOTER, formatExportDateTime, type ExportDocument } from './exportModel'

/**
 * Moteur PDF (jsPDF + autoTable). Chargé à la demande par `index.ts` : le
 * bundle jsPDF pèse ~400 ko et n'a rien à faire dans le chargement initial.
 */

const PAGE_MARGIN = 14
const HEADER_HEIGHT = 30
const FOOTER_HEIGHT = 12
const TOTAL_PAGES_ALIAS = '{total_pages}'

function hexToRgb(hex: string): [number, number, number] {
  const value = hex.replace('#', '')
  return [parseInt(value.slice(0, 2), 16), parseInt(value.slice(2, 4), 16), parseInt(value.slice(4, 6), 16)]
}

export interface PdfBrandAssets {
  /** Logo en data URL PNG ; absent quand le fichier n'est pas accessible (hors ligne sans cache). */
  logoDataUrl?: string
  logoAspectRatio?: number
}

function drawHeader(pdf: jsPDF, doc: ExportDocument, assets: PdfBrandAssets, pageWidth: number) {
  const brand = hexToRgb(EXPORT_BRAND_COLOR)
  const logoHeight = 9
  if (assets.logoDataUrl) {
    const ratio = assets.logoAspectRatio && assets.logoAspectRatio > 0 ? assets.logoAspectRatio : 4
    pdf.addImage(assets.logoDataUrl, 'PNG', PAGE_MARGIN, PAGE_MARGIN - 2, logoHeight * ratio, logoHeight)
  } else {
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(16)
    pdf.setTextColor(...brand)
    pdf.text('UniFlow', PAGE_MARGIN, PAGE_MARGIN + 5)
  }
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(8)
  pdf.setTextColor(120, 120, 120)
  pdf.text(formatExportDateTime(doc.generatedAt), pageWidth - PAGE_MARGIN, PAGE_MARGIN + 2, { align: 'right' })
  pdf.setDrawColor(...brand)
  pdf.setLineWidth(0.6)
  pdf.line(PAGE_MARGIN, PAGE_MARGIN + 10, pageWidth - PAGE_MARGIN, PAGE_MARGIN + 10)
}

function drawFooter(pdf: jsPDF, pageWidth: number, pageHeight: number, pageNumber: number) {
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(8)
  pdf.setTextColor(120, 120, 120)
  pdf.setDrawColor(220, 220, 220)
  pdf.setLineWidth(0.3)
  pdf.line(PAGE_MARGIN, pageHeight - FOOTER_HEIGHT, pageWidth - PAGE_MARGIN, pageHeight - FOOTER_HEIGHT)
  pdf.text(EXPORT_FOOTER, PAGE_MARGIN, pageHeight - FOOTER_HEIGHT + 5)
  pdf.text(`Page ${pageNumber} / ${TOTAL_PAGES_ALIAS}`, pageWidth - PAGE_MARGIN, pageHeight - FOOTER_HEIGHT + 5, { align: 'right' })
}

/** Titre, sous-titre et métadonnées sur la première page ; renvoie l'ordonnée où le tableau peut commencer. */
function drawTitleBlock(pdf: jsPDF, doc: ExportDocument, pageWidth: number): number {
  let y = PAGE_MARGIN + HEADER_HEIGHT - 10
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(15)
  pdf.setTextColor(17, 24, 39)
  const titleLines = pdf.splitTextToSize(doc.title, pageWidth - PAGE_MARGIN * 2) as string[]
  pdf.text(titleLines, PAGE_MARGIN, y)
  y += titleLines.length * 6.5
  if (doc.subtitle) {
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(10)
    pdf.setTextColor(107, 114, 128)
    pdf.text(doc.subtitle, PAGE_MARGIN, y)
    y += 6
  }
  if (doc.meta.length) {
    y += 1
    pdf.setFontSize(9)
    for (const [label, value] of doc.meta) {
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(55, 65, 81)
      pdf.text(`${label} :`, PAGE_MARGIN, y)
      const labelWidth = pdf.getTextWidth(`${label} : `)
      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(17, 24, 39)
      pdf.text(value, PAGE_MARGIN + labelWidth, y)
      y += 5
    }
  }
  return y + 3
}

export function buildPdfBlob(doc: ExportDocument, assets: PdfBrandAssets = {}): Blob {
  const pdf = new jsPDF({ orientation: doc.orientation, unit: 'mm', format: 'a4', compress: true })
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const brand = hexToRgb(EXPORT_BRAND_COLOR)

  const startY = drawTitleBlock(pdf, doc, pageWidth)
  const totalWeight = doc.columns.reduce((sum, column) => sum + (column.width ?? 12), 0)
  const usableWidth = pageWidth - PAGE_MARGIN * 2
  const columnStyles: Record<number, { cellWidth: number; halign: 'left' | 'center' | 'right' }> = {}
  doc.columns.forEach((column, index) => {
    columnStyles[index] = { cellWidth: ((column.width ?? 12) / totalWeight) * usableWidth, halign: column.align ?? 'left' }
  })

  autoTable(pdf, {
    startY,
    margin: { left: PAGE_MARGIN, right: PAGE_MARGIN, top: PAGE_MARGIN + 14, bottom: FOOTER_HEIGHT + 4 },
    head: [doc.columns.map((column) => column.label)],
    body: doc.rows.map((row) => doc.columns.map((column) => {
      const cell = row[column.key]
      return cell === null || cell === undefined ? '' : String(cell)
    })),
    theme: 'grid',
    styles: { font: 'helvetica', fontSize: 8.5, cellPadding: 2, textColor: [31, 41, 55], lineColor: [229, 231, 235], lineWidth: 0.2, overflow: 'linebreak' },
    headStyles: { fillColor: brand, textColor: 255, fontStyle: 'bold', halign: 'center' },
    alternateRowStyles: { fillColor: [249, 250, 251] },
    columnStyles,
    didParseCell: (data) => {
      // Les lignes de synthèse (moyenne de matière) sont marquées `_emphasis` par le modèle.
      if (data.section === 'body' && doc.rows[data.row.index]?._emphasis === 1) {
        data.cell.styles.fontStyle = 'bold'
        data.cell.styles.fillColor = [238, 242, 255]
      }
    },
    didDrawPage: (data) => {
      drawHeader(pdf, doc, assets, pageWidth)
      drawFooter(pdf, pageWidth, pageHeight, data.pageNumber)
    },
  })

  if (doc.summary.length) {
    const lastTable = (pdf as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable
    let y = (lastTable?.finalY ?? startY) + 8
    if (y + doc.summary.length * 6 > pageHeight - FOOTER_HEIGHT - 6) {
      pdf.addPage()
      drawHeader(pdf, doc, assets, pageWidth)
      drawFooter(pdf, pageWidth, pageHeight, pdf.getNumberOfPages())
      y = PAGE_MARGIN + 18
    }
    pdf.setFontSize(9.5)
    for (const [label, value] of doc.summary) {
      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(75, 85, 99)
      pdf.text(`${label}`, PAGE_MARGIN, y)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(17, 24, 39)
      pdf.text(value, PAGE_MARGIN + 60, y)
      y += 6
    }
  }

  // Remplace l'alias par le nombre réel de pages, connu seulement une fois tout dessiné.
  pdf.putTotalPages(TOTAL_PAGES_ALIAS)
  return pdf.output('blob')
}
