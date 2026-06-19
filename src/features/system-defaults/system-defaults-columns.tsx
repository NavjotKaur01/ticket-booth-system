import type { ColumnDef } from "@tanstack/react-table"

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import type { SystemDefault } from "@/types/system-default"

export const systemDefaultColumns: ColumnDef<SystemDefault>[] = [
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
]
