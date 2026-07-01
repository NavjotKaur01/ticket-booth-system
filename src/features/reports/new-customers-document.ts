import * as XLSX from "xlsx"

import {
  buildCustomerReportDesktopHtml,
  formatDesktopDate,
  formatDesktopDateTime,
  safeStr,
} from "@/features/reports/customer-reports-shared"

export type NewCustomerDocumentRow = {
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

type NewCustomerApiRow = {
  LastName?: string
  FirstName?: string
  Email1?: string
  Email?: string
  Addr1?: string
  City?: string
  State?: string
  Zip?: string
  ZipCode?: string
  Phone?: string
  DateCreated?: string
}

const PDF_HEADERS = [
  "Last Name",
  "First Name",
  "Email Address",
  "Address",
  "City",
  "State",
  "Phone",
  "Zip",
  "CreatedOn",
]

const EXCEL_HEADERS = [
  "Last Name",
  "First Name",
  "Email Address",
  "Address",
  "City",
  "State",
  "Phone",
  "Zip",
  "Created On",
]

export function mapNewCustomerRows(rawData: unknown): NewCustomerDocumentRow[] {
  const rows = Array.isArray(rawData) ? (rawData as NewCustomerApiRow[]) : []
  return rows.map((row) => ({
    lastName: safeStr(row.LastName),
    firstName: safeStr(row.FirstName),
    email: safeStr(row.Email1 ?? row.Email),
    address: safeStr(row.Addr1),
    city: safeStr(row.City),
    state: safeStr(row.State),
    phone: safeStr(row.Phone),
    zip: safeStr(row.Zip ?? row.ZipCode),
    dateCreated: formatDesktopDateTime(safeStr(row.DateCreated)),
  }))
}

function toRowCells(row: NewCustomerDocumentRow) {
  return [
    row.lastName,
    row.firstName,
    row.email,
    row.address,
    row.city,
    row.state,
    row.phone,
    row.zip,
    row.dateCreated,
  ]
}

export function buildNewCustomersDesktopHtml({
  rows,
  startDate,
  endDate,
}: {
  rows: NewCustomerDocumentRow[]
  startDate: string
  endDate: string
}): string {
  return buildCustomerReportDesktopHtml({
    title: "New Customer Report",
    startDate,
    endDate,
    headers: PDF_HEADERS,
    rows: rows.map(toRowCells),
    emptyColspan: 9,
  })
}

export function buildNewCustomersExcelBlob({
  rows,
  startDate,
  endDate,
}: {
  rows: NewCustomerDocumentRow[]
  startDate: string
  endDate: string
}) {
  const sheetRows: (string | number)[][] = [
    ["New Customer Report"],
    ["Date Range:", formatDesktopDate(startDate), "", "", "To:", formatDesktopDate(endDate)],
    [],
    EXCEL_HEADERS,
    ...rows.map(toRowCells),
  ]

  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.aoa_to_sheet(sheetRows)
  XLSX.utils.book_append_sheet(workbook, worksheet, "NewCustomer")
  const output = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
  return new Blob([output], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  })
}
