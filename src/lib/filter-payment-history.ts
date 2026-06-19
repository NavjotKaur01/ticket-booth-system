import type {
  PaymentHistoryFilters,
  PaymentHistoryRecord,
} from "@/types/payment-history"

function matches(value: string, query: string) {
  return value.toLowerCase().includes(query.trim().toLowerCase())
}

export function filterPaymentHistoryRecords(
  rows: PaymentHistoryRecord[],
  filters: PaymentHistoryFilters,
  searched: boolean
): PaymentHistoryRecord[] {
  if (!searched) return []
  if (!filters.searchValue.trim()) return rows

  switch (filters.searchBy) {
    case "transaction-id":
      return rows.filter((row) => matches(row.id, filters.searchValue))
    case "last-name":
      return rows.filter((row) => matches(row.lastName, filters.searchValue))
    case "first-name":
      return rows.filter((row) => matches(row.firstName, filters.searchValue))
    case "pnref":
      return rows.filter((row) => matches(row.pnref, filters.searchValue))
    default:
      return []
  }
}
