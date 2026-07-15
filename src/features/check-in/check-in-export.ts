import {
  buildExportMatrix,
  convertToHtmlTable,
  exportTableData,
  type ExportColumn,
  type ExportFormat,
} from "@/lib/export-table-data"
import type { CheckInRecord } from "@/types/check-in"
import * as XLSX from "xlsx-js-style"

/**
 * Desktop ExportColumns.getCheckInExportColumns() / Check-in grid fields.
 * Used by header Export + Print list.
 */
const CHECK_IN_EXPORT_COLUMNS: ExportColumn<CheckInRecord>[] = [
  { header: "Last Name", value: (row) => row.lastName },
  { header: "First Name", value: (row) => row.firstName },
  { header: "Section", value: (row) => row.section },
  { header: "Email", value: (row) => row.email },
  {
    header: "Source",
    value: (row) =>
      row.source === "Phone"
        ? "Phone-In"
        : row.source === "Web"
          ? "WEB"
          : "Walkup",
  },
  { header: "Table(s)", value: (row) => row.tables },
  { header: "Notes", value: (row) => row.notes },
  { header: "Promo", value: (row) => row.promo },
  { header: "Din", value: (row) => row.din },
  { header: "Qty", value: (row) => row.qty },
  { header: "SeatNo", value: (row) => row.seatNo },
  { header: "Seated", value: (row) => row.seated },
  { header: "Scanner", value: (row) => row.scanner },
  { header: "Phone", value: (row) => row.phoneNo },
  { header: "Total", value: (row) => formatMoney(row.total) },
  { header: "Paid", value: (row) => formatMoney(row.paid) },
  { header: "Created By", value: (row) => row.createdBy },
  { header: "Create Dt", value: (row) => row.createdDt },
  { header: "LastUpdateDt", value: (row) => row.lastUpdateDt },
  { header: "LastUpdateBy", value: (row) => row.lastUpdateBy },
]

function formatMoney(value: string) {
  const numeric = Number(value.replace(/[$,]/g, ""))
  if (Number.isNaN(numeric)) {
    return value.replace(/\$/g, "")
  }
  return numeric.toFixed(2)
}

async function downloadCheckInWorkbook(
  headers: string[],
  rows: string[][],
  filename: string
) {
  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows])
  const range = XLSX.utils.decode_range(worksheet["!ref"] ?? "A1")
  const headerStyle = {
    fill: { patternType: "solid", fgColor: { rgb: "5B9BD5" } },
    font: { bold: true, color: { rgb: "FFFFFF" } },
    alignment: { horizontal: "center", vertical: "center" },
    border: {
      top: { style: "thin", color: { rgb: "9EADCC" } },
      right: { style: "thin", color: { rgb: "9EADCC" } },
      bottom: { style: "thin", color: { rgb: "9EADCC" } },
      left: { style: "thin", color: { rgb: "9EADCC" } },
    },
  }
  const bodyStyle = {
    border: {
      top: { style: "thin", color: { rgb: "B7C9D6" } },
      right: { style: "thin", color: { rgb: "B7C9D6" } },
      bottom: { style: "thin", color: { rgb: "B7C9D6" } },
      left: { style: "thin", color: { rgb: "B7C9D6" } },
    },
  }
  const bandedBodyStyle = {
    ...bodyStyle,
    fill: { patternType: "solid", fgColor: { rgb: "DDEBF7" } },
  }

  worksheet["!cols"] = headers.map((header) => ({
    wch: Math.max(10, Math.min(22, header.length + 4)),
  }))
  worksheet["!autofilter"] = { ref: XLSX.utils.encode_range(range) }

  for (let rowIndex = range.s.r; rowIndex <= range.e.r; rowIndex += 1) {
    for (let columnIndex = range.s.c; columnIndex <= range.e.c; columnIndex += 1) {
      const cellRef = XLSX.utils.encode_cell({ r: rowIndex, c: columnIndex })
      const cell = worksheet[cellRef]
      if (!cell) {
        continue
      }

      cell.s =
        rowIndex === 0
          ? headerStyle
          : rowIndex % 2 === 0
            ? bandedBodyStyle
            : bodyStyle
    }
  }

  XLSX.utils.book_append_sheet(workbook, worksheet, "Check-In")
  const output = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
  const blob = new Blob([output], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `${filename}.xlsx`
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 100)
}

/** Desktop cmdExportReservation — ExportData formats for the Check-in grid. */
export async function exportCheckInRecords(
  records: CheckInRecord[],
  format: ExportFormat,
  {
    filename = "check-in",
  }: {
    filename?: string
  } = {}
) {
  if (records.length === 0) {
    return false
  }

  const { headers, rows } = buildExportMatrix(records, CHECK_IN_EXPORT_COLUMNS)

  if (format === "excel") {
    await downloadCheckInWorkbook(headers, rows, filename)
    return true
  }

  return exportTableData(headers, rows, format, filename)
}

/**
 * Desktop cmdPrintCheckInReservation — PrintExport.ConvertDatatableToHtml
 * via DocumentViewer (in-app print dialog, not a browser tab).
 * Web: hidden iframe + print dialog (same pattern as ticket print).
 */
export function printCheckInList(records: CheckInRecord[]) {
  if (records.length === 0) {
    return false
  }

  const { headers, rows } = buildExportMatrix(records, CHECK_IN_EXPORT_COLUMNS)
  const html = convertToHtmlTable(headers, rows)

  const frame = document.createElement("iframe")
  frame.setAttribute("aria-hidden", "true")
  frame.style.cssText =
    "position:fixed;right:0;bottom:0;width:0;height:0;border:0;opacity:0;pointer-events:none"

  document.body.appendChild(frame)

  const frameWindow = frame.contentWindow
  const frameDocument = frame.contentDocument

  if (!frameWindow || !frameDocument) {
    frame.remove()
    return false
  }

  let cleanedUp = false
  const cleanup = () => {
    if (cleanedUp) {
      return
    }
    cleanedUp = true
    frameWindow.onafterprint = null
    window.setTimeout(() => frame.remove(), 0)
  }

  frameWindow.onafterprint = cleanup
  frameDocument.open()
  frameDocument.write(html)
  frameDocument.close()

  window.setTimeout(() => {
    try {
      frameWindow.focus()
      frameWindow.print()
    } catch {
      cleanup()
    }
  }, 250)

  // Fallback cleanup if afterprint never fires (some browsers).
  window.setTimeout(cleanup, 60_000)

  return true
}
