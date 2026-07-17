import { XLSX } from "@/lib/xlsx-write"

import { CUSTOMER_REPORT_STYLES, escapeHtml } from "@/features/reports/customer-reports-shared"
import {
  buildReconcileReportData,
  type ReconcileReportRow,
} from "@/features/reports/reconcile-report-view"

type ReconcileLine = {
  type: string
  description: string
  amount?: number | null
  subtotal?: number | null
  bold?: boolean
}

function fmtAmount(value: number): string {
  return value.toFixed(2)
}

function fmtOptional(value: number | null | undefined): string {
  if (value == null) return ""
  return fmtAmount(value)
}

function purchaseLines(row: ReconcileReportRow): ReconcileLine[] {
  return [
    { type: "Daily Paid", description: "All door revenue for report date (all reservations for any show date)", amount: row.dailypaid },
    { type: "Gift Card", description: "Gift Card Purchased for report date", amount: row.giftcardpaid },
    { type: "Web Gift Cert", description: "Web Gift Cert Purchased for report date", amount: row.webgiftcert },
    { type: "Refunds Deferred", description: "Refunds processed for report date - current", amount: row.futurerefunds },
    { type: "Refunds Prior", description: "Refunds processed for report date - prior shows", amount: row.priorrefunds },
    { type: "Total Purchases", description: "Subtotal", subtotal: row.subtotal1, bold: true },
    { type: "Gross Sales", description: "Daily sales for report date (includes past and current deferred revenue)", amount: row.grossale },
    { type: "Total", description: "Control Total", subtotal: row.controltotal1, bold: true },
  ]
}

function settlementLines(row: ReconcileReportRow): ReconcileLine[] {
  return [
    { type: "MC/Visa Purchases", description: "Purchases processed for report date", amount: row.mcpaid },
    { type: "MC/Visa Refunds", description: "Refunds processed for report date", amount: row.mcrefunded },
    { type: "Total MC/Visa", description: "Subtotal", subtotal: row.subtotal2 },
    { type: "Discover Purchases", description: "Purchases processed for report date", amount: row.discpaid },
    { type: "Discover Refunds", description: "Refunds processed for report date", amount: row.discrefunded },
    { type: "Total Discover", description: "Subtotal", subtotal: row.subtotal3 },
    { type: "AMEX Purchases", description: "Purchases processed for report date", amount: row.amexpaid },
    { type: "AMEX Refunds", description: "Refunds processed for report date", amount: row.amexrefunded },
    { type: "Total AMEX", description: "Subtotal", subtotal: row.subtotal4 },
    { type: "Cash Purchases", description: "Cash and check received for report date (make a seperate bank deposit)", amount: row.cashpaid },
    { type: "Cash Refunds", description: "Cash and check refunded for report date", amount: row.cashrefunded },
    { type: "Total Cash", description: "Subtotal", subtotal: row.subtotal5 },
    { type: "Gift Card/Cert", description: "Gift Card and Certificates redeemed for report date", amount: 0 },
    { type: "Web Gift Cert", description: "Web Gift Certificate redeemed for report date", amount: row.webgiftcertpaid },
    { type: "Prior System Trans", description: "Deferred Revenue transferred from prior system for report date", amount: 0 },
    { type: "Total Settlement", description: "Subtotal", subtotal: row.subtotal6 },
    { type: "Deferred Revenue Used", description: "Deferred Revenue used for report date", amount: row.defrev },
    { type: "Total", description: "Control Total", subtotal: row.controltotal2, bold: true },
  ]
}

function renderLineRow(line: ReconcileLine): string {
  const weight = line.bold ? "font-weight:700;" : ""
  return `<tr>
    <td style="${weight}">${escapeHtml(line.type)}</td>
    <td>${escapeHtml(line.description)}</td>
    <td style="text-align:center;">${escapeHtml(fmtOptional(line.amount))}</td>
    <td style="text-align:center;${weight}">${escapeHtml(fmtOptional(line.subtotal))}</td>
  </tr>`
}

function renderSection(title: string, lines: ReconcileLine[]): string {
  return `<table class="reconcile-table">
    <thead>
      <tr><th colspan="4" class="section-title">${escapeHtml(title)}</th></tr>
      <tr>
        <th>Type</th>
        <th>Description</th>
        <th></th>
        <th></th>
      </tr>
    </thead>
    <tbody>${lines.map(renderLineRow).join("")}</tbody>
  </table>`
}

