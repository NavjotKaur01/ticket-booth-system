import type { ColumnDef } from "@tanstack/react-table"

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { Button } from "@/components/ui/button"
import type { VenueGateway } from "@/types/venue-gateway"

type GetVenueGatewayColumnsParams = {
  onEdit: (record: VenueGateway) => void
}

export function getVenueGatewayColumns({
  onEdit,
}: GetVenueGatewayColumnsParams): ColumnDef<VenueGateway>[] {
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
      accessorKey: "venue",
      header: ({ column }) => (
        <DataTableColumnHeader label="Venue" column={column} />
      ),
      cell: ({ row }) => (
        <span className="font-medium text-foreground">{row.original.venue}</span>
      ),
    },
    {
      accessorKey: "gateway",
      header: ({ column }) => (
        <DataTableColumnHeader label="Gateway" column={column} />
      ),
    },
    {
      accessorKey: "partner",
      header: ({ column }) => (
        <DataTableColumnHeader label="Partner" column={column} />
      ),
    },
    {
      accessorKey: "vendor",
      header: ({ column }) => (
        <DataTableColumnHeader label="Vendor" column={column} />
      ),
    },
    {
      accessorKey: "user",
      header: ({ column }) => (
        <DataTableColumnHeader label="User" column={column} />
      ),
      cell: ({ row }) => (
        <span className="max-w-[220px] truncate font-mono text-xs text-muted-foreground">
          {row.original.user}
        </span>
      ),
    },
    {
      accessorKey: "password",
      header: ({ column }) => (
        <DataTableColumnHeader label="Password" column={column} />
      ),
      cell: ({ row }) => (
        <span className="max-w-[220px] truncate font-mono text-xs text-muted-foreground">
          {row.original.password}
        </span>
      ),
    },
  ]
}
