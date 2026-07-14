import { useMemo } from "react"

import { DataTable } from "@/components/data-table/data-table"
import { getPreSaleColumns } from "@/features/pre-sale/pre-sale-columns"
import type { PreSaleRecord } from "@/types/pre-sale"

type PreSaleDataTableProps = {
  data: PreSaleRecord[]
  emptyMessage?: string
  onCopy: (record: PreSaleRecord) => void
  onDelete: (record: PreSaleRecord) => void
}

export function PreSaleDataTable({
  data,
  emptyMessage = "No record found",
  onCopy,
  onDelete,
}: PreSaleDataTableProps) {
  const columns = useMemo(
    () => getPreSaleColumns({ onCopy, onDelete }),
    [onCopy, onDelete]
  )

  return (
    <DataTable
      columns={columns}
      data={data}
      emptyMessage={emptyMessage}
      entityLabel="records"
      pageSize={10}
    />
  )
}
