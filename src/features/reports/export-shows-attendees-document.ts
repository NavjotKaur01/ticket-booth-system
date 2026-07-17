import dayjs from "dayjs"
import { XLSX } from "@/lib/xlsx-write"

export type ShowsAttendeesDocumentRow = {
  showDateTime: string
  comicName: string
  lastName: string
  firstName: string
  email: string
  phone: string
  source: string
}

type ShowsAttendeesApiRow = {
  ShowDateTime?: string
  ComicName?: string
  LastName?: string
  FirstName?: string
  Email?: string
  Phone?: string
  ReservationSource?: string
}

const DESKTOP_STYLES = `
  body { margin: 0; padding: 25px; color: #111; font-family: "Times New Roman", Times, serif; font-size: 12px; }
  table { width: 100%; border-collapse: collapse; margin-top: 16px; }
  th, td { border: 1px solid #999; padding: 4px 6px; vertical-align: top; }
  th { font-weight: 700; text-align: left; background: #f3f3f3; }
  .title { font-size: 16px; font-weight: 700; text-align: center; padding: 8px 0 12px; }
  .range td { border: none; padding: 2px 6px 10px 0; }
  .range .label { font-weight: 700; }
  .count { margin-top: 12px; font-weight: 700; }
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

function formatDesktopDate(value: string) {
  const parsed = dayjs(value)
  return parsed.isValid() ? parsed.format("MM/DD/YYYY") : value
}

function formatShowDateTime(value: string) {
  const parsed = dayjs(value)
  return parsed.isValid() ? parsed.format("M/D/YYYY h:mm:ss A") : value
}

export function mapShowsAttendeesRows(rawData: unknown): ShowsAttendeesDocumentRow[] {
  const rows = Array.isArray(rawData) ? (rawData as ShowsAttendeesApiRow[]) : []
  return rows.map((row) => ({
    showDateTime: formatShowDateTime(safeStr(row.ShowDateTime)),
    comicName: safeStr(row.ComicName),
    lastName: safeStr(row.LastName),
    firstName: safeStr(row.FirstName),
    email: safeStr(row.Email),
    phone: safeStr(row.Phone),
    source: safeStr(row.ReservationSource),
  }))
}

export function buildShowsAttendeesDesktopHtml({
  rows,
  startDate,
  endDate,
}: {
  rows: ShowsAttendeesDocumentRow[]
  startDate: string
  endDate: string
}): string {
  const headerCells = [
    "Show Date Time",
    "Comic Name",
    "Customer Last Name",
    "Customer First Name",
    "Email Address",
    "Phone",
    "Source",
  ]
    .map((label) => `<th>${escapeHtml(label)}</th>`)
    .join("")

  const bodyRows = rows.length
    ? rows
        .map(
          (row) => `<tr>
        <td>${escapeHtml(row.showDateTime)}</td>
        <td>${escapeHtml(row.comicName)}</td>
        <td>${escapeHtml(row.lastName)}</td>
        <td>${escapeHtml(row.firstName)}</td>
        <td>${escapeHtml(row.email)}</td>
        <td>${escapeHtml(row.phone)}</td>
        <td>${escapeHtml(row.source)}</td>
      </tr>`
        )
        .join("")
    : `<tr><td colspan="7" style="text-align:center;padding:24px;">No records found</td></tr>`

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Shows Attendees Report</title>
    <style>${DESKTOP_STYLES}</style>
  </head>
  <body>
    <div class="title">Shows Attendees Report</div>
    <table class="range">
      <tr>
        <td class="label">Date Range:</td>
        <td>${escapeHtml(formatDesktopDate(startDate))}</td>
        <td class="label">To:</td>
        <td>${escapeHtml(formatDesktopDate(endDate))}</td>
      </tr>
    </table>
    <div class="count">Total Count: ${rows.length}</div>
    <table>
      <thead><tr>${headerCells}</tr></thead>
      <tbody>${bodyRows}</tbody>
    </table>
  </body>
</html>`
}

export function buildShowsAttendeesWorkbook({
  rows,
  startDate,
  endDate,
}: {
  rows: ShowsAttendeesDocumentRow[]
  startDate: string
  endDate: string
}) {
  const sheetRows: (string | number)[][] = [
    ["Shows Attendees Report"],
    ["Date Range:", formatDesktopDate(startDate), "", "", "To:", formatDesktopDate(endDate)],
    ["Total Count:", rows.length],
    [],
    [
      "Show Date Time",
      "Comic Name",
      "Customer Last Name",
      "Customer First Name",
      "Email Address",
      "Phone",
      "Source",
    ],
    ...rows.map((row) => [
      row.showDateTime,
      row.comicName,
      row.lastName,
      row.firstName,
      row.email,
      row.phone,
      row.source,
    ]),
  ]

  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.aoa_to_sheet(sheetRows)
  XLSX.utils.book_append_sheet(workbook, worksheet, "Shows Attendees Report")
  return workbook
}

export function buildShowsAttendeesExcelBlob(options: {
  rows: ShowsAttendeesDocumentRow[]
  startDate: string
  endDate: string
}) {
  const workbook = buildShowsAttendeesWorkbook(options)
  const output = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
  return new Blob([output], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  })
}
