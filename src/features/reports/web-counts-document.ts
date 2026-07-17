import dayjs from "dayjs"
import { XLSX } from "@/lib/xlsx-write"

import {
  CUSTOMER_REPORT_STYLES,
  escapeHtml,
  formatDesktopDate,
} from "@/features/reports/customer-reports-shared"
import { mapWebCountRows } from "@/features/reports/web-counts-view"

export type WebCountsDocumentRow = {
  resDate: string
  todayCount: number
  todayAmount: string
  deferredCount: number
  deferredAmount: string
  totalCount: number
  totalAmount: string
}

export type WebCountsDocumentTotals = {
  todayCount: number
  todayAmount: number
  deferredCount: number
  deferredAmount: number
  totalCount: number
  totalAmount: number
}

function fmtMoney(value: number): string {
  return value.toFixed(2)
}

function fmtMoneyCell(value: number): string {
  return `$ ${fmtMoney(value)}`
}

function fmtResDate(value: string): string {
  if (!value) return ""
  const parsed = dayjs(value)
  return parsed.isValid() ? parsed.format("M/D/YYYY h:mm:ss A") : value
}

export function mapWebCountsDocumentData(rawData: unknown): {
  rows: WebCountsDocumentRow[]
  totals: WebCountsDocumentTotals
} {
  const mapped = mapWebCountRows(rawData)
  const totals = {
    todayCount: 0,
    todayAmount: 0,
    deferredCount: 0,
    deferredAmount: 0,
    totalCount: 0,
    totalAmount: 0,
  }

  const rows = mapped.map((row) => {
    totals.todayCount += row.todayCount
    totals.todayAmount += row.todayAmount
    totals.deferredCount += row.deferredCount
    totals.deferredAmount += row.deferredAmount

    return {
      resDate: fmtResDate(row.resDate),
      todayCount: row.todayCount,
      todayAmount: fmtMoneyCell(row.todayAmount),
      deferredCount: row.deferredCount,
      deferredAmount: fmtMoneyCell(row.deferredAmount),
      totalCount: row.totalCount,
      totalAmount: fmtMoneyCell(row.totalAmount),
    }
  })

  totals.totalCount = totals.todayCount + totals.deferredCount
  totals.totalAmount = totals.todayAmount + totals.deferredAmount

  return { rows, totals }
}

export function buildWebCountsDesktopHtml({
  rows,
  totals,
  startDate,
  endDate,
}: {
  rows: WebCountsDocumentRow[]
  totals: WebCountsDocumentTotals
  startDate: string
  endDate: string
}): string {
  const bodyRows = rows.length
    ? rows
        .map(
          (row) => `<tr>
        <td>${escapeHtml(row.resDate)}</td>
        <td style="text-align:right;">${row.todayCount}</td>
        <td style="text-align:right;">${escapeHtml(row.todayAmount)}</td>
        <td style="text-align:right;">${row.deferredCount}</td>
        <td style="text-align:right;">${escapeHtml(row.deferredAmount)}</td>
        <td style="text-align:right;">${row.totalCount}</td>
        <td style="text-align:right;">${escapeHtml(row.totalAmount)}</td>
      </tr>`
        )
        .join("")
    : `<tr><td colspan="7" style="text-align:center;padding:24px;">No records found</td></tr>`

  const totalRow = rows.length
    ? `<tr class="total-row">
        <td><strong>Total:</strong></td>
        <td style="text-align:right;">${totals.todayCount}</td>
        <td style="text-align:right;">${escapeHtml(fmtMoneyCell(totals.todayAmount))}</td>
        <td style="text-align:right;">${totals.deferredCount}</td>
        <td style="text-align:right;">${escapeHtml(fmtMoneyCell(totals.deferredAmount))}</td>
        <td style="text-align:right;">${totals.totalCount}</td>
        <td style="text-align:right;">${escapeHtml(fmtMoneyCell(totals.totalAmount))}</td>
      </tr>`
    : ""

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Daily Web Counts Report</title>
    <style>
      ${CUSTOMER_REPORT_STYLES}
      .report-title { text-align:center; font-size:18px; font-weight:700; margin:12px 0 16px; }
      .total-row td { font-weight: 700; background:#f4f4f5; }
      th { text-align:left; }
      th.group, th:not(:first-child) { text-align:right; }
      th.group-left { text-align:center; }
    </style>
  </head>
  <body>
    <div class="title">Web Counts</div>
    <table class="range">
      <tr>
        <td class="label">Date Range:</td>
        <td>${escapeHtml(formatDesktopDate(startDate))}</td>
        <td class="label">To:</td>
        <td>${escapeHtml(formatDesktopDate(endDate))}</td>
      </tr>
    </table>
    <div class="report-title">Daily Web Counts Report</div>
    <table>
      <thead>
        <tr>
          <th></th>
          <th colspan="2" class="group-left">Today</th>
          <th colspan="2" class="group-left">Defferred</th>
          <th colspan="2" class="group-left">Total</th>
        </tr>
        <tr>
          <th>Date</th>
          <th>Count</th>
          <th>Amount</th>
          <th>Count</th>
          <th>Amount</th>
          <th>Count</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>${bodyRows}${totalRow}</tbody>
    </table>
  </body>
</html>`
}

export function buildWebCountsWorkbook({
  rows,
  totals,
  startDate,
  endDate,
}: {
  rows: WebCountsDocumentRow[]
  totals: WebCountsDocumentTotals
  startDate: string
  endDate: string
}) {
  const sheetRows: (string | number)[][] = [
    ["Web Counts"],
    ["", "Date Range", formatDesktopDate(startDate), "", "To:", formatDesktopDate(endDate)],
    [],
    ["Daily Web Counts Report"],
    [],
    ["", "Today", "", "Defferred", "", "Total", ""],
    ["Date", "Count", "Amount", "Count", "Amount", "Count", "Amount"],
    ...rows.map((row) => [
      row.resDate,
      row.todayCount,
      row.todayAmount,
      row.deferredCount,
      row.deferredAmount,
      row.totalCount,
      row.totalAmount,
    ]),
  ]

  if (rows.length) {
    sheetRows.push([
      "Total:",
      totals.todayCount,
      fmtMoneyCell(totals.todayAmount),
      totals.deferredCount,
      fmtMoneyCell(totals.deferredAmount),
      totals.totalCount,
      fmtMoneyCell(totals.totalAmount),
    ])
  }

  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.aoa_to_sheet(sheetRows)
  XLSX.utils.book_append_sheet(workbook, worksheet, "Web Counts")
  return workbook
}

export function buildWebCountsExcelBlob(options: {
  rows: WebCountsDocumentRow[]
  totals: WebCountsDocumentTotals
  startDate: string
  endDate: string
}) {
  const workbook = buildWebCountsWorkbook(options)
  const output = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
  return new Blob([output], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  })
}
