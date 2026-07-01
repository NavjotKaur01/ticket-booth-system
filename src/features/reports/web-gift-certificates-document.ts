import dayjs from "dayjs"
import * as XLSX from "xlsx"

import {
  CUSTOMER_REPORT_STYLES,
  escapeHtml,
  formatDesktopDate,
  safeStr,
} from "@/features/reports/customer-reports-shared"

export type WebGiftCertificateDocumentRow = {
  createDate: string
  lastName: string
  firstName: string
  recLastName: string
  recFirstName: string
  originalAmount: string
  amount: string
  paidAmount: string
}

export type WebGiftCertificateDocumentTotals = {
  originalAmount: number
  amount: number
  paidAmount: number
}

type WebGiftCertificateApiRow = {
  CreateDt?: string
  Createdate?: string
  LastName?: string
  FirstName?: string
  RecLastName?: string
  RecFirstName?: string
  OrginalAmount?: number
  OriginalAmount?: number
  Amount?: number
  PaidAmount?: number
}

type WebGiftCertificateApiPayload = {
  WebGiftCertificatesReportList?: WebGiftCertificateApiRow[]
}

function toNum(value: unknown): number {
  const num = typeof value === "number" ? value : parseFloat(String(value ?? "0"))
  return Number.isFinite(num) ? num : 0
}

function formatMoney(value: number): string {
  return `$${value.toFixed(2)}`
}

function formatCreateDate(value: unknown): string {
  if (!value) return ""
  const parsed = dayjs(String(value))
  return parsed.isValid() ? parsed.format("MM/DD/YYYY") : String(value)
}

function resolveRawList(rawData: unknown): WebGiftCertificateApiRow[] {
  if (Array.isArray(rawData)) return rawData as WebGiftCertificateApiRow[]
  const wrapped = rawData as WebGiftCertificateApiPayload
  return wrapped?.WebGiftCertificatesReportList ?? []
}

export function mapWebGiftCertificatesData(rawData: unknown): {
  rows: WebGiftCertificateDocumentRow[]
  totals: WebGiftCertificateDocumentTotals
} {
  const apiRows = resolveRawList(rawData)
  const totals = { originalAmount: 0, amount: 0, paidAmount: 0 }

  const rows = apiRows.map((row) => {
    const originalAmount = toNum(row.OrginalAmount ?? row.OriginalAmount)
    const amount = toNum(row.Amount)
    const paidAmount = toNum(row.PaidAmount)

    totals.originalAmount += originalAmount
    totals.amount += amount
    totals.paidAmount += paidAmount

    return {
      createDate: formatCreateDate(row.CreateDt ?? row.Createdate),
      lastName: safeStr(row.LastName),
      firstName: safeStr(row.FirstName),
      recLastName: safeStr(row.RecLastName),
      recFirstName: safeStr(row.RecFirstName),
      originalAmount: formatMoney(originalAmount),
      amount: formatMoney(amount),
      paidAmount: formatMoney(paidAmount),
    }
  })

  return { rows, totals }
}

export function buildWebGiftCertificatesDesktopHtml({
  rows,
  totals,
  startDate,
  endDate,
}: {
  rows: WebGiftCertificateDocumentRow[]
  totals: WebGiftCertificateDocumentTotals
  startDate: string
  endDate: string
}): string {
  const headerCells = [
    "Create Date",
    "Last Name",
    "First Name",
    "Recipient Last",
    "Recipient First",
    "Original Amt",
    "Amount",
    "Paid Amt",
  ]
    .map((label) => `<th>${escapeHtml(label)}</th>`)
    .join("")

  const bodyRows = rows.length
    ? rows
        .map(
          (row) => `<tr>
        <td>${escapeHtml(row.createDate)}</td>
        <td>${escapeHtml(row.lastName)}</td>
        <td>${escapeHtml(row.firstName)}</td>
        <td>${escapeHtml(row.recLastName)}</td>
        <td>${escapeHtml(row.recFirstName)}</td>
        <td>${escapeHtml(row.originalAmount)}</td>
        <td>${escapeHtml(row.amount)}</td>
        <td>${escapeHtml(row.paidAmount)}</td>
      </tr>`
        )
        .join("")
    : `<tr><td colspan="8" style="text-align:center;padding:24px;">No records found</td></tr>`

  const totalRow = rows.length
    ? `<tr class="total-row">
        <td></td>
        <td></td>
        <td></td>
        <td><strong>Total</strong></td>
        <td></td>
        <td>${escapeHtml(formatMoney(totals.originalAmount))}</td>
        <td>${escapeHtml(formatMoney(totals.amount))}</td>
        <td>${escapeHtml(formatMoney(totals.paidAmount))}</td>
      </tr>`
    : ""

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Web Gift Certificates Report</title>
    <style>
      ${CUSTOMER_REPORT_STYLES}
      .total-row td { font-weight: 700; }
    </style>
  </head>
  <body>
    <div class="title">Web Gift Certificates Report</div>
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

export function buildWebGiftCertificatesWorkbook({
  rows,
  totals,
  startDate,
  endDate,
}: {
  rows: WebGiftCertificateDocumentRow[]
  totals: WebGiftCertificateDocumentTotals
  startDate: string
  endDate: string
}) {
  const sheetRows: (string | number)[][] = [
    ["Web Gift Certificates Report"],
    ["", "Date Range", formatDesktopDate(startDate), "", "To:", formatDesktopDate(endDate)],
    [
      "Create Date",
      "Last Name",
      "First Name",
      "Recipient Last",
      "Recipient First",
      "Original Amt",
      "Amount",
      "Paid Amt",
    ],
    ...rows.map((row) => [
      row.createDate,
      row.lastName,
      row.firstName,
      row.recLastName,
      row.recFirstName,
      row.originalAmount,
      row.amount,
      row.paidAmount,
    ]),
  ]

  if (rows.length) {
    sheetRows.push([
      "",
      "",
      "",
      "Total",
      "",
      formatMoney(totals.originalAmount),
      formatMoney(totals.amount),
      formatMoney(totals.paidAmount),
    ])
  }

  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.aoa_to_sheet(sheetRows)
  XLSX.utils.book_append_sheet(workbook, worksheet, "Web Gift Certificates")
  return workbook
}

export function buildWebGiftCertificatesExcelBlob(options: {
  rows: WebGiftCertificateDocumentRow[]
  totals: WebGiftCertificateDocumentTotals
  startDate: string
  endDate: string
}) {
  const workbook = buildWebGiftCertificatesWorkbook(options)
  const output = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
  return new Blob([output], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  })
}
