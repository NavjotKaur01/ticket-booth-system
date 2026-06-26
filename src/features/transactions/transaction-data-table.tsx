import { DataTable } from "@/components/data-table/data-table"
import { transactionColumns } from "@/features/transactions/transaction-columns"
import { getTransactionRowClassName } from "@/lib/transaction-row-class"
import type { Transaction } from "@/types/transaction"

type TransactionDataTableProps = {
  data: Transaction[]
  loading?: boolean
}

export function TransactionDataTable({
  data,
  loading = false,
}: TransactionDataTableProps) {
  return (
    <DataTable
      columns={transactionColumns}
      data={data}
      emptyMessage={loading ? "Loading transactions..." : "No record found"}
      entityLabel="records"
      pageSize={10}
      getRowClassName={getTransactionRowClassName}
    />
  )
}
