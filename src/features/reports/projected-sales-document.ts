import * as XLSX from "xlsx"

import {
  CUSTOMER_REPORT_STYLES,
  escapeHtml,
  formatDesktopDate,
  safeStr,
} from "@/features/reports/customer-reports-shared"

export type ProjectedSalesDocumentRow = {
  day: string
  comicName: string
  showDate: string
  seats: string | number
  booked: string | number
  perc: string | number
  comp: string | number
  disc: string | number
  paid: string | number
  total: string
}

type ProjectedSalesApiRow = {
  Day?: string
  ComicName?: string
  ShowDate?: string
  Seats?: number
  Booked?: number
  Perc?: number
  Comp?: number
  Disc?: number
  Paid?: number
  Total?: number
}

function formatProjectedTotal(value: unknown): string {
  const num = typeof value === "number" ? value : parseFloat(String(value ?? "0"))
  if (!Number.isFinite(num)) return "$0.00"
  return `$${num.toFixed(2)}`
}

export function mapProjectedSalesRows(rawData: unknown): ProjectedSalesDocumentRow[] {
  const rows = Array.isArray(rawData) ? (rawData as ProjectedSalesApiRow[]) : []
  return rows.map((row) => ({
    day: safeStr(row.Day),
    comicName: safeStr(row.ComicName),
    showDate: formatDesktopDate(safeStr(row.ShowDate)),
    seats: row.Seats ?? "",
    booked: row.Booked ?? "",
    perc: row.Perc ?? "",
    comp: row.Comp ?? "",
    disc: row.Disc ?? "",
    paid: row.Paid ?? "",
    total: formatProjectedTotal(row.Total),
  }))
}

export function buildProjectedSalesDesktopHtml({
  rows,
  startDate,
  endDate,
}: {
  rows: ProjectedSalesDocumentRow[]
  startDate: string
  endDate: string
}): string {
  const headerCells = [
    "Day",
    "Comic Name",
    "Show Date",
    "Seats",
    "Booked",
    "Perc",
    "Comp",
    "Disc",
    "Paid",
    "Total",
  ]
    .map((label) => `<th>${escapeHtml(label)}</th>`)
    .join("")

  const bodyRows = rows.length
    ? rows
        .map(
          (row) => `<tr>
        <td>${escapeHtml(row.day)}</td>
        <td>${escapeHtml(row.comicName)}</td>
        <td>${escapeHtml(row.showDate)}</td>
        <td>${escapeHtml(String(row.seats))}</td>
        <td>${escapeHtml(String(row.booked))}</td>
        <td>${escapeHtml(String(row.perc))}</td>
        <td>${escapeHtml(String(row.comp))}</td>
        <td>${escapeHtml(String(row.disc))}</td>
        <td>${escapeHtml(String(row.paid))}</td>
        <td>${escapeHtml(row.total)}</td>
      </tr>`
        )
        .join("")
    : `<tr><td colspan="10" style="text-align:center;padding:24px;">No records found</td></tr>`

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Projected Sale Report</title>
    <style>${CUSTOMER_REPORT_STYLES}</style>
  </head>
  <body>
    <div class="title">Projected Sale Report</div>
    <table class="range">
      <tr>
        <td class="label">Date Range:</td>
        <td>${escapeHtml(formatDesktopDate(startDate))}</td>
        <td class="label">To:</td>
        <td>${escapeHtml(formatDesktopDate(endDate))}</td>
      </tr>
    </table>
    <div style="padding: 6px; margin: 10px auto; font-size: 11px; font-weight: bold;">
      This is report is not meant to be used as sales or post sales report-it is show how you stand for future reservations ONLY.
    </div>
    <table>
      <thead><tr>${headerCells}</tr></thead>
      <tbody>${bodyRows}</tbody>
    </table>
  </body>
</html>`
}

export function buildProjectedSalesWorkbook({
  rows,
  startDate,
  endDate,
}: {
  rows: ProjectedSalesDocumentRow[]
  startDate: string
  endDate: string
}) {
  const sheetRows: (string | number)[][] = [
    ["Projected Sale Report"],
    ["Date Range", formatDesktopDate(startDate), "", "", "", "", "", "", "To:", formatDesktopDate(endDate)],
    ["This is report is not meant to be used as sales or post sales report-it is show how you stand for future reservations ONLY."],
    [],
    [
      "Day",
      "Comic Name",
      "Show Date",
      "Seats",
      "Booked",
      "Perc",
      "Comp",
      "Disc",
      "Paid",
      "Total",
    ],
    ...rows.map((row) => [
      row.day,
      row.comicName,
      row.showDate,
      row.seats,
      row.booked,
      row.perc,
      row.comp,
      row.disc,
      row.paid,
      row.total,
    ]),
  ]

  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.aoa_to_sheet(sheetRows)
  XLSX.utils.book_append_sheet(workbook, worksheet, "Projected Sale Report")
  return workbook
}

export function buildProjectedSalesExcelBlob(options: {
  rows: ProjectedSalesDocumentRow[]
  startDate: string
  endDate: string
}) {
  const workbook = buildProjectedSalesWorkbook(options)
  const output = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
  return new Blob([output], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  })
}
