import dayjs from "dayjs"
import * as XLSX from "xlsx"

import {
  CUSTOMER_REPORT_STYLES,
  escapeHtml,
  formatDesktopDate,
  safeStr,
} from "@/features/reports/customer-reports-shared"

export type QuickViewSalesDocumentRow = {
  day: string
  date: string
  comicName: string
  seats: number
  seated: number
  scan: number
  dine: number
  nComp: number
  nDisc: number
  nPaid: number
  paid: string
  saleTax: string
  afterTax: string
  svc: string
  netTotal: string
}

export type QuickViewSalesDocumentTotals = {
  seats: number
  seated: number
  scan: number
  dine: number
  nComp: number
  nDisc: number
  nPaid: number
  paid: number
  saleTax: number
  afterTax: number
  svc: number
  netTotal: number
}

type QuickViewApiRow = {
  Day?: string
  ShowDt?: string
  ComicName?: string
  Seats?: number
  Seated?: number
  ScannerIn?: number
  Scan?: number
  Dine?: number
  NComp?: number
  NDisc?: number
  NPaid?: number
  Paid?: number
  SalesTax?: number
  SaleTax?: number
  AfterTax?: number
  SVC?: number
  NetTotal?: number
}

function toNum(value: unknown): number {
  const num = typeof value === "number" ? value : parseFloat(String(value ?? "0"))
  return Number.isFinite(num) ? num : 0
}

function formatMoney(value: number): string {
  return `$${value.toFixed(2)}`
}

function formatShowDate(value: unknown): string {
  if (!value) return ""
  const parsed = dayjs(String(value))
  return parsed.isValid() ? parsed.format("MM/DD/YYYY") : String(value)
}

function emptyTotals(): QuickViewSalesDocumentTotals {
  return {
    seats: 0,
    seated: 0,
    scan: 0,
    dine: 0,
    nComp: 0,
    nDisc: 0,
    nPaid: 0,
    paid: 0,
    saleTax: 0,
    afterTax: 0,
    svc: 0,
    netTotal: 0,
  }
}

export function mapQuickViewSalesData(rawData: unknown): {
  rows: QuickViewSalesDocumentRow[]
  totals: QuickViewSalesDocumentTotals
} {
  const apiRows = Array.isArray(rawData) ? (rawData as QuickViewApiRow[]) : []
  const totals = emptyTotals()

  const rows = apiRows.map((row) => {
    const seats = toNum(row.Seats)
    const seated = toNum(row.Seated)
    const scan = toNum(row.ScannerIn ?? row.Scan)
    const dine = toNum(row.Dine)
    const nComp = toNum(row.NComp)
    const nDisc = toNum(row.NDisc)
    const nPaid = toNum(row.NPaid)
    const paid = toNum(row.Paid)
    const saleTax = toNum(row.SalesTax ?? row.SaleTax)
    const afterTax = toNum(row.AfterTax)
    const svc = toNum(row.SVC)
    const netTotal = toNum(row.NetTotal)

    totals.seats += seats
    totals.seated += seated
    totals.scan += scan
    totals.dine += dine
    totals.nComp += nComp
    totals.nDisc += nDisc
    totals.nPaid += nPaid
    totals.paid += paid
    totals.saleTax += saleTax
    totals.afterTax += afterTax
    totals.svc += svc
    totals.netTotal += netTotal

    return {
      day: safeStr(row.Day),
      date: formatShowDate(row.ShowDt),
      comicName: safeStr(row.ComicName),
      seats,
      seated,
      scan,
      dine,
      nComp,
      nDisc,
      nPaid,
      paid: formatMoney(paid),
      saleTax: formatMoney(saleTax),
      afterTax: formatMoney(afterTax),
      svc: formatMoney(svc),
      netTotal: formatMoney(netTotal),
    }
  })

  return { rows, totals }
}

function renderQuickViewRowCells(row: QuickViewSalesDocumentRow): string {
  return `<td>${escapeHtml(row.day)}</td>
    <td>${escapeHtml(row.date)}</td>
    <td>${escapeHtml(row.comicName)}</td>
    <td>${row.seats}</td>
    <td>${row.seated}</td>
    <td>${row.scan}</td>
    <td>${row.dine}</td>
    <td>${row.nComp}</td>
    <td>${row.nDisc}</td>
    <td>${row.nPaid}</td>
    <td>${escapeHtml(row.paid)}</td>
    <td>${escapeHtml(row.saleTax)}</td>
    <td>${escapeHtml(row.afterTax)}</td>
    <td>${escapeHtml(row.svc)}</td>
    <td>${escapeHtml(row.netTotal)}</td>`
}

