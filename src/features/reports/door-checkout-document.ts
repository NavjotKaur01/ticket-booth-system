import dayjs from "dayjs"
import * as XLSX from "xlsx"

import {
  buildDoorCheckoutExportSections,
  fmtAmount,
  type DoorCheckoutCardBucket,
  type DoorCheckoutExportSection,
} from "@/features/reports/door-checkout-data"

const DESKTOP_STYLES = `
  body { margin: 0; padding: 25px; color: #111; font-family: "Times New Roman", Times, serif; font-size: 12px; }
  table { width: 100%; border-collapse: collapse; margin-top: 12px; }
  th, td { border: 1px solid #999; padding: 4px 6px; vertical-align: top; }
  th { font-weight: 700; text-align: left; }
  .title { font-size: 16px; font-weight: 700; text-align: center; padding: 8px 0 12px; }
  .range td { border: none; padding: 2px 6px 10px 0; }
  .range .label { font-weight: 700; }
  .section { margin-top: 24px; }
  .section-heading { font-weight: 700; margin: 16px 0 8px; }
  .user-heading { font-weight: 700; margin: 20px 0 8px; color: #0e7490; }
  .num { text-align: right; white-space: nowrap; }
  .bold { font-weight: 700; }
  .grand-total td { font-weight: 700; }
`

const BUCKET_ORDER: DoorCheckoutCardBucket[] = ["cash", "amex", "discover", "master", "visa"]

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function formatDesktopDate(value: string) {
  const parsed = dayjs(value)
  return parsed.isValid() ? parsed.format("MM/DD/YYYY") : value
}

function renderPaymentSummaryTable(section: DoorCheckoutExportSection): string {
  const rows = section.paymentSummary
    .map(
      (row) => `<tr>
        <td>${escapeHtml(row.type)}</td>
        <td class="num">${escapeHtml(fmtAmount(row.payments))}</td>
        <td class="num">${escapeHtml(fmtAmount(row.refunds))}</td>
        <td class="num">${escapeHtml(fmtAmount(row.total))}</td>
      </tr>`
    )
    .join("")

  return `<table>
    <thead>
      <tr>
        <th>Payment Type</th>
        <th class="num">Payment</th>
        <th class="num">Refunds</th>
        <th class="num">Total</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
      <tr class="bold">
        <td></td>
        <td class="num">${escapeHtml(fmtAmount(section.paymentTotal))}</td>
        <td class="num">${escapeHtml(fmtAmount(section.refundTotal))}</td>
        <td class="num">${escapeHtml(fmtAmount(section.totalsTotal))}</td>
      </tr>
    </tbody>
  </table>`
}

function renderShowDetailsTable(section: DoorCheckoutExportSection): string {
  const header = `<tr>
    <th>Show</th>
    <th>Payment Type</th>
    <th class="num">Payments</th>
    <th class="num">Refunds</th>
    <th class="num">Total</th>
  </tr>`

  const bodyParts: string[] = []

  for (const bucket of BUCKET_ORDER) {
    const lines = section.showBuckets[bucket]
    if (!lines.length) continue

    for (const line of lines) {
      bodyParts.push(`<tr>
        <td>${escapeHtml(line.showLabel)}</td>
        <td>${escapeHtml(line.paymentType)}</td>
        <td class="num">${escapeHtml(fmtAmount(line.payments))}</td>
        <td class="num">${escapeHtml(fmtAmount(line.refunds))}</td>
        <td class="num">${escapeHtml(fmtAmount(line.total))}</td>
      </tr>`)
    }

    const totals = section.bucketTotals[bucket]
    bodyParts.push(`<tr class="bold">
      <td></td>
      <td></td>
      <td class="num">${escapeHtml(fmtAmount(totals.payments))}</td>
      <td class="num">${escapeHtml(fmtAmount(totals.refunds))}</td>
      <td class="num">${escapeHtml(fmtAmount(totals.total))}</td>
    </tr>`)
  }

  const grand = `<tr class="grand-total">
    <td></td>
    <td>Total</td>
    <td class="num">${escapeHtml(fmtAmount(section.paymentTotal))}</td>
    <td class="num">${escapeHtml(fmtAmount(section.refundTotal))}</td>
    <td class="num">${escapeHtml(fmtAmount(section.totalsTotal))}</td>
  </tr>`

  return `<table>
    <thead>${header}</thead>
    <tbody>${bodyParts.join("")}${grand}</tbody>
  </table>`
}

