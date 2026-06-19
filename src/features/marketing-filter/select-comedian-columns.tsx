import type { ColumnDef } from "@tanstack/react-table"

import { createSelectColumn } from "@/components/data-table/data-table-select-column"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { getComicName } from "@/lib/filter-performers"
import type { Performer } from "@/types/performer"

export const selectComedianColumns: ColumnDef<Performer>[] = [
  createSelectColumn<Performer>(),
  {
    id: "comicName",
    accessorFn: (row) => getComicName(row),
    header: ({ column }) => (
      <DataTableColumnHeader label="Comic Name" column={column} />
    ),
    cell: ({ row }) => (
      <span className="font-medium text-foreground">
        {getComicName(row.original)}
      </span>
    ),
  },
  {
    accessorKey: "lastName",
    header: ({ column }) => (
      <DataTableColumnHeader label="Last Name" column={column} />
    ),
    cell: ({ row }) => row.original.lastName || "\u00A0",
  },
  {
    accessorKey: "firstName",
    header: ({ column }) => (
      <DataTableColumnHeader label="First Name" column={column} />
    ),
    cell: ({ row }) => row.original.firstName || "\u00A0",
  },
  {
    accessorKey: "stageName",
    header: ({ column }) => (
      <DataTableColumnHeader label="Stage Name" column={column} />
    ),
    cell: ({ row }) => row.original.stageName || "\u00A0",
  },
]
