import dayjs from "dayjs"
import * as XLSX from "xlsx"

import {
  CUSTOMER_REPORT_STYLES,
  escapeHtml,
  formatDesktopDate,
} from "@/features/reports/customer-reports-shared"

export type TicketPriceBreakdownSection = {
  section: string
  available: number
  sold: number
  scanned: number
  paid: number
  grandTotal: number
}

export type TicketPriceBreakdownShow = {
  showDate: string
  showTime: string
  comicStageName: string
  totalSeat: number | null
  sections: TicketPriceBreakdownSection[]
}

type ApiSectionRow = {
  ShowId?: string | number
  ShowDate?: string
  ShowTime?: string
  ComicStageName?: string
  ComicFirstName?: string
  ComicLastName?: string
  TotalSeat?: number
  ShowSection?: string
  Available?: number
  Sold?: number
  Scanned?: number
  Paid?: number
  GrandTotal?: number
}

function toNum(value: number | undefined | null): number {
  return value ?? 0
}

function formatShowDate(value: string | undefined): string {
  if (!value) return ""
  const parsed = dayjs(value)
  return parsed.isValid() ? parsed.format("MM/DD/YYYY") : value
}

function formatMoney(value: number): string {
  return `$${value.toFixed(2)}`
}

function sumSections(sections: TicketPriceBreakdownSection[], key: keyof TicketPriceBreakdownSection): number {
  if (key === "section") return 0
  return sections.reduce((sum, section) => sum + (section[key] as number), 0)
}

export function mapTicketPriceBreakdownShows(rawData: unknown): TicketPriceBreakdownShow[] {
  if (!Array.isArray(rawData)) return []

  const map = new Map<string | number, TicketPriceBreakdownShow>()

  for (const row of rawData as ApiSectionRow[]) {
    const id = row.ShowId ?? `${row.ShowDate}-${row.ShowTime}`
    if (!map.has(id)) {
      map.set(id, {
        showDate: formatShowDate(row.ShowDate),
        showTime: row.ShowTime ?? "",
        comicStageName:
          row.ComicStageName ??
          `${row.ComicFirstName ?? ""} ${row.ComicLastName ?? ""}`.trim(),
        totalSeat: row.TotalSeat ?? null,
        sections: [],
      })
    }

    const show = map.get(id)!
    if (row.ShowSection) {
      show.sections.push({
        section: row.ShowSection,
        available: toNum(row.Available),
        sold: toNum(row.Sold),
        scanned: toNum(row.Scanned),
        paid: toNum(row.Paid),
        grandTotal: toNum(row.GrandTotal),
      })
    }
  }

  return Array.from(map.values())
}

function renderShowBlock(show: TicketPriceBreakdownShow): string {
  const totalAvail = sumSections(show.sections, "available")
  const totalSold = sumSections(show.sections, "sold")
  const totalScan = sumSections(show.sections, "scanned")
  const totalPaid = sumSections(show.sections, "paid")
  const grandTotal = sumSections(show.sections, "grandTotal")
  const seatLabel =
    show.totalSeat != null ? `<span class="seat-count">${show.totalSeat} total seats</span>` : ""

  const sectionRows = show.sections.length
    ? show.sections
        .map(
          (section) => `<tr>
        <td>${escapeHtml(section.section)}</td>
        <td style="text-align:right;">${section.available}</td>
        <td style="text-align:right;">${section.sold}</td>
        <td style="text-align:right;">${section.scanned}</td>
        <td style="text-align:right;">${section.paid}</td>
        <td style="text-align:right;">${escapeHtml(formatMoney(section.grandTotal))}</td>
      </tr>`
        )
        .join("")
    : `<tr><td colspan="6" style="text-align:center;">No sections</td></tr>`

  return `<div class="show-block">
    <div class="show-header">
      <strong>${escapeHtml(show.showDate)}</strong>
      <span>${escapeHtml(show.showTime)}</span>
      <span>${escapeHtml(show.comicStageName)}</span>
      ${seatLabel}
    </div>
    <table>
      <thead>
        <tr>
          <th>Section</th>
          <th>Available</th>
          <th>Sold</th>
          <th>Scanned</th>
          <th>Paid</th>
          <th>Grand Total</th>
        </tr>
      </thead>
      <tbody>
        ${sectionRows}
        <tr class="total-row">
          <td><strong>Total</strong></td>
          <td style="text-align:right;">${totalAvail}</td>
          <td style="text-align:right;">${totalSold}</td>
          <td style="text-align:right;">${totalScan}</td>
          <td style="text-align:right;">${totalPaid}</td>
          <td style="text-align:right;">${escapeHtml(formatMoney(grandTotal))}</td>
        </tr>
      </tbody>
    </table>
  </div>`
}

