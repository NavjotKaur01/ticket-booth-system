import {
  buildExportMatrix,
  exportTableData,
  type ExportColumn,
  type ExportFormat,
} from "@/lib/export-table-data"
import type { MarketingFilterRecord } from "@/types/marketing-filter"

function formatPhoneNumber(record: MarketingFilterRecord) {
  const areaCode = record.phone
  const phone1 = record.phone1
  const phone2 = record.phone2

  if (!areaCode && !phone1 && !phone2) {
    return ""
  }

  return `${areaCode || ""}-${phone1 || ""}-${phone2 || ""}`
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-")
}

const EXPORT_COLUMNS: ExportColumn<MarketingFilterRecord>[] = [
  {
    header: "First Name",
    value: (row) => row.firstName,
  },
  {
    header: "Last Name",
    value: (row) => row.lastName,
  },
  {
    header: "Email",
    value: (row) => row.email,
  },
  {
    header: "Address",
    value: (row) => row.address,
  },
  {
    header: "Address2",
    value: (row) => row.address2,
  },
  {
    header: "Phone Number",
    value: (row) => formatPhoneNumber(row),
  },
  {
    header: "Zip Code",
    value: (row) => row.zipCode,
  },
  {
    header: "Created On",
    value: (row) => row.createdOn,
  },
  {
    header: "Status",
    value: (row) => row.status,
  },
  {
    header: "City",
    value: (row) => row.city,
  },
]

export async function exportMarketingFilterRecords(
  records: MarketingFilterRecord[],
  format: ExportFormat,
  filename = "marketing-filter"
) {
  const { headers, rows } = buildExportMatrix(records, EXPORT_COLUMNS)
  return exportTableData(headers, rows, format, filename)
}
