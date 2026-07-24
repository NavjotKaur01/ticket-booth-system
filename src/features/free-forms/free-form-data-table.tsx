import { useMemo } from "react"

import { DataTable } from "@/components/data-table/data-table"
import { getFreeFormColumns } from "@/features/free-forms/free-form-columns"
import type { FreeFormRecord } from "@/types/free-form"

type FreeFormDataTableProps = {
  data: FreeFormRecord[]
  loading?: boolean
  emptyMessage?: string
  onEdit: (row: FreeFormRecord) => void
  onDelete: (row: FreeFormRecord) => void
}

export function FreeFormDataTable({
  data,
  loading = false,
  emptyMessage = "No record found",
  onEdit,
  onDelete,
}: FreeFormDataTableProps) {
  const columns = useMemo(
    () => getFreeFormColumns({ onEdit, onDelete }),
    [onEdit, onDelete]
  )

  return (
    <DataTable
      columns={columns}
      data={data}
      emptyMessage={loading ? "Loading free forms..." : emptyMessage}
      entityLabel="records"
      pageSize={10}
      getRowId={(row) => row.id}
    />
  )
}
