import type { ColumnDef } from "@tanstack/react-table"

import type { StandardRowAction } from "@/components/common/standard-row-actions-menu"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { dataTableActionsColumn } from "@/components/data-table/data-table-actions-column"
import type { SystemDefault } from "@/types/system-default"

type SystemDefaultColumnsOptions = {
  hiddenActions?: readonly StandardRowAction[]
}

export function createSystemDefaultColumns({
  hiddenActions,
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
      <DataTableColumnHeader label="Default" column={column} />
    ),
    cell: ({ row }) => (
      <span className="block text-center tabular-nums">
        {row.original.defaultValue}
      </span>
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
    }),
  ]
}
