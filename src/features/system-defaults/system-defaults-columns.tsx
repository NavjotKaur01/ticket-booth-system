import type { ColumnDef } from "@tanstack/react-table"

import type { StandardRowAction } from "@/components/common/standard-row-actions-menu"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { dataTableActionsColumn } from "@/components/data-table/data-table-actions-column"
import { SystemDefaultValuePopover } from "@/features/system-defaults/system-default-value-popover"
import type { SystemDefault } from "@/types/system-default"

type SystemDefaultColumnsOptions = {
  hiddenActions?: readonly StandardRowAction[]
  editingRecordId?: string | null
  onEdit?: (record: SystemDefault) => void
  onCancelEdit?: () => void
  onSaveValue?: (record: SystemDefault, value: string) => void
}

export function createSystemDefaultColumns({
  hiddenActions,
  editingRecordId = null,
  onEdit,
  onCancelEdit,
  onSaveValue,
}: SystemDefaultColumnsOptions = {}): ColumnDef<SystemDefault>[] {
  return [
  {
    accessorKey: "screen",
    header: ({ column }) => (
      <DataTableColumnHeader label="Screen" column={column} />
    ),
    cell: ({ row }) => (
      <span className="font-medium text-foreground">{row.original.screen}</span>
    ),
  },
  {
    accessorKey: "description",
    header: ({ column }) => (
      <DataTableColumnHeader label="Description" column={column} />
    ),
  },
  {
    accessorKey: "defaultValue",
    header: ({ column }) => (
      <div className="flex justify-center">
        <DataTableColumnHeader label="Default" column={column} />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex justify-center">
        <SystemDefaultValuePopover
          record={row.original}
          open={editingRecordId === row.original.id}
          onOpenChange={(open) => {
            if (open) {
              onEdit?.(row.original)
              return
            }

            onCancelEdit?.()
          }}
          onSave={(record, value) => onSaveValue?.(record, value)}
        />
      </div>
    ),
  },
  {
    accessorKey: "lastUpdateId",
    header: ({ column }) => (
      <DataTableColumnHeader label="Last Update" column={column} />
    ),
  },
  {
    accessorKey: "lastUpdateDt",
    header: ({ column }) => (
      <DataTableColumnHeader label="Last Update Dt" column={column} />
    ),
    cell: ({ row }) => (
      <span className="whitespace-nowrap tabular-nums">
        {row.original.lastUpdateDt}
      </span>
    ),
  },
    dataTableActionsColumn<SystemDefault>({
      ariaLabel: "System default actions",
      hiddenActions,
      onAction: (record, action) => {
        if (action === "Edit") {
          onEdit?.(record)
        }
      },
    }),
  ]
}
