import type { ColumnDef } from "@tanstack/react-table"

import type { StandardRowAction } from "@/components/common/standard-row-actions-menu"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { dataTableActionsColumn } from "@/components/data-table/data-table-actions-column"
import type { Domain } from "@/types/domain"

type GetDomainColumnsParams = {
  onEdit: (domain: Domain) => void
  onDelete: (domain: Domain) => void
}

export function getDomainColumns({
  onEdit,
  onDelete,
}: GetDomainColumnsParams): ColumnDef<Domain>[] {
  return [
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
    dataTableActionsColumn<Domain>({
      ariaLabel: "Domain actions",
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
