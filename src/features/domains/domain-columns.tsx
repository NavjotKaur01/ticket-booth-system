import type { ColumnDef } from "@tanstack/react-table"

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { Button } from "@/components/ui/button"
import type { Domain } from "@/types/domain"

type GetDomainColumnsParams = {
  onEdit: (domain: Domain) => void
}

export function getDomainColumns({
  onEdit,
}: GetDomainColumnsParams): ColumnDef<Domain>[] {
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
      accessorKey: "domainName",
      header: ({ column }) => (
        <DataTableColumnHeader label="Domain Name" column={column} />
      ),
      cell: ({ row }) => (
        <span className="font-medium text-foreground">{row.original.domainName}</span>
      ),
    },
    {
      accessorKey: "locationId",
      header: ({ column }) => (
        <DataTableColumnHeader label="Location ID" column={column} />
      ),
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.original.locationId}
        </span>
      ),
    },
    {
      accessorKey: "activeIndicator",
      header: ({ column }) => (
        <DataTableColumnHeader label="Active Indicator" column={column} />
      ),
    },
    {
      accessorKey: "processingOrder",
      header: ({ column }) => (
        <DataTableColumnHeader label="Processing Order" column={column} />
      ),
      cell: ({ row }) => (
        <span className="tabular-nums">{row.original.processingOrder}</span>
      ),
    },
  ]
}
