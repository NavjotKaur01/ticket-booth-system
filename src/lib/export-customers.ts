import {
  buildExportMatrix,
  exportTableData,
  type ExportColumn,
  type ExportFormat,
} from "@/lib/export-table-data"
import type { ApiCustomerSearchItem } from "@/types/api/customer-search"

function text(value: string | null | undefined) {
  return value?.replace(/\s+/g, " ").trim() ?? ""
}

function formatPhone(
  areaCode: string | null | undefined,
  phone1: string | null | undefined,
  phone2: string | null | undefined
) {
  const area = text(areaCode)
  const part1 = text(phone1)
  const part2 = text(phone2)
  if (!area && !part1 && !part2) return ""
  return `(${area})${part1}-${part2}`
}

/** Mirrors ClubMan CustomerVM CustomerExportList mapping. */
export type CustomerExportRow = {
  custId: string
  lastName: string
  firstName: string
  address: string
  addr2: string
  city: string
  stPr: string
  zipPost: string
  country: string
  areaCode: string
  phone1: string
  phone2: string
  phone: string
  altAreaCode: string
  altPhone1: string
  altPhone2: string
  altPhone: string
  altAreaCode2: string
  altPhone1_2: string
  altPhone2_2: string
  altPhone2Full: string
  email: string
  password: string
  birthMo: string | number
  birthYr: string | number
  dob: string
  banned: string
  noCall: string
  inactive: string
  updatedBy: string
  updateDate: string
  prev: string | number
}

export function mapCustomerExportRows(
  customers: ApiCustomerSearchItem[]
): CustomerExportRow[] {
  return (customers ?? [])
    .filter((row) => text(row.Active).toUpperCase() === "Y")
    .map((row) => ({
      custId: text(row.CustomerID),
      lastName: text(row.LastName),
      firstName: text(row.FirstName),
      address: text(row.Addr1),
      addr2: text(row.Addr2),
      city: text(row.City),
      stPr: text(row.State),
      zipPost: text(row.Zip),
      country: text(row.Country),
      areaCode: text(row.AreaCode),
      phone1: text(row.Phone1),
      phone2: text(row.Phone2),
      phone: formatPhone(row.AreaCode, row.Phone1, row.Phone2),
      altAreaCode: text(row.AltAreaCode),
      altPhone1: text(row.AltPhone1),
      altPhone2: text(row.AltPhone2),
      altPhone: formatPhone(row.AltAreaCode, row.AltPhone1, row.AltPhone2),
      altAreaCode2: text(row.AltAreaCode_2),
      altPhone1_2: text(row.AltPhone1_2),
      altPhone2_2: text(row.AltPhone2_2),
      altPhone2Full: formatPhone(
        row.AltAreaCode_2,
        row.AltPhone1_2,
        row.AltPhone2_2
      ),
      email: text(row.Email1),
      // Phase 0: never export plaintext passwords.
      password: "********",
      birthMo: row.BirthMonth ?? 0,
      birthYr: row.BirthYear ?? 0,
      dob: text(row.Birthday),
      banned: text(row.Banned),
      noCall: text(row.NoCall),
      inactive: text(row.Inactive),
      updatedBy: text(row.LastUpdateID),
      updateDate: text(row.LastUpdateDt),
      prev: row.bouncedCount ?? 0,
    }))
}

const EXPORT_COLUMNS: ExportColumn<CustomerExportRow>[] = [
  { header: "CustID", value: (row) => row.custId },
  { header: "LastName", value: (row) => row.lastName },
  { header: "FirstName", value: (row) => row.firstName },
  { header: "Address", value: (row) => row.address },
  { header: "Addr2", value: (row) => row.addr2 },
  { header: "City", value: (row) => row.city },
  { header: "StPr", value: (row) => row.stPr },
  { header: "ZipPost", value: (row) => row.zipPost },
  { header: "Country", value: (row) => row.country },
  { header: "AreaCode", value: (row) => row.areaCode },
  { header: "Phone1", value: (row) => row.phone1 },
  { header: "Phone2", value: (row) => row.phone2 },
  { header: "Phone", value: (row) => row.phone },
  { header: "AltAreaCode", value: (row) => row.altAreaCode },
  { header: "AltPhone1", value: (row) => row.altPhone1 },
  { header: "AltPhone2", value: (row) => row.altPhone2 },
  { header: "AltPhone", value: (row) => row.altPhone },
  { header: "AltAreaCode_2", value: (row) => row.altAreaCode2 },
  { header: "AltPhone1_2", value: (row) => row.altPhone1_2 },
  { header: "AltPhone2_2", value: (row) => row.altPhone2_2 },
  { header: "AltPhone_2", value: (row) => row.altPhone2Full },
  { header: "Email", value: (row) => row.email },
  { header: "Password", value: (row) => row.password },
  { header: "BirthMo", value: (row) => row.birthMo },
  { header: "BirthYr", value: (row) => row.birthYr },
  { header: "DOB", value: (row) => row.dob },
  { header: "Banned", value: (row) => row.banned },
  { header: "NoCall", value: (row) => row.noCall },
  { header: "Inactive", value: (row) => row.inactive },
  { header: "UpdatedBy", value: (row) => row.updatedBy },
  { header: "UpdateDate", value: (row) => row.updateDate },
  { header: "Prev", value: (row) => row.prev },
]

export async function exportCustomerRecords(
  records: CustomerExportRow[],
  format: ExportFormat,
  filename = "customers"
) {
  const { headers, rows } = buildExportMatrix(records, EXPORT_COLUMNS)
  return exportTableData(headers, rows, format, filename)
}