function renderSection(section: DoorCheckoutExportSection, showUserHeading: boolean): string {
  const userBlock =
    showUserHeading && section.userLabel
      ? `<div class="user-heading">User : ${escapeHtml(section.userLabel)}</div>`
      : ""

  return `<div class="section">
    ${userBlock}
    <div class="section-heading">Checkout Date : ${escapeHtml(section.checkoutDateHeading)}</div>
    ${renderPaymentSummaryTable(section)}
    ${renderShowDetailsTable(section)}
  </div>`
}

export function buildDoorCheckoutDesktopHtml({
  sections,
  startDate,
  endDate,
}: {
  sections: DoorCheckoutExportSection[]
  startDate: string
  endDate: string
}): string {
  let lastUser: string | undefined
  const sectionHtml = sections.length
    ? sections
        .map((section) => {
          const showUserHeading = section.userLabel !== lastUser
          if (section.userLabel) lastUser = section.userLabel
          return renderSection(section, showUserHeading)
        })
        .join("")
    : `<p style="text-align:center;padding:24px;">No records found</p>`

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Door CheckOut Report</title>
    <style>${DESKTOP_STYLES}</style>
  </head>
  <body>
    <div class="title">Door CheckOut Report</div>
    <table class="range">
      <tr>
        <td class="label">Date Range:</td>
        <td>${escapeHtml(formatDesktopDate(startDate))}</td>
        <td class="label">To:</td>
        <td>${escapeHtml(formatDesktopDate(endDate))}</td>
      </tr>
    </table>
    ${sectionHtml}
  </body>
</html>`
}

function appendSectionToSheet(sheetRows: (string | number)[][], section: DoorCheckoutExportSection) {
  sheetRows.push([`Checkout Date  ${section.checkoutDate}`])
  sheetRows.push(["Payment Type", "Payment", "Refunds", "Total"])

  for (const row of section.paymentSummary) {
    sheetRows.push([row.type, row.payments, row.refunds, row.total])
  }
  sheetRows.push(["", section.paymentTotal, section.refundTotal, section.totalsTotal])
  sheetRows.push([])
  sheetRows.push(["Show", "Payment Type", "Payments", "Refunds", "Total"])

  for (const bucket of BUCKET_ORDER) {
    const lines = section.showBuckets[bucket]
    if (!lines.length) continue
    for (const line of lines) {
      sheetRows.push([line.showLabel, line.paymentType, line.payments, line.refunds, line.total])
    }
    const totals = section.bucketTotals[bucket]
    sheetRows.push(["", "", totals.payments, totals.refunds, totals.total])
    sheetRows.push([])
  }

  sheetRows.push(["", "Total", section.paymentTotal, section.refundTotal, section.totalsTotal])
  sheetRows.push([])
}

export function buildDoorCheckoutWorkbook({
  sections,
  startDate,
  endDate,
}: {
  sections: DoorCheckoutExportSection[]
  startDate: string
  endDate: string
}) {
  const sheetRows: (string | number)[][] = [
    ["Door CheckOut Report"],
    ["Date Range:", formatDesktopDate(startDate), "", "To:", formatDesktopDate(endDate)],
    [],
  ]

  let lastUser: string | undefined
  for (const section of sections) {
    if (section.userLabel && section.userLabel !== lastUser) {
      sheetRows.push([`User : ${section.userLabel}`])
      lastUser = section.userLabel
    }
    appendSectionToSheet(sheetRows, section)
  }

  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.aoa_to_sheet(sheetRows)
  XLSX.utils.book_append_sheet(workbook, worksheet, "doorCheckOut")
  return workbook
}

export function buildDoorCheckoutExcelBlob(options: {
  sections: DoorCheckoutExportSection[]
  startDate: string
  endDate: string
}) {
  const workbook = buildDoorCheckoutWorkbook(options)
  const output = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
  return new Blob([output], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  })
}

export function buildDoorCheckoutDocumentFromRaw(rawData: unknown, startDate: string, endDate: string) {
  const sections = buildDoorCheckoutExportSections(rawData)
  return {
    sections,
    html: buildDoorCheckoutDesktopHtml({ sections, startDate, endDate }),
  }
}
