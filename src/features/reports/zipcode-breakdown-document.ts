import { XLSX } from "@/lib/xlsx-write"

import {
  CUSTOMER_REPORT_STYLES,
  escapeHtml,
  safeStr,
} from "@/features/reports/customer-reports-shared"

export type ZipCodeBreakdownDocumentRow = {
  zipCode: string
  count: number
}

export type ZipCodeBreakdownDocumentTotals = {
  count: number
}

type ZipCodeApiRow = {
  ZipCode?: string
  Count?: number
}

function toNum(value: unknown): number {
  const num = typeof value === "number" ? value : parseFloat(String(value ?? "0"))
  return Number.isFinite(num) ? num : 0
}

export function mapZipCodeBreakdownData(rawData: unknown): {
  rows: ZipCodeBreakdownDocumentRow[]
  totals: ZipCodeBreakdownDocumentTotals
} {
  const apiRows = Array.isArray(rawData) ? (rawData as ZipCodeApiRow[]) : []
  const totals = { count: 0 }

  const rows = apiRows.map((row) => {
    const count = toNum(row.Count)
    totals.count += count
    return {
      zipCode: safeStr(row.ZipCode),
      count,
    }
  })

  return { rows, totals }
}

export function buildZipCodeBreakdownDesktopHtml({
  rows,
  totals,
}: {
  rows: ZipCodeBreakdownDocumentRow[]
  totals: ZipCodeBreakdownDocumentTotals
}): string {
  const bodyRows = rows.length
    ? rows
        .map(
          (row) => `<tr>
        <td>${escapeHtml(row.zipCode)}</td>
        <td style="text-align:right;">${row.count}</td>
      </tr>`
        )
        .join("")
    : `<tr><td colspan="2" style="text-align:center;padding:24px;">No records found</td></tr>`

  const totalRow = rows.length
    ? `<tr class="total-row">
        <td><strong>Total</strong></td>
        <td style="text-align:right;">${totals.count}</td>
      </tr>`
    : ""

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>ZipCode Breakdown Report</title>
    <style>
      ${CUSTOMER_REPORT_STYLES}
      .total-row td { font-weight: 700; }
      th:last-child, td[style*="text-align:right"] { text-align:right; }
    </style>
  </head>
  <body>
    <div class="title">ZipCode Breakdown Report</div>
    <table>
      <thead>
        <tr>
          <th>Zip Code</th>
          <th>Count</th>
        </tr>
      </thead>
      <tbody>${bodyRows}${totalRow}</tbody>
    </table>
  </body>
</html>`
}

export function buildZipCodeBreakdownWorkbook({
  rows,
  totals,
}: {
  rows: ZipCodeBreakdownDocumentRow[]
  totals: ZipCodeBreakdownDocumentTotals
}) {
  const sheetRows: (string | number)[][] = [
    ["ZipCode Breakdown Report"],
    [],
    ["Zip Code", "Count"],
    ...rows.map((row) => [row.zipCode, row.count]),
  ]

  if (rows.length) {
    sheetRows.push(["Total", totals.count])
  }

  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.aoa_to_sheet(sheetRows)
  XLSX.utils.book_append_sheet(workbook, worksheet, "ZipCode Breakdown")
  return workbook
}

export function buildZipCodeBreakdownExcelBlob(options: {
  rows: ZipCodeBreakdownDocumentRow[]
  totals: ZipCodeBreakdownDocumentTotals
}) {
  const workbook = buildZipCodeBreakdownWorkbook(options)
  const output = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
  return new Blob([output], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  })
}
