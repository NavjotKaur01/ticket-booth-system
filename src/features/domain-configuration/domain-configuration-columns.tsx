import type { ColumnDef } from "@tanstack/react-table"

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { Button } from "@/components/ui/button"
import type { DomainConfiguration } from "@/types/domain-configuration"

type GetDomainConfigurationColumnsParams = {
  onEdit: (record: DomainConfiguration) => void
}

export function getDomainConfigurationColumns({
  onEdit,
}: GetDomainConfigurationColumnsParams): ColumnDef<DomainConfiguration>[] {
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
      accessorKey: "serverIp",
      header: ({ column }) => (
        <DataTableColumnHeader label="Server IP" column={column} />
      ),
      cell: ({ row }) => (
        <span className="font-medium tabular-nums text-foreground">
          {row.original.serverIp}
        </span>
      ),
    },
    {
      accessorKey: "serverName",
      header: ({ column }) => (
        <DataTableColumnHeader label="Server Name" column={column} />
      ),
    },
    {
      accessorKey: "activeIndicator",
      header: ({ column }) => (
        <DataTableColumnHeader label="Active Indicator" column={column} />
      ),
    },
  ]
}
