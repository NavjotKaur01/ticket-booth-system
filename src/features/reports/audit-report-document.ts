import dayjs from "dayjs"
import * as XLSX from "xlsx"

export type AuditReportDocumentRow = {
  comicName: string
  createDate: string
  adjustedDate: string
  type: string
  changedBy: string
  createdBy: string
}

type AuditReportApiRow = {
  ComicName?: string
  CreateDt?: string
  AdjustedDt?: string
  MovedBy?: string
  CreatedBy?: string
  IsComp?: boolean | number | string
}

const DESKTOP_STYLES = `
  body { margin: 0; padding: 25px; color: #111; font-family: "Times New Roman", Times, serif; font-size: 12px; }
  table { width: 100%; border-collapse: collapse; margin-top: 16px; }
  th, td { border: 1px solid #999; padding: 4px 6px; vertical-align: top; }
  th { font-weight: 700; text-align: left; }
`

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function safeStr(value: unknown): string {
  if (value == null || value === "") return ""
  return String(value)
}

function resolveAuditType(isComp: unknown): string {
  return isComp === true || isComp === 1 || isComp === "true" ? "Comp" : "Move Reservation"
}

/** Desktop PrintAduitReport uses long date without time. */
function formatAuditDesktopDate(value: string): string {
  const parsed = dayjs(value)
  return parsed.isValid() ? parsed.format("dddd, MMMM D, YYYY") : value
}

export function mapAuditReportRows(rawData: unknown): AuditReportDocumentRow[] {
  const rows = Array.isArray(rawData) ? (rawData as AuditReportApiRow[]) : []
  return rows.map((row) => ({
    comicName: safeStr(row.ComicName),
    createDate: formatAuditDesktopDate(safeStr(row.CreateDt)),
    adjustedDate: formatAuditDesktopDate(safeStr(row.AdjustedDt)),
    type: resolveAuditType(row.IsComp),
    changedBy: safeStr(row.MovedBy),
    createdBy: safeStr(row.CreatedBy),
  }))
}

export function buildAuditReportDesktopHtml({ rows }: { rows: AuditReportDocumentRow[] }): string {
  const headerCells = [
    "Comic Last Name",
    "Created Date",
    "Adjusted Date",
    "Type",
    "Changed By",
    "Created By",
  ]
    .map((label) => `<th>${escapeHtml(label)}</th>`)
    .join("")

  const bodyRows = rows.length
    ? rows
        .map(
          (row) => `<tr>
        <td>${escapeHtml(row.comicName)}</td>
        <td>${escapeHtml(row.createDate)}</td>
        <td>${escapeHtml(row.adjustedDate)}</td>
        <td>${escapeHtml(row.type)}</td>
        <td>${escapeHtml(row.changedBy)}</td>
        <td>${escapeHtml(row.createdBy)}</td>
      </tr>`
        )
        .join("")
    : `<tr><td colspan="6" style="text-align:center;padding:24px;">No records found</td></tr>`

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Audit Report</title>
    <style>${DESKTOP_STYLES}</style>
  </head>
  <body>
    <table>
      <thead><tr>${headerCells}</tr></thead>
      <tbody>${bodyRows}</tbody>
    </table>
  </body>
</html>`
}

export function buildAuditReportWorkbook({ rows }: { rows: AuditReportDocumentRow[] }) {
  const sheetRows: (string | number)[][] = [
    [
      "Comic Last Name",
      "Created Date",
      "Adjusted Date",
      "Type",
      "Changed By",
      "Created By",
    ],
    ...rows.map((row) => [
      row.comicName,
      row.createDate,
      row.adjustedDate,
      row.type,
      row.changedBy,
      row.createdBy,
    ]),
  ]

  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.aoa_to_sheet(sheetRows)
  XLSX.utils.book_append_sheet(workbook, worksheet, "AuditReport")
  return workbook
}

export function buildAuditReportExcelBlob(options: { rows: AuditReportDocumentRow[] }) {
  const workbook = buildAuditReportWorkbook(options)
  const output = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
  return new Blob([output], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  })
}
