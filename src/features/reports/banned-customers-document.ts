import dayjs from "dayjs"
import * as XLSX from "xlsx"

export type BannedCustomerDocumentRow = {
  lastName: string
  firstName: string
  email: string
  address: string
  city: string
  state: string
  phone: string
  zip: string
  dateCreated: string
}

type BannedCustomerApiRow = {
  LastName?: string
  FirstName?: string
  Email?: string
  Address?: string
  City?: string
  State?: string
  Zip?: string
  ZipCode?: string
  Phone?: string
  DateCreated?: string
}

const DESKTOP_STYLES = `
  body { margin: 0; padding: 25px; color: #111; font-family: "Times New Roman", Times, serif; font-size: 12px; }
  table { width: 100%; border-collapse: collapse; margin-top: 16px; }
  th, td { border: 1px solid #999; padding: 4px 6px; vertical-align: top; }
  th { font-weight: 700; text-align: left; background: #f3f3f3; }
  .title { font-size: 16px; font-weight: 700; text-align: center; padding: 8px 0 12px; }
  .range td { border: none; padding: 2px 6px 10px 0; }
  .range .label { font-weight: 700; }
`

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function safeStr(value: unknown): string {
  if (value == null || value === "") return ""
  return String(value)
}

function formatDesktopDate(value: string) {
  const parsed = dayjs(value)
  return parsed.isValid() ? parsed.format("MM/DD/YYYY") : value
}

function formatDesktopDateTime(value: string) {
  const parsed = dayjs(value)
  return parsed.isValid() ? parsed.format("MM/DD/YYYY HH:mm") : value
}

export function mapBannedCustomerRows(rawData: unknown): BannedCustomerDocumentRow[] {
  const rows = Array.isArray(rawData) ? (rawData as BannedCustomerApiRow[]) : []
  return rows.map((row) => ({
    lastName: safeStr(row.LastName),
    firstName: safeStr(row.FirstName),
    email: safeStr(row.Email),
    address: safeStr(row.Address),
    city: safeStr(row.City),
    state: safeStr(row.State),
    phone: safeStr(row.Phone),
    zip: safeStr(row.Zip ?? row.ZipCode),
    dateCreated: formatDesktopDateTime(safeStr(row.DateCreated)),
  }))
}

export function buildBannedCustomersDesktopHtml({
  rows,
  startDate,
  endDate,
}: {
  rows: BannedCustomerDocumentRow[]
  startDate: string
  endDate: string
}): string {
  const headerCells = [
    "Last Name",
    "First Name",
    "Email Address",
    "Address",
    "City",
    "State",
    "Phone",
    "Zip",
    "DateCreated",
  ]
    .map((label) => `<th>${escapeHtml(label)}</th>`)
    .join("")

  const bodyRows = rows.length
    ? rows
        .map(
          (row) => `<tr>
        <td>${escapeHtml(row.lastName)}</td>
        <td>${escapeHtml(row.firstName)}</td>
        <td>${escapeHtml(row.email)}</td>
        <td>${escapeHtml(row.address)}</td>
        <td>${escapeHtml(row.city)}</td>
        <td>${escapeHtml(row.state)}</td>
        <td>${escapeHtml(row.phone)}</td>
        <td>${escapeHtml(row.zip)}</td>
        <td>${escapeHtml(row.dateCreated)}</td>
      </tr>`
        )
        .join("")
    : `<tr><td colspan="9" style="text-align:center;padding:24px;">No records found</td></tr>`

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Banned\\Inactive Customer Report</title>
    <style>${DESKTOP_STYLES}</style>
  </head>
  <body>
    <div class="title">Banned\\Inactive Customer Report</div>
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
      <tbody>${bodyRows}</tbody>
    </table>
  </body>
</html>`
}

export function buildBannedCustomersWorkbook({
  rows,
  startDate,
  endDate,
}: {
  rows: BannedCustomerDocumentRow[]
  startDate: string
  endDate: string
}) {
  const sheetRows: (string | number)[][] = [
    ["Banned\\Inactive Customer Report"],
    ["Date Range:", formatDesktopDate(startDate), "", "", "To:", formatDesktopDate(endDate)],
    [],
    [
      "Last Name",
      "First Name",
      "Email Address",
      "Address",
      "City",
      "State",
      "Phone",
      "Zip",
      "DateCreated",
    ],
    ...rows.map((row) => [
      row.lastName,
      row.firstName,
      row.email,
      row.address,
      row.city,
      row.state,
      row.phone,
      row.zip,
      row.dateCreated,
    ]),
  ]

  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.aoa_to_sheet(sheetRows)
  XLSX.utils.book_append_sheet(workbook, worksheet, "BannedInactive Customer Report")
  return workbook
}

export function buildBannedCustomersExcelBlob(options: {
  rows: BannedCustomerDocumentRow[]
  startDate: string
  endDate: string
}) {
  const workbook = buildBannedCustomersWorkbook(options)
  const output = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
  return new Blob([output], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  })
}
