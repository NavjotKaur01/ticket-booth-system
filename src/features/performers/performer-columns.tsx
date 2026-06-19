import type { ColumnDef } from "@tanstack/react-table"

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { Checkbox } from "@/components/ui/checkbox"
import type { Performer } from "@/types/performer"

export const performerColumns: ColumnDef<Performer>[] = [
  {
    id: "select",
    header: () => <span className="sr-only">Selected</span>,
    cell: ({ row, table }) => (
      <input
        type="radio"
        name="performer-row-select"
        checked={row.getIsSelected()}
        onChange={() => table.setRowSelection({ [row.id]: true })}
        className="size-4 cursor-pointer accent-primary"
        aria-label={`Select ${row.original.stageName || "performer"}`}
      />
    ),
    enableSorting: false,
  },
  {
    accessorKey: "hidden",
    header: "Disable/Hide",
    cell: ({ row }) => (
      <Checkbox checked={row.original.hidden} aria-label="Disable or hide" />
    ),
    enableSorting: false,
  },
  {
    accessorKey: "firstName",
    header: ({ column }) => (
      <DataTableColumnHeader label="First Name" column={column} />
    ),
    cell: ({ row }) => (
      <span className="text-foreground">{row.original.firstName || "\u00A0"}</span>
    ),
  },
  {
    accessorKey: "lastName",
    header: ({ column }) => (
      <DataTableColumnHeader label="Last Name" column={column} />
    ),
    cell: ({ row }) => (
      <span className="text-foreground">{row.original.lastName || "\u00A0"}</span>
    ),
  },
  {
    accessorKey: "stageName",
    header: ({ column }) => (
      <DataTableColumnHeader label="Stage Name" column={column} />
    ),
    cell: ({ row }) => (
      <span className="font-medium text-foreground">{row.original.stageName}</span>
    ),
  },
]
