import dayjs from "dayjs"
import { XLSX } from "@/lib/xlsx-write"

import {
  CUSTOMER_REPORT_STYLES,
  escapeHtml,
  formatDesktopDate,
} from "@/features/reports/customer-reports-shared"

export type ReceiptsDocumentRow = {
  paymentDate: string
  today: string
  deferredPaid: string
  total: string
  american: string
  cash: string
  creditCard: string
  discover: string
  giftCard: string
  masterCard: string
  visa: string
  webGiftCard: string
  calcPd: string
}

export type ReceiptsDocumentTotals = {
  today: number
  deferredPaid: number
  total: number
  american: number
  cash: number
  creditCard: number
  discover: number
  giftCard: number
  masterCard: number
  visa: number
  webGiftCard: number
  calcPd: number
}

type ReceiptApiRow = {
  PaymentDate?: string
  ReportDate?: string
  TotalPaid?: number
  DeferedPaid?: number
  Total?: number
  American?: number
  Cash?: number
  CreditCard?: number
  CreditCatrd?: number
  Discover?: number
  GiftCard?: number
  MasterCard?: number
  Visa?: number
  WebGiftCard?: number
  Calcpd?: number
}

function toNum(value: unknown): number {
  const num = typeof value === "number" ? value : parseFloat(String(value ?? "0"))
  return Number.isFinite(num) ? num : 0
}

function formatMoney(value: number): string {
  return `$${value.toFixed(2)}`
}

function formatPaymentDate(value: unknown): string {
  if (!value) return ""
  const parsed = dayjs(String(value))
  return parsed.isValid() ? parsed.format("MM/DD/YYYY") : String(value)
}

function emptyTotals(): ReceiptsDocumentTotals {
  return {
    today: 0,
    deferredPaid: 0,
    total: 0,
    american: 0,
    cash: 0,
    creditCard: 0,
    discover: 0,
    giftCard: 0,
    masterCard: 0,
    visa: 0,
    webGiftCard: 0,
    calcPd: 0,
  }
}

export function mapReceiptsData(rawData: unknown): {
  rows: ReceiptsDocumentRow[]
  totals: ReceiptsDocumentTotals
} {
  const apiRows = Array.isArray(rawData) ? (rawData as ReceiptApiRow[]) : []
  const totals = emptyTotals()

  const rows = apiRows.map((row) => {
    const today = toNum(row.TotalPaid)
    const deferredPaid = toNum(row.DeferedPaid)
    const total = toNum(row.Total)
    const american = toNum(row.American)
    const cash = toNum(row.Cash)
    const creditCard = toNum(row.CreditCard ?? row.CreditCatrd)
    const discover = toNum(row.Discover)
    const giftCard = toNum(row.GiftCard)
    const masterCard = toNum(row.MasterCard)
    const visa = toNum(row.Visa)
    const webGiftCard = toNum(row.WebGiftCard)
    const calcPd = toNum(row.Calcpd)

    totals.today += today
    totals.deferredPaid += deferredPaid
    totals.total += total
    totals.american += american
    totals.cash += cash
    totals.creditCard += creditCard
    totals.discover += discover
    totals.giftCard += giftCard
    totals.masterCard += masterCard
    totals.visa += visa
    totals.webGiftCard += webGiftCard
    totals.calcPd += calcPd

    return {
      paymentDate: formatPaymentDate(row.PaymentDate ?? row.ReportDate),
      today: formatMoney(today),
      deferredPaid: formatMoney(deferredPaid),
      total: formatMoney(total),
      american: formatMoney(american),
      cash: formatMoney(cash),
      creditCard: formatMoney(creditCard),
      discover: formatMoney(discover),
      giftCard: formatMoney(giftCard),
      masterCard: formatMoney(masterCard),
      visa: formatMoney(visa),
      webGiftCard: formatMoney(webGiftCard),
      calcPd: formatMoney(calcPd),
    }
  })

  return { rows, totals }
}

const RECEIPT_HEADERS = [
  "Date",
  "Today",
  "Deferred",
  "Total",
  "American",
  "Cash",
  // "Credit Card",
  "Discover",
  "Gift Card",
  "Master Card",
  "Visa",
  "Gift Card",
  "Sales Tax",
  "Total",
] as const

