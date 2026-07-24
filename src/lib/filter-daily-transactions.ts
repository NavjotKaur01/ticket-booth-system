import { formatCurrency } from "@/lib/format-currency"
import type { Transaction } from "@/types/transaction"

/** Visible Daily Transaction columns included in page search. */
const SEARCHABLE_FIELDS: (keyof Transaction)[] = [
  "lastName",
  "firstName",
  "businessName",
  "source",
  "createdBy",
  "createdDt",
  "paymentStatus",
  "paymentType",
  "ccType",
]

/** Case-insensitive match against daily transaction row fields. */
export function filterDailyTransactions(
  rows: Transaction[],
  query: string
): Transaction[] {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return rows

  return rows.filter((row) => {
    if (
      SEARCHABLE_FIELDS.some((field) =>
        String(row[field] ?? "")
          .toLowerCase()
          .includes(normalized)
      )
    ) {
      return true
    }

    return (
      formatCurrency(row.amount).toLowerCase().includes(normalized) ||
      String(row.amount).includes(normalized)
    )
  })
}
