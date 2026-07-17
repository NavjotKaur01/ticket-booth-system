import { XLSX } from "@/lib/xlsx-write"

import {
  buildCustomerReportDesktopHtml,
  formatDesktopDate,
  safeStr,
} from "@/features/reports/customer-reports-shared"

export type PastCustomerDocumentRow = {
  lastName: string
  firstName: string
  addr1: string
  addr2: string
  city: string
  state: string
  phone: string
  zip: string
  country: string
  email: string
}

type PastCustomerApiRow = {
  LastName?: string
  FirstName?: string
  Email1?: string
  Email?: string
  Addr1?: string
  Addr2?: string
  City?: string
  State?: string
  Zip?: string
  ZipCode?: string
  Phone?: string
  Country?: string
}

const HEADERS = [
  "LastName",
  "FirstName",
  "Addr1",
  "Addr2",
  "City",
  "State",
  "Zip",
  "Country",
  "Phone",
  "Email Address",
]

export function mapPastCustomerRows(rawData: unknown): PastCustomerDocumentRow[] {
  const rows = Array.isArray(rawData) ? (rawData as PastCustomerApiRow[]) : []
  return rows.map((row) => ({
    lastName: safeStr(row.LastName),
    firstName: safeStr(row.FirstName),
    addr1: safeStr(row.Addr1),
    addr2: safeStr(row.Addr2),
    city: safeStr(row.City),
    state: safeStr(row.State),
    phone: safeStr(row.Phone),
    zip: safeStr(row.Zip ?? row.ZipCode),
    country: safeStr(row.Country),
    email: safeStr(row.Email1 ?? row.Email),
  }))
}

function toRowCells(row: PastCustomerDocumentRow) {
  return [
    row.lastName,
    row.firstName,
    row.addr1,
    row.addr2,
    row.city,
    row.state,
    row.zip,
    row.country,
    row.phone,
    row.email,
  ]
}

export function buildPastCustomersDesktopHtml({
  rows,
  startDate,
  endDate,
}: {
  rows: PastCustomerDocumentRow[]
  startDate: string
  endDate: string
}): string {
  return buildCustomerReportDesktopHtml({
    title: "Past Customer Report",
    startDate,
    endDate,
    headers: HEADERS,
    rows: rows.map(toRowCells),
    emptyColspan: 10,
  })
}

export function buildPastCustomersExcelBlob({
  rows,
  startDate,
  endDate,
}: {
  rows: PastCustomerDocumentRow[]
  startDate: string
  endDate: string
}) {
  const sheetRows: (string | number)[][] = [
    ["Past Customer Report"],
    ["Date Range", formatDesktopDate(startDate), "", "", "", "", "", "", "To:", formatDesktopDate(endDate)],
    [],
    ["Last Name", "First Name", "Addr1", "Addr2", "City", "State", "Phone", "Zip", "Country", "Email"],
    ...rows.map(toRowCells),
  ]

  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.aoa_to_sheet(sheetRows)
  XLSX.utils.book_append_sheet(workbook, worksheet, "Past Customer Report")
  const output = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
  return new Blob([output], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  })
}
