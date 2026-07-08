import dayjs from "dayjs"
import * as XLSX from "xlsx"

import {
  CUSTOMER_REPORT_STYLES,
  escapeHtml,
} from "@/features/reports/customer-reports-shared"
import { buildPdfFromDesktopHtml } from "@/features/reports/report-desktop-pdf"
import { formatCurrency } from "@/lib/format-currency"
import type { TodaySalesSummary } from "@/types/today-sales-report"
function renderTodayShowsTable(shows: TodaySalesSummary["todaysShows"]): string {
  if (shows.length === 0) {
    return `<table><tbody><tr><td colspan="5" style="text-align:center;padding:24px;">No shows found</td></tr></tbody></table>`
  }

  const rows = shows
    .map(
      (show) => `<tr>
      <td>${escapeHtml(show.showName)}</td>
      <td>${escapeHtml(show.showDate)}</td>
      <td style="text-align:right;">${show.reservations}</td>
      <td style="text-align:right;">${show.ticketsSold}</td>
      <td style="text-align:right;">${escapeHtml(formatCurrency(show.revenue))}</td>
    </tr>`
    )
    .join("")

  return `<table>
    <thead>
      <tr>
        <th>Show Name</th>
        <th>Show Date</th>
        <th style="text-align:right;">Reservations</th>
        <th style="text-align:right;">Tickets Sold</th>
        <th style="text-align:right;">Revenue</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>`
}

function renderRecentSalesTable(sales: TodaySalesSummary["recentSales"]): string {
  if (sales.length === 0) {
    return `<table><tbody><tr><td colspan="9" style="text-align:center;padding:24px;">No sales found</td></tr></tbody></table>`
  }

  const rows = sales
    .map(
      (sale) => `<tr>
      <td>${escapeHtml(sale.agent)}</td>
      <td>${escapeHtml(sale.customer)}</td>
      <td>${escapeHtml(sale.show)}</td>
      <td style="text-align:right;">${sale.qty}</td>
      <td style="text-align:right;">${escapeHtml(formatCurrency(sale.total))}</td>
      <td>${escapeHtml(sale.paymentType)}</td>
      <td>${escapeHtml(sale.createdOn)}</td>
      <td>${escapeHtml(sale.email)}</td>
      <td>${escapeHtml(sale.comment)}</td>
    </tr>`
    )
    .join("")

  return `<table>
    <thead>
      <tr>
        <th>Agent</th>
        <th>Customer</th>
        <th>Show</th>
        <th style="text-align:right;">Qty</th>
        <th style="text-align:right;">Total</th>
        <th>Payment Type</th>
        <th>Created On</th>
        <th>Email</th>
        <th>Comment</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>`
}

export function buildTodaySalesDesktopHtml(
  summary: TodaySalesSummary,
  clubName = ""
): string {
  const reportDate = dayjs().format("MM/DD/YYYY")

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Today Sales</title>
    <style>
      ${CUSTOMER_REPORT_STYLES}
      .club-name { text-align:center; font-size:18px; font-weight:700; margin:12px 0; border-bottom:1px solid #d4d4d8; padding-bottom:12px; }
      .summary { margin: 16px 0; font-size: 14px; font-weight: 700; }
      .section-title { margin: 20px 0 8px; font-size: 14px; font-weight: 700; }
      .section-meta { margin: 0 0 8px; font-size: 12px; color: #444; }
    </style>
  </head>
  <body>
    <div class="title">Today Sales</div>
    <table class="range">
      <tr>
        <td class="label">Report Date:</td>
        <td>${escapeHtml(reportDate)}</td>
      </tr>
    </table>
    ${clubName ? `<div class="club-name">CLUB Name: ${escapeHtml(clubName)}</div>` : ""}
    <div class="summary">Tickets Sold Today: ${summary.ticketsSoldToday}</div>
    <div class="section-title">Today&apos;s Shows</div>
    <div class="section-meta">${summary.todaysShows.length} Show${summary.todaysShows.length === 1 ? "" : "s"}</div>
    ${renderTodayShowsTable(summary.todaysShows)}
    <div class="section-title">Recent Sales Activity</div>
    <div class="section-meta">Today&apos;s Reservation Count: ${summary.recentSales.length}</div>
    ${renderRecentSalesTable(summary.recentSales)}
  </body>
</html>`
}

export async function createTodaySalesPdfBlob(
  summary: TodaySalesSummary,
  clubName = ""
): Promise<Blob> {
  return buildPdfFromDesktopHtml(
    buildTodaySalesDesktopHtml(summary, clubName),
    "data-today-sales-pdf-capture"
  )
}

export function buildTodaySalesWorkbook(
  summary: TodaySalesSummary,
  clubName = ""
) {
  const reportDate = dayjs().format("MM/DD/YYYY")
  const sheetRows: (string | number)[][] = [
    ["Today Sales"],
    ["", "Report Date", reportDate],
  ]

  if (clubName) {
    sheetRows.push([`CLUB Name: ${clubName}`])
  }

  sheetRows.push(
    [],
    [`Tickets Sold Today: ${summary.ticketsSoldToday}`],
    [],
    ["Today's Shows"],
    ["Show Name", "Show Date", "Reservations", "Tickets Sold", "Revenue"]
  )

  for (const show of summary.todaysShows) {
    sheetRows.push([
      show.showName,
      show.showDate,
      show.reservations,
      show.ticketsSold,
      formatCurrency(show.revenue),
    ])
  }

  sheetRows.push(
    [],
    ["Recent Sales Activity"],
    [
      "Agent",
      "Customer",
      "Show",
      "Qty",
      "Total",
      "Payment Type",
      "Created On",
      "Email",
      "Comment",
    ]
  )

  for (const sale of summary.recentSales) {
    sheetRows.push([
      sale.agent,
      sale.customer,
      sale.show,
      sale.qty,
      formatCurrency(sale.total),
      sale.paymentType,
      sale.createdOn,
      sale.email,
      sale.comment,
    ])
  }

  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.aoa_to_sheet(sheetRows)
  XLSX.utils.book_append_sheet(workbook, worksheet, "Today Sales")
  return workbook
}

export function buildTodaySalesExportBlob(
  summary: TodaySalesSummary,
  clubName = ""
): Blob {
  const workbook = buildTodaySalesWorkbook(summary, clubName)
  const output = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
  return new Blob([output], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  })
}