export function buildQuickViewSalesDesktopHtml({
  rows,
  totals,
  startDate,
  endDate,
}: {
  rows: QuickViewSalesDocumentRow[]
  totals: QuickViewSalesDocumentTotals
  startDate: string
  endDate: string
}): string {
  const headerCells = [
    "Day",
    "Date",
    "Comic Name",
    "Seats",
    "Seated",
    "Scan",
    "Dinner",
    "NComp",
    "NDisc",
    "NPaid",
    "Paid",
    "Sale Tax",
    "After Tax",
    "SVC",
    "Net",
  ]
    .map((label) => `<th>${escapeHtml(label)}</th>`)
    .join("")

  const bodyRows = rows.length
    ? rows.map((row) => `<tr>${renderQuickViewRowCells(row)}</tr>`).join("")
    : `<tr><td colspan="15" style="text-align:center;padding:24px;">No records found</td></tr>`

  const totalRow = rows.length
    ? `<tr class="total-row">
        <td></td>
        <td></td>
        <td><strong>Total</strong></td>
        <td>${totals.seats}</td>
        <td>${totals.seated}</td>
        <td>${totals.scan}</td>
        <td>${totals.dine}</td>
        <td>${totals.nComp}</td>
        <td>${totals.nDisc}</td>
        <td>${totals.nPaid}</td>
        <td>${escapeHtml(formatMoney(totals.paid))}</td>
        <td>${escapeHtml(formatMoney(totals.saleTax))}</td>
        <td>${escapeHtml(formatMoney(totals.afterTax))}</td>
        <td>${escapeHtml(formatMoney(totals.svc))}</td>
        <td>${escapeHtml(formatMoney(totals.netTotal))}</td>
      </tr>`
    : ""

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Quick View Sale Report</title>
    <style>
      ${CUSTOMER_REPORT_STYLES}
      .total-row td { font-weight: 700; }
    </style>
  </head>
  <body>
    <div class="title">Quick View Sale Report</div>
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

export function buildQuickViewSalesWorkbook({
  rows,
  totals,
  startDate,
  endDate,
}: {
  rows: QuickViewSalesDocumentRow[]
  totals: QuickViewSalesDocumentTotals
  startDate: string
  endDate: string
}) {
  const sheetRows: (string | number)[][] = [
    ["Quick View Sale Report"],
    ["", "", "Date Range", formatDesktopDate(startDate), "", "", "", "", "", "", "To:", formatDesktopDate(endDate)],
    [],
    [
      "Day",
      "Date",
      "Comic Name",
      "Seats",
      "Seated",
      "Scan",
      "Dinner",
      "NComp",
      "NDisc",
      "NPaid",
      "Paid",
      "Sale Tax",
      "After Tax",
      "SVC",
      "Net",
    ],
    ...rows.map((row) => [
      row.day,
      row.date,
      row.comicName,
      row.seats,
      row.seated,
      row.scan,
      row.dine,
      row.nComp,
      row.nDisc,
      row.nPaid,
      row.paid,
      row.saleTax,
      row.afterTax,
      row.svc,
      row.netTotal,
    ]),
  ]

  if (rows.length) {
    sheetRows.push([
      "",
      "",
      "Total",
      totals.seats,
      totals.seated,
      totals.scan,
      totals.dine,
      totals.nComp,
      totals.nDisc,
      totals.nPaid,
      formatMoney(totals.paid),
      formatMoney(totals.saleTax),
      formatMoney(totals.afterTax),
      formatMoney(totals.svc),
      formatMoney(totals.netTotal),
    ])
  }

  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.aoa_to_sheet(sheetRows)
  XLSX.utils.book_append_sheet(workbook, worksheet, "Quick View Sale")
  return workbook
}

export function buildQuickViewSalesExcelBlob(options: {
  rows: QuickViewSalesDocumentRow[]
  totals: QuickViewSalesDocumentTotals
  startDate: string
  endDate: string
}) {
  const workbook = buildQuickViewSalesWorkbook(options)
  const output = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
  return new Blob([output], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  })
}
