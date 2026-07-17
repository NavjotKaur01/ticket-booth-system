import dayjs from "dayjs"
import { XLSX } from "@/lib/xlsx-write"

import {
  CUSTOMER_REPORT_STYLES,
  escapeHtml,
  formatDesktopDate,
  safeStr,
} from "@/features/reports/customer-reports-shared"

export type RevenueDocumentRow = {
  day: string
  time: string
  performer: string
  ticketPurchased: string
  prepaidRedeemed: string
  totalEarned: string
}

export type RevenueDocumentTotals = {
  ticketPurchased: number
  prepaidRedeemed: number
  totalEarned: number
}

type RevenueApiRow = {
  Day?: string
  Time?: string
  Performer?: string
  TicketPurchased?: number
  PerpaidRedeemed?: number
  PrepaidRedeemed?: number
  TotalEarned?: number
}

function toNum(value: unknown): number {
  const num = typeof value === "number" ? value : parseFloat(String(value ?? "0"))
  return Number.isFinite(num) ? num : 0
}

function formatMoney(value: number): string {
  return `$${value.toFixed(2)}`
}

function formatRevenueDay(value: unknown): string {
  if (!value) return ""
  const parsed = dayjs(String(value))
  return parsed.isValid() ? parsed.format("MM/DD/YYYY") : String(value)
}

function formatRevenueTime(value: unknown): string {
  if (!value) return ""
  const parsed = dayjs(String(value))
  return parsed.isValid() ? parsed.format("h:mm A") : String(value)
}

export function mapRevenueData(rawData: unknown): {
  rows: RevenueDocumentRow[]
  totals: RevenueDocumentTotals
} {
  const apiRows = Array.isArray(rawData) ? (rawData as RevenueApiRow[]) : []
  const totals = { ticketPurchased: 0, prepaidRedeemed: 0, totalEarned: 0 }

  const rows = apiRows.map((row) => {
    const ticketPurchased = toNum(row.TicketPurchased)
    const prepaidRedeemed = toNum(row.PerpaidRedeemed ?? row.PrepaidRedeemed)
    const totalEarned = toNum(row.TotalEarned)

    totals.ticketPurchased += ticketPurchased
    totals.prepaidRedeemed += prepaidRedeemed
    totals.totalEarned += totalEarned

    return {
      day: formatRevenueDay(row.Day),
      time: formatRevenueTime(row.Time),
      performer: safeStr(row.Performer),
      ticketPurchased: formatMoney(ticketPurchased),
      prepaidRedeemed: formatMoney(prepaidRedeemed),
      totalEarned: formatMoney(totalEarned),
    }
  })

  return { rows, totals }
}

export function buildRevenueDesktopHtml({
  rows,
  totals,
  startDate,
  endDate,
}: {
  rows: RevenueDocumentRow[]
  totals: RevenueDocumentTotals
  startDate: string
  endDate: string
}): string {
  const headerCells = ["Day", "Time", "Perfromer", "Ticket Purchased", "Prepaid Redeemed", "Total Earned"]
    .map((label) => `<th>${escapeHtml(label)}</th>`)
    .join("")

  const bodyRows = rows.length
    ? rows
        .map(
          (row) => `<tr>
        <td>${escapeHtml(row.day)}</td>
        <td>${escapeHtml(row.time)}</td>
        <td>${escapeHtml(row.performer)}</td>
        <td>${escapeHtml(row.ticketPurchased)}</td>
        <td>${escapeHtml(row.prepaidRedeemed)}</td>
        <td>${escapeHtml(row.totalEarned)}</td>
      </tr>`
        )
        .join("")
    : `<tr><td colspan="6" style="text-align:center;padding:24px;">No records found</td></tr>`

  const totalRow = rows.length
    ? `<tr class="total-row">
        <td></td>
        <td></td>
        <td><strong>Total</strong></td>
        <td>${escapeHtml(formatMoney(totals.ticketPurchased))}</td>
        <td>${escapeHtml(formatMoney(totals.prepaidRedeemed))}</td>
        <td>${escapeHtml(formatMoney(totals.totalEarned))}</td>
      </tr>`
    : ""

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Revenue Report</title>
    <style>
      ${CUSTOMER_REPORT_STYLES}
      .total-row td { font-weight: 700; }
    </style>
  </head>
  <body>
    <div class="title">Revenue Report</div>
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

export function buildRevenueWorkbook({
  rows,
  totals,
  startDate,
  endDate,
}: {
  rows: RevenueDocumentRow[]
  totals: RevenueDocumentTotals
  startDate: string
  endDate: string
}) {
  const sheetRows: (string | number)[][] = [
    ["Revenue Report"],
    ["", "Date Range", formatDesktopDate(startDate), "", "To:", formatDesktopDate(endDate)],
    ["Day", "Time", "Perfromer", "Ticket Purchased", "Prepaid Redeemed", "Total Earned"],
    ...rows.map((row) => [
      row.day,
      row.time,
      row.performer,
      row.ticketPurchased,
      row.prepaidRedeemed,
      row.totalEarned,
    ]),
  ]

  if (rows.length) {
    sheetRows.push([
      "",
      "",
      "Total",
      formatMoney(totals.ticketPurchased),
      formatMoney(totals.prepaidRedeemed),
      formatMoney(totals.totalEarned),
    ])
  }

  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.aoa_to_sheet(sheetRows)
  XLSX.utils.book_append_sheet(workbook, worksheet, "Revenue Report")
  return workbook
}

export function buildRevenueExcelBlob(options: {
  rows: RevenueDocumentRow[]
  totals: RevenueDocumentTotals
  startDate: string
  endDate: string
}) {
  const workbook = buildRevenueWorkbook(options)
  const output = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
  return new Blob([output], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  })
}
