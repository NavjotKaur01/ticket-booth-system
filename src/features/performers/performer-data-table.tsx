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
  onToggleHidden: (performer: Performer, hidden: boolean) => void
  emptyMessage?: string
}

export function PerformerDataTable({
  data,
  rowSelection,
  onRowSelectionChange,
  onEdit,
  onDelete,
  onToggleHidden,
  emptyMessage = "No data to display",
}: PerformerDataTableProps) {
  const columns = useMemo(
    () => getPerformerColumns({ onEdit, onDelete, onToggleHidden }),
    [onEdit, onDelete, onToggleHidden]
  )

  return (
    <DataTable
      columns={columns}
      data={data}
      emptyMessage={emptyMessage}
      entityLabel="performers"
      pageSize={10}
      enableRowSelection
      enableMultiRowSelection
      rowSelection={rowSelection}
      onRowSelectionChange={onRowSelectionChange}
      getRowId={(row) => row.id}
    />
  )
}