function renderReceiptCells(row: ReceiptsDocumentRow): string {
  return `<td>${escapeHtml(row.paymentDate)}</td>
    <td>${escapeHtml(row.today)}</td>
    <td>${escapeHtml(row.deferredPaid)}</td>
    <td>${escapeHtml(row.total)}</td>
    <td>${escapeHtml(row.american)}</td>
    <td>${escapeHtml(row.cash)}</td>
    <td>${escapeHtml(row.creditCard)}</td>
    <td>${escapeHtml(row.discover)}</td>
    <td>${escapeHtml(row.giftCard)}</td>
    <td>${escapeHtml(row.masterCard)}</td>
    <td>${escapeHtml(row.visa)}</td>
    <td>${escapeHtml(row.webGiftCard)}</td>
    <td>${escapeHtml(row.calcPd)}</td>`
}

function renderReceiptTotalsCells(totals: ReceiptsDocumentTotals): string {
  return `<td><strong>Total</strong></td>
    <td>${escapeHtml(formatMoney(totals.today))}</td>
    <td>${escapeHtml(formatMoney(totals.deferredPaid))}</td>
    <td>${escapeHtml(formatMoney(totals.total))}</td>
    <td>${escapeHtml(formatMoney(totals.american))}</td>
    <td>${escapeHtml(formatMoney(totals.cash))}</td>
    <td>${escapeHtml(formatMoney(totals.creditCard))}</td>
    <td>${escapeHtml(formatMoney(totals.discover))}</td>
    <td>${escapeHtml(formatMoney(totals.giftCard))}</td>
    <td>${escapeHtml(formatMoney(totals.masterCard))}</td>
    <td>${escapeHtml(formatMoney(totals.visa))}</td>
    <td>${escapeHtml(formatMoney(totals.webGiftCard))}</td>
    <td>${escapeHtml(formatMoney(totals.calcPd))}</td>`
}

export function buildReceiptsDesktopHtml({
  rows,
  totals,
  startDate,
  endDate,
}: {
  rows: ReceiptsDocumentRow[]
  totals: ReceiptsDocumentTotals
  startDate: string
  endDate: string
}): string {
  const headerCells = RECEIPT_HEADERS.map((label) => `<th>${escapeHtml(label)}</th>`).join("")

  const bodyRows = rows.length
    ? rows.map((row) => `<tr>${renderReceiptCells(row)}</tr>`).join("")
    : `<tr><td colspan="13" style="text-align:center;padding:24px;">No records found</td></tr>`

  const totalRow = rows.length ? `<tr class="total-row">${renderReceiptTotalsCells(totals)}</tr>` : ""

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Receipt Report</title>
    <style>
      ${CUSTOMER_REPORT_STYLES}
      .total-row td { font-weight: 700; }
    </style>
  </head>
  <body>
    <div class="title">Receipt Report</div>
    <table class="range">
      <tr>
        <td></td>
        <td></td>
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

export function buildReceiptsWorkbook({
  rows,
  totals,
  startDate,
  endDate,
}: {
  rows: ReceiptsDocumentRow[]
  totals: ReceiptsDocumentTotals
  startDate: string
  endDate: string
}) {
  const sheetRows: (string | number)[][] = [
    ["Receipt Report"],
    ["", "", "Date Range", formatDesktopDate(startDate), "", "", "", "", "", "", "To:", formatDesktopDate(endDate)],
    [...RECEIPT_HEADERS],
    ...rows.map((row) => [
      row.paymentDate,
      row.today,
      row.deferredPaid,
      row.total,
      row.american,
      row.cash,
      row.creditCard,
      row.discover,
      row.giftCard,
      row.masterCard,
      row.visa,
      row.webGiftCard,
      row.calcPd,
    ]),
  ]

  if (rows.length) {
    sheetRows.push([
      "Total",
      formatMoney(totals.today),
      formatMoney(totals.deferredPaid),
      formatMoney(totals.total),
      formatMoney(totals.american),
      formatMoney(totals.cash),
      formatMoney(totals.creditCard),
      formatMoney(totals.discover),
      formatMoney(totals.giftCard),
      formatMoney(totals.masterCard),
      formatMoney(totals.visa),
      formatMoney(totals.webGiftCard),
      formatMoney(totals.calcPd),
    ])
  }

  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.aoa_to_sheet(sheetRows)
  XLSX.utils.book_append_sheet(workbook, worksheet, "Receipt Report")
  return workbook
}

export function buildReceiptsExcelBlob(options: {
  rows: ReceiptsDocumentRow[]
  totals: ReceiptsDocumentTotals
  startDate: string
  endDate: string
}) {
  const workbook = buildReceiptsWorkbook(options)
  const output = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
  return new Blob([output], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  })
}
