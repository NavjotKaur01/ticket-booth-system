import type { ColumnDef } from "@tanstack/react-table"

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { Button } from "@/components/ui/button"
import type { ReservationDefault } from "@/types/reservation-default"

type GetReservationDefaultColumnsParams = {
  onEdit: (record: ReservationDefault) => void
}

export function getReservationDefaultColumns({
  onEdit,
}: GetReservationDefaultColumnsParams): ColumnDef<ReservationDefault>[] {
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
      accessorKey: "defaultName",
      header: ({ column }) => (
        <DataTableColumnHeader label="Default Name" column={column} />
      ),
      cell: ({ row }) => (
        <span className="font-medium text-foreground">{row.original.defaultName}</span>
      ),
    },
    {
      accessorKey: "defaultValue",
      header: ({ column }) => (
        <DataTableColumnHeader label="Default Value" column={column} />
      ),
      cell: ({ row }) => (
        <span className="block max-w-[280px] truncate text-muted-foreground">
          {row.original.defaultValue}
        </span>
      ),
    },
    {
      accessorKey: "description",
      header: ({ column }) => (
        <DataTableColumnHeader label="Description" column={column} />
      ),
      cell: ({ row }) => (
        <span className="block max-w-[220px] truncate">{row.original.description}</span>
      ),
    },
    {
      accessorKey: "active",
      header: ({ column }) => (
        <DataTableColumnHeader label="Active" column={column} />
      ),
    },
    {
      accessorKey: "showClub",
      header: ({ column }) => (
        <DataTableColumnHeader label="Show Club" column={column} />
      ),
    },
    {
      accessorKey: "screen",
      header: ({ column }) => (
        <DataTableColumnHeader label="Screen" column={column} />
      ),
      cell: ({ row }) => <span className="tabular-nums">{row.original.screen}</span>,
    },
    {
      accessorKey: "defaultType",
      header: ({ column }) => (
        <DataTableColumnHeader label="Default Type" column={column} />
      ),
    },
    {
      accessorKey: "updatedBy",
      header: ({ column }) => (
        <DataTableColumnHeader label="Updated By" column={column} />
      ),
    },
    {
      accessorKey: "updatedDate",
      header: ({ column }) => (
        <DataTableColumnHeader label="Updated Date" column={column} />
      ),
      cell: ({ row }) => (
        <span className="whitespace-nowrap tabular-nums">{row.original.updatedDate}</span>
      ),
    },
  ]
}
