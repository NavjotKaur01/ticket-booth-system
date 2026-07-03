import { useMemo } from "react"

import type { StandardRowAction } from "@/components/common/standard-row-actions-menu"
import { DataTable } from "@/components/data-table/data-table"
import { createSystemDefaultColumns } from "@/features/system-defaults/system-defaults-columns"
import type { SystemDefault } from "@/types/system-default"

type SystemDefaultsDataTableProps = {
  data: SystemDefault[]
  hiddenActions?: readonly StandardRowAction[]
  editingRecordId?: string | null
  onEdit?: (record: SystemDefault) => void
  onCancelEdit?: () => void
  onSaveValue?: (record: SystemDefault, value: string) => void
}

export function SystemDefaultsDataTable({
  data,
  hiddenActions,
  editingRecordId = null,
  onEdit,
  onCancelEdit,
  onSaveValue,
}: SystemDefaultsDataTableProps) {
  const columns = useMemo(
    () =>
      createSystemDefaultColumns({
        hiddenActions,
        editingRecordId,
        onEdit,
        onCancelEdit,
        onSaveValue,
      }),
    [editingRecordId, hiddenActions, onCancelEdit, onEdit, onSaveValue]
  )

  return (
    <DataTable
      columns={columns}
      data={data}
      emptyMessage="No record found"
      entityLabel="records"
      pageSize={10}
      onRowDoubleClick={(row) => onEdit?.(row.original)}
      getRowClassName={(row) =>
        row.id === editingRecordId ? "bg-muted hover:bg-muted" : undefined
      }
    />
  )
}