function renderDateBlock(row: ReconcileReportRow): string {
  return `<div class="date-block">
    <div class="date-header">
      <strong>End Of Day Report For ${escapeHtml(row.reportdate)}</strong>
      <span>${escapeHtml(row.startdate)}</span>
      <span>${escapeHtml(row.enddate)}</span>
    </div>
    ${renderSection("Purchase", purchaseLines(row))}
    ${renderSection("Settlement", settlementLines(row))}
    <table class="reconcile-table">
      <tbody>
        <tr>
          <td colspan="3">Control Total Difference</td>
          <td style="text-align:center;font-weight:700;">${escapeHtml(fmtAmount(row.controltotaldifference))}</td>
        </tr>
      </tbody>
    </table>
    <table class="reconcile-table">
      <tbody>
        <tr><td colspan="4" class="section-title">Deferred Revenue</td></tr>
        <tr>
          <td>Deferred Revenue</td>
          <td>Deferred revenue amount as of report date</td>
          <td></td>
          <td style="text-align:center;">${escapeHtml(fmtAmount(row.Deferredrevenueamountasofreportdate))}</td>
        </tr>
      </tbody>
    </table>
    <table class="reconcile-table proof-table">
      <tbody>
        <tr><td colspan="2" class="section-title">Proof for Deferred Revenue</td></tr>
        <tr><td>Beginning Balance</td><td style="text-align:right;">${escapeHtml(fmtAmount(row.defbalance))}</td></tr>
        <tr><td>Purchased Deferred Revenue as of report date</td><td style="text-align:right;">${escapeHtml(fmtAmount(row.defpurch))}</td></tr>
        <tr><td>Deferred Revenue as of report date</td><td style="text-align:right;">${escapeHtml(fmtAmount(row.defrev))}</td></tr>
        <tr><td>Deferred refunds processed</td><td style="text-align:right;">${escapeHtml(fmtAmount(row.defrefunds))}</td></tr>
        <tr><td><strong>Ending Balance of Deferred Revenue</strong></td><td style="text-align:right;font-weight:700;">${escapeHtml(fmtAmount(row.Deferredrevenueamountasofreportdate))}</td></tr>
      </tbody>
    </table>
  </div>`
}

export function buildReconcileDesktopHtml(rows: ReconcileReportRow[]): string {
  const body = rows.length
    ? rows.map(renderDateBlock).join("")
    : `<p style="text-align:center;padding:24px;">No records found</p>`

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Reconcile Report</title>
    <style>
      ${CUSTOMER_REPORT_STYLES}
      .date-block { margin-top: 24px; page-break-inside: avoid; }
      .date-header { display:flex; gap:16px; align-items:baseline; margin-bottom:12px; }
      .reconcile-table { width:100%; margin-top:8px; }
      .proof-table td:first-child { width:70%; }
      .section-title { font-weight:700; text-align:left; background:#f3f3f3; }
    </style>
  </head>
  <body>${body}</body>
</html>`
}

function pushLine(
  sheetRows: (string | number)[][],
  line: ReconcileLine
) {
  sheetRows.push([
    line.type,
    line.description,
    line.amount == null ? "" : line.amount,
    line.subtotal == null ? "" : line.subtotal,
  ])
}

function appendDateBlock(sheetRows: (string | number)[][], row: ReconcileReportRow) {
  sheetRows.push([])
  sheetRows.push([`End Of Day Report For ${row.reportdate}`, "", row.startdate, row.enddate])
  sheetRows.push(["", "Purchase"])
  sheetRows.push(["Type", "Description", "", ""])
  for (const line of purchaseLines(row)) pushLine(sheetRows, line)

  sheetRows.push(["", "Settlement"])
  sheetRows.push(["Type", "Description", "", ""])
  for (const line of settlementLines(row)) pushLine(sheetRows, line)

  sheetRows.push(["", "Control Total Difference", "", row.controltotaldifference])
  sheetRows.push(["", "Deferred Revenue"])
  sheetRows.push([
    "Deferred Revenue",
    "Deferred revenue amount as of report date",
    "",
    row.Deferredrevenueamountasofreportdate,
  ])
  sheetRows.push(["", "Proof for Deferred Revenue"])
  sheetRows.push(["", "Beginning Balance", row.defbalance])
  sheetRows.push(["", "Purchased Deferred Revenue as of report date", row.defpurch])
  sheetRows.push(["", "Deferred Revenue as of report date", row.defrev])
  sheetRows.push(["", "Deferred refunds processed", row.defrefunds])
  sheetRows.push(["", "Ending Balance of Deferred Revenue", row.Deferredrevenueamountasofreportdate])
}

export function buildReconcileWorkbook(rows: ReconcileReportRow[]) {
  const sheetRows: (string | number)[][] = [["Reconcile Report"]]
  for (const row of rows) appendDateBlock(sheetRows, row)
  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.aoa_to_sheet(sheetRows)
  XLSX.utils.book_append_sheet(workbook, worksheet, "Reconcile")
  return workbook
}

export function buildReconcileExcelBlob(rows: ReconcileReportRow[]) {
  const workbook = buildReconcileWorkbook(rows)
  const output = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
  return new Blob([output], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  })
}

export function mapReconcileDocumentRows(
  rawData: unknown,
  startDate: string,
  endDate: string
): ReconcileReportRow[] {
  return buildReconcileReportData(rawData, startDate, endDate)
}
