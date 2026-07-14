import { useMemo } from "react"

import type { StandardRowAction } from "@/components/common/standard-row-actions-menu"
import { DataTable } from "@/components/data-table/data-table"
import { createSystemDefaultColumns } from "@/features/system-defaults/system-defaults-columns"
import type { SystemDefault } from "@/types/system-default"

type SystemDefaultsDataTableProps = {
  data: SystemDefault[]
  emptyMessage?: string
  hiddenActions?: readonly StandardRowAction[]
  editingRecordId?: string | null
  canEditDescription?: boolean
  onEdit?: (record: SystemDefault) => void
  onCancelEdit?: () => void
  onSaveValue?: (
    record: SystemDefault,
    value: string,
    description?: string
  ) => void
}

export function SystemDefaultsDataTable({
  data,
  emptyMessage = "No record found",
  hiddenActions,
  editingRecordId = null,
  canEditDescription = false,
  onEdit,
  onCancelEdit,
  onSaveValue,
}: SystemDefaultsDataTableProps) {
  const columns = useMemo(
    () =>
      createSystemDefaultColumns({
        hiddenActions,
        editingRecordId,
        canEditDescription,
        onEdit,
        onCancelEdit,
        onSaveValue,
      }),
    [
      canEditDescription,
      editingRecordId,
      hiddenActions,
      onCancelEdit,
      onEdit,
      onSaveValue,
    ]
  )

  return (
    <DataTable
      columns={columns}
      data={data}
      emptyMessage={emptyMessage}
      entityLabel="records"
      pageSize={10}
      onRowDoubleClick={(row) => onEdit?.(row.original)}
      getRowClassName={(row) =>
        row.id === editingRecordId ? "bg-muted hover:bg-muted" : undefined
      }
    />
  )
}
