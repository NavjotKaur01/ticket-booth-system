import dayjs from "dayjs"
import * as XLSX from "xlsx"

import {
  CUSTOMER_REPORT_STYLES,
  escapeHtml,
  formatDesktopDate,
  safeStr,
} from "@/features/reports/customer-reports-shared"

export type ComicTicketRevenueShowRow = {
  comicName: string
  showDate: string
  showTime: string
  paid: number
  discounted: number
  comped: number
  revenue: number
}

export type ComicTicketRevenueDocument = {
  comicName: string
  shows: ComicTicketRevenueShowRow[]
  grandTotal: {
    paid: number
    discounted: number
    comped: number
    revenue: number
  }
}

type ComicTicketRevenueApiRow = {
  ShowId?: string
  CreateDate?: string
  ShowDate?: string
  ShowTime?: string
  ComicName?: string
  Paid?: number
  Discounted?: number
  Comped?: number
  TotalTickets?: number
  Revenue?: number
}

function n(value: unknown): number {
  const num = typeof value === "number" ? value : parseFloat(String(value ?? "0"))
  return Number.isFinite(num) ? num : 0
}

function formatShowTime(value: unknown): string {
  if (value == null || value === "") return ""
  const parsed = dayjs(String(value))
  return parsed.isValid() ? parsed.format("h:mm A") : safeStr(value)
}

function formatMoney(value: number): string {
  return `$${value.toFixed(2)}`
}

/** Mirrors WPF ReportVM.GetComicTicketRevenuReport grouping by ShowId. */
export function buildComicTicketRevenueDocument(rawData: unknown): ComicTicketRevenueDocument | null {
  const apiRows = Array.isArray(rawData) ? (rawData as ComicTicketRevenueApiRow[]) : []
  if (!apiRows.length) return null

  const shows: ComicTicketRevenueShowRow[] = []
  let currentShowId = ""

  for (const row of apiRows) {
    const showId = safeStr(row.ShowId)
    if (currentShowId !== showId) {
      currentShowId = showId
      shows.push({
        comicName: safeStr(row.ComicName),
        showDate: formatDesktopDate(safeStr(row.ShowDate)),
        showTime: formatShowTime(row.ShowTime),
        paid: n(row.Paid),
        discounted: n(row.Discounted),
        comped: n(row.Comped),
        revenue: n(row.Revenue),
      })
      continue
    }

    const current = shows[shows.length - 1]
    current.paid += n(row.Paid)
    current.discounted += n(row.Discounted)
    current.comped += n(row.Comped)
    current.revenue += n(row.Revenue)
  }

  return {
    comicName: shows[0]?.comicName ?? safeStr(apiRows[0]?.ComicName),
    shows,
    grandTotal: {
      paid: shows.reduce((sum, row) => sum + row.paid, 0),
      discounted: shows.reduce((sum, row) => sum + row.discounted, 0),
      comped: shows.reduce((sum, row) => sum + row.comped, 0),
      revenue: shows.reduce((sum, row) => sum + row.revenue, 0),
    },
  }
}

function buildShowSection(show: ComicTicketRevenueShowRow): string {
  return `
    <div class="show-block">
      <p class="show-line"><strong>Show Date:</strong> ${escapeHtml(show.showDate)}</p>
      <p class="show-line"><strong>Show Time:</strong> ${escapeHtml(show.showTime)}</p>
      <table>
        <thead>
          <tr>
            <th>Date Sold:</th>
            <th>Paid</th>
            <th>Discounted</th>
            <th>Comped</th>
            <th>Revenue</th>
          </tr>
        </thead>
        <tbody>
          <tr class="subtotal">
            <td>Sub Total:</td>
            <td>${show.paid}</td>
            <td>${show.discounted}</td>
            <td>${show.comped}</td>
            <td>${formatMoney(show.revenue)}</td>
          </tr>
        </tbody>
      </table>
    </div>`
}

export function buildComicTicketRevenueDesktopHtml(
  document: ComicTicketRevenueDocument | null
): string {
  if (!document) {
    return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Comic Ticket Revenue</title>
    <style>${CUSTOMER_REPORT_STYLES}</style>
  </head>
  <body>
    <div class="title">Comic Ticket Revenue</div>
    <p style="text-align:center;padding:24px;">No records found</p>
  </body>
</html>`
  }

  const showSections = document.shows.map(buildShowSection).join("")
  const grandTotal = document.grandTotal

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Comic Ticket Revenue</title>
    <style>
      ${CUSTOMER_REPORT_STYLES}
      .comic-name { font-size: 15px; font-weight: 700; margin: 12px 0 18px; }
      .show-block { margin-bottom: 20px; page-break-inside: avoid; }
      .show-line { margin: 4px 0; font-weight: 600; }
      .subtotal td { font-weight: 600; }
      .grand-total td { font-size: 14px; font-weight: 800; border-top: 2px solid #111; }
      .divider { border-top: 2px solid #111; margin: 16px 0; }
    </style>
  </head>
  <body>
    <div class="title">Comic Ticket Revenue</div>
    <p class="comic-name">Comic Name: ${escapeHtml(document.comicName)}</p>
    ${showSections}
    <div class="divider"></div>
    <table>
      <tbody>
        <tr class="grand-total">
          <td>Grand Total:</td>
          <td>${grandTotal.paid}</td>
          <td>${grandTotal.discounted}</td>
          <td>${grandTotal.comped}</td>
          <td>${formatMoney(grandTotal.revenue)}</td>
        </tr>
      </tbody>
    </table>
  </body>
</html>`
}

export function buildComicTicketRevenueExcelBlob(document: ComicTicketRevenueDocument | null) {
  const sheetRows: (string | number)[][] = [["Comic Ticket Revenue"]]

  if (!document) {
    sheetRows.push(["No records found"])
  } else {
    sheetRows.push([`Comic Name: ${document.comicName}`], [])
    for (const show of document.shows) {
      sheetRows.push([`Show Date: ${show.showDate}`])
      sheetRows.push([`Show Time: ${show.showTime}`])
      sheetRows.push(["Date Sold", "", "Paid", "Discounted", "Comped", "Revenue"])
      sheetRows.push([
        "Sub Total",
        "",
        show.paid,
        show.discounted,
        show.comped,
        formatMoney(show.revenue),
      ])
      sheetRows.push([])
    }
    sheetRows.push([
      "Grand Total",
      "",
      document.grandTotal.paid,
      document.grandTotal.discounted,
      document.grandTotal.comped,
      formatMoney(document.grandTotal.revenue),
    ])
  }

  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.aoa_to_sheet(sheetRows)
  XLSX.utils.book_append_sheet(workbook, worksheet, "Comic Ticket Revenue")
  const output = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
  return new Blob([output], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  })
}