export function buildTicketPriceBreakdownDesktopHtml({
  shows,
  startDate,
  endDate,
}: {
  shows: TicketPriceBreakdownShow[]
  startDate: string
  endDate: string
}): string {
  const body = shows.length
    ? shows.map(renderShowBlock).join("")
    : `<p style="text-align:center;padding:24px;">No records found</p>`

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Ticket Price Breakdown Report</title>
    <style>
      ${CUSTOMER_REPORT_STYLES}
      .show-block { margin-top: 16px; page-break-inside: avoid; }
      .show-header { display:flex; flex-wrap:wrap; gap:12px; align-items:center; padding:8px 0; border-bottom:1px solid #d4d4d8; margin-bottom:8px; }
      .seat-count { margin-left:auto; }
      .total-row td { font-weight: 700; background:#f4f4f5; }
      th:not(:first-child), td[style*="text-align:right"] { text-align:right; }
    </style>
  </head>
  <body>
    <div class="title">Ticket Price Breakdown Report</div>
    <table class="range">
      <tr>
        <td class="label">Date Range:</td>
        <td>${escapeHtml(formatDesktopDate(startDate))}</td>
        <td class="label">To:</td>
        <td>${escapeHtml(formatDesktopDate(endDate))}</td>
      </tr>
    </table>
    ${body}
  </body>
</html>`
}

function appendShowToSheet(sheetRows: (string | number)[][], show: TicketPriceBreakdownShow) {
  const header = show.totalSeat != null
    ? `${show.showDate} ${show.showTime} ${show.comicStageName} (${show.totalSeat} total seats)`
    : `${show.showDate} ${show.showTime} ${show.comicStageName}`
  sheetRows.push([header])
  sheetRows.push(["Section", "Available", "Sold", "Scanned", "Paid", "Grand Total"])
  for (const section of show.sections) {
    sheetRows.push([
      section.section,
      section.available,
      section.sold,
      section.scanned,
      section.paid,
      section.grandTotal,
    ])
  }
  sheetRows.push([
    "Total",
    sumSections(show.sections, "available"),
    sumSections(show.sections, "sold"),
    sumSections(show.sections, "scanned"),
    sumSections(show.sections, "paid"),
    sumSections(show.sections, "grandTotal"),
  ])
  sheetRows.push([])
}

export function buildTicketPriceBreakdownWorkbook({
  shows,
  startDate,
  endDate,
}: {
  shows: TicketPriceBreakdownShow[]
  startDate: string
  endDate: string
}) {
  const sheetRows: (string | number)[][] = [
    ["Ticket Price Breakdown Report"],
    ["", "Date Range", formatDesktopDate(startDate), "", "To:", formatDesktopDate(endDate)],
    [],
  ]
  for (const show of shows) appendShowToSheet(sheetRows, show)
  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.aoa_to_sheet(sheetRows)
  XLSX.utils.book_append_sheet(workbook, worksheet, "Ticket Price Breakdown")
  return workbook
}

export function buildTicketPriceBreakdownExcelBlob(options: {
  shows: TicketPriceBreakdownShow[]
  startDate: string
  endDate: string
}) {
  const workbook = buildTicketPriceBreakdownWorkbook(options)
  const output = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
  return new Blob([output], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  })
}
