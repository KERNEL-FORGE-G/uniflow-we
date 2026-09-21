import ExcelJS from 'exceljs'
import { EXPORT_BRAND_COLOR, EXPORT_FOOTER, formatExportDateTime, sheetNameFor, type ExportDocument } from './exportModel'

/**
 * Moteur Excel (exceljs). Chargé à la demande par `index.ts`, comme le PDF :
 * exceljs embarque un moteur zip complet qu'on ne veut pas dans le bundle initial.
 */

const BRAND_ARGB = `FF${EXPORT_BRAND_COLOR.replace('#', '').toUpperCase()}`

export async function buildExcelBlob(doc: ExportDocument): Promise<Blob> {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'UniFlow — KERNEL FORGE'
  workbook.created = doc.generatedAt
  const sheet = workbook.addWorksheet(sheetNameFor(doc.title), {
    pageSetup: { orientation: doc.orientation, fitToPage: true, fitToWidth: 1, fitToHeight: 0, paperSize: 9 },
    headerFooter: { oddFooter: `&L${EXPORT_FOOTER}&RPage &P / &N` },
  })

  const columnCount = Math.max(doc.columns.length, 2)
  sheet.columns = doc.columns.map((column) => ({ key: column.key, width: column.width ?? 14 }))

  // Bloc de titre fusionné sur toute la largeur, puis métadonnées sur deux colonnes.
  sheet.mergeCells(1, 1, 1, columnCount)
  const titleCell = sheet.getCell(1, 1)
  titleCell.value = doc.title
  titleCell.font = { bold: true, size: 16, color: { argb: BRAND_ARGB } }
  titleCell.alignment = { vertical: 'middle' }
  sheet.getRow(1).height = 28

  let rowIndex = 2
  if (doc.subtitle) {
    sheet.mergeCells(rowIndex, 1, rowIndex, columnCount)
    const cell = sheet.getCell(rowIndex, 1)
    cell.value = doc.subtitle
    cell.font = { italic: true, size: 10, color: { argb: 'FF6B7280' } }
    rowIndex += 1
  }
  for (const [label, value] of doc.meta) {
    sheet.getCell(rowIndex, 1).value = label
    sheet.getCell(rowIndex, 1).font = { bold: true, size: 10, color: { argb: 'FF374151' } }
    sheet.mergeCells(rowIndex, 2, rowIndex, columnCount)
    sheet.getCell(rowIndex, 2).value = value
    sheet.getCell(rowIndex, 2).font = { size: 10 }
    rowIndex += 1
  }
  sheet.getCell(rowIndex, 1).value = `Généré le ${formatExportDateTime(doc.generatedAt)}`
  sheet.getCell(rowIndex, 1).font = { size: 9, color: { argb: 'FF9CA3AF' } }
  rowIndex += 2

  const headerRow = sheet.getRow(rowIndex)
  doc.columns.forEach((column, index) => {
    const cell = headerRow.getCell(index + 1)
    cell.value = column.label
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BRAND_ARGB } }
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
    cell.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } }
  })
  headerRow.height = 22
  // Figer l'en-tête du tableau : une liste de 200 étudiants se parcourt sans perdre les colonnes de vue.
  sheet.views = [{ state: 'frozen', ySplit: rowIndex }]
  rowIndex += 1

  for (const row of doc.rows) {
    const excelRow = sheet.getRow(rowIndex)
    const emphasised = row._emphasis === 1
    doc.columns.forEach((column, index) => {
      const cell = excelRow.getCell(index + 1)
      const value = row[column.key]
      cell.value = value === null || value === undefined ? '' : value
      cell.alignment = { horizontal: column.align ?? 'left', vertical: 'middle' }
      cell.border = { top: { style: 'hair' }, bottom: { style: 'hair' }, left: { style: 'hair' }, right: { style: 'hair' } }
      if (emphasised) {
        cell.font = { bold: true }
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEEF2FF' } }
      }
    })
    rowIndex += 1
  }

  if (doc.summary.length) {
    rowIndex += 1
    for (const [label, value] of doc.summary) {
      sheet.getCell(rowIndex, 1).value = label
      sheet.getCell(rowIndex, 1).font = { size: 10, color: { argb: 'FF4B5563' } }
      sheet.mergeCells(rowIndex, 2, rowIndex, Math.min(columnCount, 4))
      sheet.getCell(rowIndex, 2).value = value
      sheet.getCell(rowIndex, 2).font = { bold: true, size: 10 }
      rowIndex += 1
    }
  }

  rowIndex += 1
  sheet.mergeCells(rowIndex, 1, rowIndex, columnCount)
  sheet.getCell(rowIndex, 1).value = EXPORT_FOOTER
  sheet.getCell(rowIndex, 1).font = { size: 9, italic: true, color: { argb: 'FF9CA3AF' } }

  const buffer = await workbook.xlsx.writeBuffer()
  return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
}
