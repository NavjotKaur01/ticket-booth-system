import * as XLSX from "xlsx"

import { CUSTOMER_REPORT_STYLES, escapeHtml } from "@/features/reports/customer-reports-shared"
import {
  buildSalesByShowData,
  type SaleByShowDateGroup,
} from "@/features/reports/sales-by-show-view"

type SaleByShowShow = SaleByShowDateGroup["shows"][number]

function fmtMoney(value: number): string {
  return value.toFixed(2)
}

function renderPromoTable(show: SaleByShowShow): string {
  const promoRows = show.promos.length
    ? show.promos
        .map(
          (p) => `<tr>
        <td>${escapeHtml(p.promo || "—")}</td>
        <td style="text-align:right;">${p.party}</td>
        <td style="text-align:right;">${p.checkedIn}</td>
        <td style="text-align:right;">${p.checkinPaid}</td>
        <td style="text-align:right;">${p.checkinComp}</td>
        <td style="text-align:right;">${p.checkinDisc}</td>
      </tr>`
        )
        .join("")
    : `<tr><td colspan="6">—</td></tr>`

  return `<table class="promo-table">
    <thead>
      <tr>
        <th>Promotion</th>
        <th>Party</th>
        <th>Seated</th>
        <th>Paid</th>
        <th>Comp</th>
        <th>Disc</th>
      </tr>
    </thead>
    <tbody>
      ${promoRows}
      <tr class="promo-total-row">
        <td></td>
        <td style="text-align:right;font-weight:700;">${show.partyTotal}</td>
        <td style="text-align:right;font-weight:700;">${show.checkedInTotal}</td>
        <td style="text-align:right;font-weight:700;">${show.checkinPaidTotal}</td>
        <td style="text-align:right;font-weight:700;">${show.checkinCompTotal}</td>
        <td style="text-align:right;font-weight:700;">${show.checkinDiscTotal}</td>
      </tr>
    </tbody>
  </table>`
}

function renderShowBlock(show: SaleByShowShow): string {
  return `<div class="show-block">
    <table class="show-table">
      <thead>
        <tr>
          <th>Show Time</th>
          <th>Comedian</th>
          <th>Price</th>
          <th>Booked</th>
          <th>Seated</th>
          <th>F-Paid</th>
          <th>Comp</th>
          <th>Disc</th>
          <th>Disc Val</th>
          <th>Show Day</th>
          <th>Deffered Coll</th>
          <th>Tax</th>
          <th>Net Door</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>${escapeHtml(show.showTm)}</td>
          <td>${escapeHtml(show.comicName)}</td>
          <td style="text-align:right;">${escapeHtml(fmtMoney(show.showPrice))}</td>
          <td style="text-align:right;">${show.party}</td>
          <td style="text-align:right;">${show.checkedIn}</td>
          <td style="text-align:right;">${show.checkinPaid}</td>
          <td style="text-align:right;">${show.checkinComp}</td>
          <td style="text-align:right;">${show.checkinDisc}</td>
          <td style="text-align:right;">${escapeHtml(fmtMoney(show.discount))}</td>
          <td style="text-align:right;">${escapeHtml(fmtMoney(show.dailyPaid))}</td>
          <td style="text-align:right;">${escapeHtml(fmtMoney(show.defCollected))}</td>
          <td style="text-align:right;"></td>
          <td style="text-align:right;">${escapeHtml(fmtMoney(show.net))}</td>
        </tr>
      </tbody>
    </table>
    <div class="promo-wrap">${renderPromoTable(show)}</div>
  </div>`
}

function renderDateGroup(group: SaleByShowDateGroup): string {
  return `<div class="date-block">
    <div class="date-header">Sales Show for : ${escapeHtml(group.showDate)}</div>
    <div class="subheader">Number of Items</div>
    ${group.shows.map(renderShowBlock).join("")}
  </div>`
}

export function buildSalesByShowDesktopHtml(groups: SaleByShowDateGroup[]): string {
  const body = groups.length
    ? groups.map(renderDateGroup).join("")
    : `<p style="text-align:center;padding:24px;">No records found</p>`

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Sales By Show Report</title>
    <style>
      ${CUSTOMER_REPORT_STYLES}
      .date-block { margin-top: 24px; page-break-inside: avoid; }
      .date-header { background:#155abb; color:#fff; padding:6px 10px; font-weight:700; font-size:12px; }
      .subheader { background:#d4d4d4; text-align:center; padding:4px 10px; font-size:12px; font-weight:600; }
      .show-block { border-bottom:1px solid #d4d4d8; padding-bottom:8px; margin-bottom:8px; }
      .show-table, .promo-table { width:100%; margin-top:6px; font-size:11px; }
      .promo-wrap { padding-left:32px; margin-top:4px; }
      .promo-total-row td { background:#f4f4f5; }
      th { text-align:left; }
      th:not(:first-child), td[style*="text-align:right"] { text-align:right; }
    </style>
  </head>
  <body>
    <div class="title">Sales By Show Report</div>
    ${body}
  </body>
</html>`
}

function appendShowToSheet(sheetRows: (string | number)[][], show: SaleByShowShow) {
  sheetRows.push([
    "Show Time",
    "Comedian",
    "Price",
    "Booked",
    "Seated",
    "F-Paid",
    "Comp",
    "Disc",
    "Disc Val",
    "Show Day",
    "Deffered Coll",
    "Tax",
    "Net Door",
  ])
  sheetRows.push([
    show.showTm,
    show.comicName,
    show.showPrice,
    show.party,
    show.checkedIn,
    show.checkinPaid,
    show.checkinComp,
    show.checkinDisc,
    show.discount,
    show.dailyPaid,
    show.defCollected,
    "",
    show.net,
  ])
  sheetRows.push(["Promotion", "Party", "Seated", "Paid", "Comp", "Disc"])
  if (show.promos.length) {
    for (const promo of show.promos) {
      sheetRows.push([
        promo.promo,
        promo.party,
        promo.checkedIn,
        promo.checkinPaid,
        promo.checkinComp,
        promo.checkinDisc,
      ])
    }
  } else {
    sheetRows.push(["—"])
  }
  sheetRows.push([
    "",
    show.partyTotal,
    show.checkedInTotal,
    show.checkinPaidTotal,
    show.checkinCompTotal,
    show.checkinDiscTotal,
  ])
}

function appendDateGroup(sheetRows: (string | number)[][], group: SaleByShowDateGroup) {
  sheetRows.push([])
  sheetRows.push([`Sales Show for : ${group.showDate}`])
  sheetRows.push(["Number of Items"])
  for (const show of group.shows) {
    appendShowToSheet(sheetRows, show)
    sheetRows.push([])
  }
}

export function buildSalesByShowWorkbook(groups: SaleByShowDateGroup[]) {
  const sheetRows: (string | number)[][] = [["Sales By Show Report"]]
  for (const group of groups) appendDateGroup(sheetRows, group)
  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.aoa_to_sheet(sheetRows)
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sales By Show")
  return workbook
}

export function buildSalesByShowExcelBlob(groups: SaleByShowDateGroup[]) {
  const workbook = buildSalesByShowWorkbook(groups)
  const output = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
  return new Blob([output], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  })
}

export function mapSalesByShowDocumentGroups(rawData: unknown): SaleByShowDateGroup[] {
  return buildSalesByShowData(rawData)
}
