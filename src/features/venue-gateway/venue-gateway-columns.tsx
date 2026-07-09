import type { ColumnDef } from "@tanstack/react-table"

import type { StandardRowAction } from "@/components/common/standard-row-actions-menu"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { dataTableActionsColumn } from "@/components/data-table/data-table-actions-column"
import type { VenueGateway } from "@/types/venue-gateway"

type GetVenueGatewayColumnsParams = {
  onEdit: (record: VenueGateway) => void
  onDelete: (record: VenueGateway) => void
}

export function getVenueGatewayColumns({
  onEdit,
  onDelete,
}: GetVenueGatewayColumnsParams): ColumnDef<VenueGateway>[] {
  return [
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
    dataTableActionsColumn<VenueGateway>({
      ariaLabel: "Venue gateway actions",
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
