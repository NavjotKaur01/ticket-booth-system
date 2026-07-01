import * as XLSX from "xlsx"

import {
  CUSTOMER_REPORT_STYLES,
  escapeHtml,
  formatDesktopDate,
  safeStr,
} from "@/features/reports/customer-reports-shared"

export type ComicSalesBreakdownRow = {
  comicName: string
  inHouse: number
  web: number
  total: number
}

export type ComicSalesBreakdownTotals = {
  inHouse: number
  web: number
  total: number
}

type ComicSalesApiRow = {
  ComicName?: string
  InHouseReservation?: number
  WebReservations?: number
  TotalReservationsCount?: number
}

function n(value: unknown): number {
  const num = typeof value === "number" ? value : parseFloat(String(value ?? "0"))
  return Number.isFinite(num) ? num : 0
}

export function mapComicSalesBreakdownRows(rawData: unknown): {
  rows: ComicSalesBreakdownRow[]
  totals: ComicSalesBreakdownTotals
} {
  const apiRows = Array.isArray(rawData) ? (rawData as ComicSalesApiRow[]) : []
  const rows = apiRows.map((row) => ({
    comicName: safeStr(row.ComicName),
    inHouse: n(row.InHouseReservation),
    web: n(row.WebReservations),
    total: n(row.TotalReservationsCount),
  }))

  const totals = {
    inHouse: rows.reduce((sum, row) => sum + row.inHouse, 0),
    web: rows.reduce((sum, row) => sum + row.web, 0),
    total: rows.reduce((sum, row) => sum + row.inHouse + row.web, 0),
  }

  return { rows, totals }
}

export function buildComicSalesBreakdownDesktopHtml({
  rows,
  totals,
  startDate,
  endDate,
}: {
  rows: ComicSalesBreakdownRow[]
  totals: ComicSalesBreakdownTotals
  startDate: string
  endDate: string
}): string {
  const bodyRows = rows.length
    ? rows
        .map(
          (row) => `<tr>
        <td>${escapeHtml(row.comicName)}</td>
        <td>${row.inHouse}</td>
        <td>${row.web}</td>
        <td>${row.total}</td>
      </tr>`
        )
        .join("")
    : `<tr><td colspan="4" style="text-align:center;padding:24px;">No records found</td></tr>`

  const totalRow = rows.length
    ? `<tr class="bold">
        <td>Total</td>
        <td>${totals.inHouse}</td>
        <td>${totals.web}</td>
        <td>${totals.total}</td>
      </tr>`
    : ""

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Comic Sales Breakdown Report</title>
    <style>
      ${CUSTOMER_REPORT_STYLES}
      .bold td { font-weight: 700; }
    </style>
  </head>
  <body>
    <div class="title">Comic Sales Breakdown Report</div>
    <table class="range">
      <tr>
        <td class="label">Date Range:</td>
        <td>${escapeHtml(formatDesktopDate(startDate))}</td>
        <td class="label">To:</td>
        <td>${escapeHtml(formatDesktopDate(endDate))}</td>
      </tr>
    </table>
    <table>
      <thead>
        <tr>
          <th>Comic Name</th>
          <th>In House Reservations</th>
          <th>Web Reservations</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        ${bodyRows}
        ${totalRow}
      </tbody>
    </table>
  </body>
</html>`
}

export function buildComicSalesBreakdownExcelBlob({
  rows,
  totals,
  startDate,
  endDate,
}: {
  rows: ComicSalesBreakdownRow[]
  totals: ComicSalesBreakdownTotals
  startDate: string
  endDate: string
}) {
  const sheetRows: (string | number)[][] = [
    ["Comic Sales Breakdown Report"],
    ["Date Range", formatDesktopDate(startDate), "To:", formatDesktopDate(endDate)],
    [],
    ["Comic Name", "In House Reservation", "Web Reservations", "Total"],
    ...rows.map((row) => [row.comicName, row.inHouse, row.web, row.total]),
    ["Total", totals.inHouse, totals.web, totals.total],
  ]

  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.aoa_to_sheet(sheetRows)
  XLSX.utils.book_append_sheet(workbook, worksheet, "Comic Sales Breakdown Report")
  const output = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
  return new Blob([output], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  })
}
