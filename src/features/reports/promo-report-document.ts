import { XLSX } from "@/lib/xlsx-write"

import {
  CUSTOMER_REPORT_STYLES,
  escapeHtml,
} from "@/features/reports/customer-reports-shared"
import { buildPromoReportData } from "@/features/reports/promo-report-view"

function formatPromoPercPdf(value: number): string {
  return `%${value.toFixed(2)}`
}

function formatPromoPercExcel(value: number): string {
  return `${value}%`
}

export function buildPromoReportDesktopHtml(rawData: unknown): string {
  const { headers, rows, footer } = buildPromoReportData(rawData)

  if (!rows.length) {
    return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Promo Report</title>
    <style>${CUSTOMER_REPORT_STYLES}</style>
  </head>
  <body>
    <div class="title">Promo Report</div>
    <p style="text-align:center;padding:24px;">No records found</p>
  </body>
</html>`
  }

  const promoGroupHeaders = headers
    .map(
      (header) =>
        `<th colspan="3" style="text-align:center;">${escapeHtml(header.name)}</th>`
    )
    .join("")

  const subHeaders = headers
    .map(
      () =>
        `<th style="text-align:center;">Made</th><th style="text-align:center;">CI</th><th style="text-align:center;">Perc</th>`
    )
    .join("")

  const bodyRows = rows
    .map(
      (row) => `<tr>
      <td>${escapeHtml(row.showDate)}</td>
      <td>${escapeHtml(row.comic)}</td>
      <td>${escapeHtml(row.day)}</td>
      ${row.details
        .map(
          (detail) => `<td>${detail.made}</td><td>${detail.ci}</td><td>${escapeHtml(formatPromoPercPdf(detail.perc))}</td>`
        )
        .join("")}
    </tr>`
    )
    .join("")

  const footerCells = footer
    .map(
      (detail) =>
        `<td><strong>${detail.made}</strong></td><td><strong>${detail.ci}</strong></td><td><strong>${escapeHtml(formatPromoPercPdf(detail.perc))}</strong></td>`
    )
    .join("")

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Promo Report</title>
    <style>
      ${CUSTOMER_REPORT_STYLES}
      .num { text-align: center; }
    </style>
  </head>
  <body>
    <div class="title">Promo Report</div>
    <table>
      <thead>
        <tr>
          <th>Show Date</th>
          <th>Comic</th>
          <th>Day</th>
          ${promoGroupHeaders}
        </tr>
        <tr>
          <th></th>
          <th></th>
          <th></th>
          ${subHeaders}
        </tr>
      </thead>
      <tbody>
        ${bodyRows}
        <tr>
          <td colspan="3" style="text-align:center;font-weight:700;">Total</td>
          ${footerCells}
        </tr>
      </tbody>
    </table>
  </body>
</html>`
}

export function buildPromoReportWorkbook(rawData: unknown) {
  const { headers, rows, footer } = buildPromoReportData(rawData)
  const sheetRows: (string | number)[][] = []

  const headerRow1: (string | number)[] = ["Show Date", "Comic", "Day"]
  for (const header of headers) {
    headerRow1.push(header.name, "", "")
  }
  sheetRows.push(headerRow1)

  const headerRow2: (string | number)[] = ["", "", ""]
  for (let i = 0; i < headers.length; i++) {
    headerRow2.push("Made", "CI", "Perc")
  }
  sheetRows.push(headerRow2)

  for (const row of rows) {
    const line: (string | number)[] = [row.showDate, row.comic, row.day]
    for (const detail of row.details) {
      line.push(detail.made, detail.ci, formatPromoPercExcel(detail.perc))
    }
    sheetRows.push(line)
  }

  const footerRow: (string | number)[] = ["Total", "", ""]
  for (const detail of footer) {
    footerRow.push(detail.made, detail.ci, formatPromoPercExcel(detail.perc))
  }
  sheetRows.push(footerRow)

  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.aoa_to_sheet(sheetRows)
  XLSX.utils.book_append_sheet(workbook, worksheet, "promoReport")
  return workbook
}

export function buildPromoReportExcelBlob(rawData: unknown) {
  const workbook = buildPromoReportWorkbook(rawData)
  const output = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
  return new Blob([output], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  })
}
