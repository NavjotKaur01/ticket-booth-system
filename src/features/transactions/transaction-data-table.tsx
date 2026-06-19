import { DataTable } from "@/components/data-table/data-table"
import { transactionColumns } from "@/features/transactions/transaction-columns"
import type { Transaction } from "@/types/transaction"

type TransactionDataTableProps = {
  data: Transaction[]
}

export function TransactionDataTable({ data }: TransactionDataTableProps) {
  return (
    <DataTable
      columns={transactionColumns}
      data={data}
      emptyMessage="No record found"
      entityLabel="records"
      pageSize={10}
    />
  )
}
