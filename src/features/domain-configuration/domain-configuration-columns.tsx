import type { ColumnDef } from "@tanstack/react-table"

import type { StandardRowAction } from "@/components/common/standard-row-actions-menu"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { dataTableActionsColumn } from "@/components/data-table/data-table-actions-column"
import type { DomainConfiguration } from "@/types/domain-configuration"

type GetDomainConfigurationColumnsParams = {
  onEdit: (record: DomainConfiguration) => void
  onDelete: (record: DomainConfiguration) => void
}

export function getDomainConfigurationColumns({
  onEdit,
  onDelete,
}: GetDomainConfigurationColumnsParams): ColumnDef<DomainConfiguration>[] {
  return [
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
    dataTableActionsColumn<DomainConfiguration>({
      ariaLabel: "Domain configuration actions",
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
