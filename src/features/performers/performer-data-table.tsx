import { useMemo } from "react"
import type { OnChangeFn, RowSelectionState } from "@tanstack/react-table"

import { DataTable } from "@/components/data-table/data-table"
import { getPerformerColumns } from "@/features/performers/performer-columns"
import type { Performer } from "@/types/performer"

type PerformerDataTableProps = {
  data: Performer[]
  rowSelection: RowSelectionState
  onRowSelectionChange: OnChangeFn<RowSelectionState>
  onEdit: (performer: Performer) => void
  onDelete: (performer: Performer) => void
}

export function PerformerDataTable({
  data,
  rowSelection,
  onRowSelectionChange,
  onEdit,
  onDelete,
}: PerformerDataTableProps) {
  const columns = useMemo(
    () => getPerformerColumns({ onEdit, onDelete }),
    [onEdit, onDelete]
  )

  return (
    <DataTable
      columns={columns}
      data={data}
      emptyMessage="No data to display"
      entityLabel="performers"
      pageSize={10}
      enableRowSelection
      enableMultiRowSelection={false}
      rowSelection={rowSelection}
      onRowSelectionChange={onRowSelectionChange}
      getRowId={(row) => row.id}
    />
  )
}
