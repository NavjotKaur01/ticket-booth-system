import type { Transaction, TransactionFilters } from "@/types/transaction"

export function filterTransactions(
  transactions: Transaction[],
  filters: TransactionFilters
) {
  return transactions.filter((transaction) => {
    if (transaction.showDate !== filters.showDate) return false
    if (transaction.showTimeId !== filters.showTimeId) return false
    return true
  })
}
