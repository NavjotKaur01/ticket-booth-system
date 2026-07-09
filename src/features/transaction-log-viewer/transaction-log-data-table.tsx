import { useMemo } from "react"

import { DataTable } from "@/components/data-table/data-table"
import { getTransactionLogColumns } from "@/features/transaction-log-viewer/transaction-log-columns"
import type { TransactionLog } from "@/types/transaction-log"

type TransactionLogDataTableProps = {
  data: TransactionLog[]
  emptyMessage?: string
}

export function TransactionLogDataTable({
  data,
  emptyMessage = "No data to display",
}: TransactionLogDataTableProps) {
  const columns = useMemo(() => getTransactionLogColumns(), [])

  return (
    <DataTable
      columns={columns}
      data={data}
      emptyMessage={emptyMessage}
      entityLabel="items"
      pageSize={10}
      getRowId={(row) => row.id}
    />
  )
}
