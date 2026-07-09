import type {
  TransactionLog,
  TransactionLogSearchFilters,
  TransactionLogTableFilters,
} from "@/types/transaction-log"

function matches(value: string, query: string) {
  if (!query.trim()) return true
  return value.toLowerCase().includes(query.trim().toLowerCase())
}

export function filterTransactionLogs(
  rows: TransactionLog[],
  locationId: string,
  search: TransactionLogSearchFilters,
  tableFilters: TransactionLogTableFilters
): TransactionLog[] {
  return rows.filter((row) => {
    if (locationId && row.locationId !== locationId) return false
    if (!matches(row.email, search.email)) return false
    if (!matches(row.firstName, search.firstName)) return false
    if (!matches(row.lastName, search.lastName)) return false
    if (!matches(row.firstName, tableFilters.firstName)) return false
    if (!matches(row.lastName, tableFilters.lastName)) return false
    if (!matches(row.email, tableFilters.email)) return false
    if (!matches(row.transactionDate, tableFilters.transactionDate)) return false
    return true
  })
}
