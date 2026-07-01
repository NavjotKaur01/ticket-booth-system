import * as XLSX from "xlsx"

import {
  CUSTOMER_REPORT_STYLES,
  escapeHtml,
  formatDesktopDate,
} from "@/features/reports/customer-reports-shared"
import {
  buildWebReservationsForDayData,
  type WebReservationShowGroup,
} from "@/features/reports/web-reservations-for-day-view"

type WebReservationRow = WebReservationShowGroup["reservations"][number]

function fmtMoney(value: number): string {
  return value.toFixed(2)
}

function fmtMoneyCell(value: number): string {
  return `$ ${fmtMoney(value)}`
}

function renderReservationRows(reservations: WebReservationRow[]): string {
  return reservations
    .map(
      (row) => `<tr>
      <td>${escapeHtml(row.customerName)}</td>
      <td style="text-align:center;">${escapeHtml(row.ccType || "—")}</td>
      <td style="text-align:center;">${escapeHtml(row.promotion)}</td>
      <td style="text-align:center;">${escapeHtml(row.section || "—")}</td>
      <td style="text-align:center;">${escapeHtml(row.dinner || "—")}</td>
      <td style="text-align:center;">${row.inParty}</td>
      <td style="text-align:right;">${escapeHtml(fmtMoneyCell(row.total))}</td>
    </tr>`
    )
    .join("")
}

function renderShowGroup(group: WebReservationShowGroup): string {
  return `<div class="show-group">
    <p class="show-title">Web Reservation For Shows On: ${escapeHtml(group.showDate)}</p>
    <p class="show-subtitle">For: ${escapeHtml(group.showTime)}, ${escapeHtml(group.comicName)}</p>
    <table>
      <thead>
        <tr>
          <th>Customer Name</th>
          <th>C\\C Type</th>
          <th>Promotion</th>
          <th>Section</th>
          <th>Dinner</th>
          <th># in Party</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        ${renderReservationRows(group.reservations)}
        <tr class="total-row">
          <td colspan="4"></td>
          <td style="text-align:center;"><strong>Total</strong></td>
          <td style="text-align:center;"><strong>${group.totalInParty}</strong></td>
          <td style="text-align:right;"><strong>${escapeHtml(fmtMoneyCell(group.totalAmount))}</strong></td>
        </tr>
      </tbody>
    </table>
  </div>`
}

export function buildWebReservationsForDayDesktopHtml({
  groups,
  clubName,
  startDate,
  endDate,
}: {
  groups: WebReservationShowGroup[]
  clubName: string
  startDate: string
  endDate: string
}): string {
  const body = groups.length
    ? groups.map(renderShowGroup).join("")
    : `<p style="text-align:center;padding:24px;">No records found</p>`

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Web Reservations for Day Report</title>
    <style>
      ${CUSTOMER_REPORT_STYLES}
      .club-name { text-align:center; font-size:18px; font-weight:700; margin:12px 0; border-bottom:1px solid #d4d4d8; padding-bottom:12px; }
      .show-group { margin-top:16px; page-break-inside:avoid; }
      .show-title, .show-subtitle { text-align:center; font-weight:700; margin:4px 0; }
      .total-row td { background:#f4f4f5; }
      th:not(:first-child):not(:nth-child(2)) { text-align:center; }
      th:last-child { text-align:right; }
    </style>
  </head>
  <body>
    <div class="title">Web Reservations for Day Report</div>
    <table class="range">
      <tr>
        <td class="label">Date Range:</td>
        <td>${escapeHtml(formatDesktopDate(startDate))}</td>
        <td class="label">To:</td>
        <td>${escapeHtml(formatDesktopDate(endDate))}</td>
      </tr>
    </table>
    <div class="club-name">CLUB Name: ${escapeHtml(clubName)}</div>
    ${body}
  </body>
</html>`
}

function appendShowGroup(sheetRows: (string | number)[][], group: WebReservationShowGroup) {
  sheetRows.push([])
  sheetRows.push([`Web Reservation For Shows On: ${group.showDate}`])
  sheetRows.push([`For: ${group.showTime}, ${group.comicName}`])
  sheetRows.push([
    "Customer Name",
    "C\\C Type",
    "Promotion",
    "Section",
    "Dinner",
    "# in Party",
    "Total",
  ])
  for (const row of group.reservations) {
    sheetRows.push([
      row.customerName,
      row.ccType,
      row.promotion,
      row.section,
      row.dinner,
      row.inParty,
      fmtMoneyCell(row.total),
    ])
  }
  sheetRows.push(["", "", "", "Total", "", group.totalInParty, fmtMoneyCell(group.totalAmount)])
}

export function buildWebReservationsForDayWorkbook({
  groups,
  clubName,
  startDate,
  endDate,
}: {
  groups: WebReservationShowGroup[]
  clubName: string
  startDate: string
  endDate: string
}) {
  const sheetRows: (string | number)[][] = [
    ["Web Reservations for Day Report"],
    ["", "Date Range", formatDesktopDate(startDate), "", "To:", formatDesktopDate(endDate)],
    [`CLUB Name: ${clubName}`],
  ]
  for (const group of groups) appendShowGroup(sheetRows, group)
  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.aoa_to_sheet(sheetRows)
  XLSX.utils.book_append_sheet(workbook, worksheet, "Web Reservations")
  return workbook
}

export function buildWebReservationsForDayExcelBlob(options: {
  groups: WebReservationShowGroup[]
  clubName: string
  startDate: string
  endDate: string
}) {
  const workbook = buildWebReservationsForDayWorkbook(options)
  const output = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
  return new Blob([output], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  })
}

export function mapWebReservationsForDayGroups(rawData: unknown): WebReservationShowGroup[] {
  return buildWebReservationsForDayData(rawData)
}
