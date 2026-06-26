import {
  buildExportMatrix,
  exportTableData,
  type ExportColumn,
  type ExportFormat,
} from "@/lib/export-table-data"
import type { Transaction } from "@/types/transaction"

const EXPORT_COLUMNS: ExportColumn<Transaction>[] = [
  { header: "ReservationID", value: (row) => row.reservationId },
  { header: "CustomerID", value: (row) => row.customerId },
  { header: "ResSource", value: (row) => row.resSource },
  { header: "ResStatus", value: (row) => row.resStatus },
  { header: "Last Name", value: (row) => row.lastName },
  { header: "First Name", value: (row) => row.firstName },
  { header: "Business Name", value: (row) => row.businessName },
  { header: "Source", value: (row) => row.source },
  { header: "Notes", value: (row) => row.notes },
  { header: "Promo", value: (row) => row.promo },
  { header: "Pending", value: (row) => row.pendingStatus },
  { header: "Dinner", value: (row) => row.dinner },
  { header: "Section", value: (row) => row.section },
  { header: "Quantity", value: (row) => row.partyNo },
  { header: "Seated", value: (row) => row.checkedIn },
  { header: "Price", value: (row) => row.price },
  { header: "Total", value: (row) => row.total },
  { header: "Created By", value: (row) => row.createdBy },
  { header: "Created Dt", value: (row) => row.createdDt },
]

export async function exportDailyTransactions(
  transactions: Transaction[],
  format: ExportFormat,
  filename = "daily-transactions"
) {
  const { headers, rows } = buildExportMatrix(transactions, EXPORT_COLUMNS)
  return exportTableData(headers, rows, format, filename)
}
