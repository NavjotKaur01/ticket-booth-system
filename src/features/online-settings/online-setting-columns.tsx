import type { ColumnDef } from "@tanstack/react-table"

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { Button } from "@/components/ui/button"
import type { OnlineSetting } from "@/types/online-setting"

type GetOnlineSettingColumnsParams = {
  onEdit: (record: OnlineSetting) => void
}

export function getOnlineSettingColumns({
  onEdit,
}: GetOnlineSettingColumnsParams): ColumnDef<OnlineSetting>[] {
  return [
    {
      id: "edit",
      header: "#",
      enableSorting: false,
      cell: ({ row }) => (
        <Button
          type="button"
          variant="link"
          className="h-auto p-0 text-xs"
          onClick={() => onEdit(row.original)}
        >
          Edit
        </Button>
      ),
    },
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
  ]
}
