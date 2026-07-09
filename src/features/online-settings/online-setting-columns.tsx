import type { ColumnDef } from "@tanstack/react-table"

import type { StandardRowAction } from "@/components/common/standard-row-actions-menu"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { dataTableActionsColumn } from "@/components/data-table/data-table-actions-column"
import type { OnlineSetting } from "@/types/online-setting"

type GetOnlineSettingColumnsParams = {
  onEdit: (record: OnlineSetting) => void
  onDelete: (record: OnlineSetting) => void
}

export function getOnlineSettingColumns({
  onEdit,
  onDelete,
}: GetOnlineSettingColumnsParams): ColumnDef<OnlineSetting>[] {
  return [
    {
      accessorKey: "settingsName",
      header: ({ column }) => (
        <DataTableColumnHeader label="Settings Name" column={column} />
      ),
      cell: ({ row }) => (
        <span className="font-medium text-foreground">{row.original.settingsName}</span>
      ),
    },
    {
      accessorKey: "defaultValue",
      header: ({ column }) => (
        <DataTableColumnHeader label="Default Value" column={column} />
      ),
      cell: ({ row }) => (
        <span className="block max-w-[420px] truncate text-muted-foreground">
          {row.original.defaultValue}
        </span>
      ),
    },
    dataTableActionsColumn<OnlineSetting>({
      ariaLabel: "Online setting actions",
      hiddenActions: ["Add"] satisfies readonly StandardRowAction[],
      onAction: (record, action) => {
        if (action === "Edit") {
          onEdit(record)
          return
        }
        if (action === "Delete") {
          onDelete(record)
        }
      },
    }),
  ]
}
