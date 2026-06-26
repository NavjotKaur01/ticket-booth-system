import { cn } from "@/lib/utils"
import type { Transaction } from "@/types/transaction"

/** Matches desktop RowColorConverter: RSTATE01 is default, others are highlighted. */
export function getTransactionRowClassName(transaction: Transaction) {
  return cn(
    transaction.resStatus && transaction.resStatus !== "RSTATE01"
      ? "bg-yellow-100 hover:bg-yellow-200/80 dark:bg-yellow-950/40 dark:hover:bg-yellow-950/60"
      : undefined
  )
}
