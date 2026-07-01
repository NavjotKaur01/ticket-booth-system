import dayjs from "dayjs"
import * as XLSX from "xlsx"

import {
  CUSTOMER_REPORT_STYLES,
  escapeHtml,
  formatDesktopDate,
  safeStr,
} from "@/features/reports/customer-reports-shared"

export type SalesByDayDocumentRow = {
  showDate: string
  showTime: string
  comicName: string
  phoneIn: number
  walkup: number
  web: number
}

export type SalesByDayDocumentTotals = {
  phoneIn: number
  walkup: number
  web: number
}

type SalesByDayApiRow = {
  ShowDate?: string
  ShowTimeStr?: string
  ShowTime?: string
  ComicName?: string
  PhoneIn?: number
  Walkup?: number
  Web?: number
}

function toNum(value: unknown): number {
  const num = typeof value === "number" ? value : parseFloat(String(value ?? "0"))
  return Number.isFinite(num) ? num : 0
}

function formatShowDate(value: unknown): string {
  if (!value) return ""
  const parsed = dayjs(String(value))
  return parsed.isValid() ? parsed.format("MM/DD/YYYY") : String(value)
}

function formatShowTime(value: unknown, fallback?: unknown): string {
  const raw = value ?? fallback
  if (raw == null || raw === "") return ""
  const str = String(raw).trim()
  if (/^\d{1,2}:\d{2}\s?(AM|PM)$/i.test(str) || /^\d{1,2}:\d{2}(AM|PM)$/i.test(str)) {
    return str
  }
  const parsed = dayjs(str)
  if (!parsed.isValid()) return str
  if (parsed.year() <= 1) return ""
  return parsed.format("h:mm A")
}

export function mapSalesByDayData(rawData: unknown): {
  rows: SalesByDayDocumentRow[]
  totals: SalesByDayDocumentTotals
} {
  const apiRows = Array.isArray(rawData) ? (rawData as SalesByDayApiRow[]) : []
  const totals = { phoneIn: 0, walkup: 0, web: 0 }

  const rows = apiRows.map((row) => {
    const phoneIn = toNum(row.PhoneIn)
    const walkup = toNum(row.Walkup)
    const web = toNum(row.Web)

    totals.phoneIn += phoneIn
    totals.walkup += walkup
    totals.web += web

    return {
      showDate: formatShowDate(row.ShowDate),
      showTime: formatShowTime(row.ShowTimeStr, row.ShowTime),
      comicName: safeStr(row.ComicName),
      phoneIn,
      walkup,
      web,
    }
  })

  return { rows, totals }
}

export function buildSalesByDayDesktopHtml({
  rows,
  totals,
  startDate,
  endDate,
}: {
  rows: SalesByDayDocumentRow[]
  totals: SalesByDayDocumentTotals
  startDate: string
  endDate: string
}): string {
  const headerCells = ["Show Date", "Show Time", "Comic Name", "PhoneIn", "Walkup", "Web"]
    .map((label) => `<th>${escapeHtml(label)}</th>`)
    .join("")

  const bodyRows = rows.length
    ? rows
        .map(
          (row) => `<tr>
        <td>${escapeHtml(row.showDate)}</td>
        <td>${escapeHtml(row.showTime)}</td>
        <td>${escapeHtml(row.comicName)}</td>
        <td>${row.phoneIn}</td>
        <td>${row.walkup}</td>
        <td>${row.web}</td>
      </tr>`
        )
        .join("")
    : `<tr><td colspan="6" style="text-align:center;padding:24px;">No records found</td></tr>`

  const totalRow = rows.length
    ? `<tr class="total-row">
        <td></td>
        <td></td>
        <td><strong>Total</strong></td>
        <td>${totals.phoneIn}</td>
        <td>${totals.walkup}</td>
        <td>${totals.web}</td>
      </tr>`
    : ""

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Sales By Day Report</title>
    <style>
      ${CUSTOMER_REPORT_STYLES}
      .total-row td { font-weight: 700; }
    </style>
  </head>
  <body>
    <div class="title">Sales By Day Report</div>
    <table class="range">
      <tr>
        <td class="label">Date Range:</td>
        <td>${escapeHtml(formatDesktopDate(startDate))}</td>
        <td class="label">To:</td>
        <td>${escapeHtml(formatDesktopDate(endDate))}</td>
      </tr>
    </table>
    <table>
      <thead><tr>${headerCells}</tr></thead>
      <tbody>${bodyRows}${totalRow}</tbody>
    </table>
  </body>
</html>`
}

export function buildSalesByDayWorkbook({
  rows,
  totals,
  startDate,
  endDate,
}: {
  rows: SalesByDayDocumentRow[]
  totals: SalesByDayDocumentTotals
  startDate: string
  endDate: string
}) {
  const sheetRows: (string | number)[][] = [
    ["Sales By Day Report"],
    ["", "Date Range", formatDesktopDate(startDate), "", "To:", formatDesktopDate(endDate)],
    ["Show Date", "Show Time", "Comic Name", "PhoneIn", "Walkup", "Web"],
    ...rows.map((row) => [
      row.showDate,
      row.showTime,
      row.comicName,
      row.phoneIn,
      row.walkup,
      row.web,
    ]),
  ]

  if (rows.length) {
    sheetRows.push(["", "", "Total", totals.phoneIn, totals.walkup, totals.web])
  }

  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.aoa_to_sheet(sheetRows)
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sales By Day")
  return workbook
}

export function buildSalesByDayExcelBlob(options: {
  rows: SalesByDayDocumentRow[]
  totals: SalesByDayDocumentTotals
  startDate: string
  endDate: string
}) {
  const workbook = buildSalesByDayWorkbook(options)
  const output = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
  return new Blob([output], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  })
}
