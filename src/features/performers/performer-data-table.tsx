import type { OnChangeFn, RowSelectionState } from "@tanstack/react-table"

import { DataTable } from "@/components/data-table/data-table"
import { performerColumns } from "@/features/performers/performer-columns"
import type { Performer } from "@/types/performer"

type PerformerDataTableProps = {
  data: Performer[]
  rowSelection: RowSelectionState
  onRowSelectionChange: OnChangeFn<RowSelectionState>
}

export function PerformerDataTable({
  data,
  rowSelection,
  onRowSelectionChange,
}: PerformerDataTableProps) {
  return (
    <DataTable
      columns={performerColumns}
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
