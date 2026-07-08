import type { ColumnDef } from "@tanstack/react-table"

import type { StandardRowAction } from "@/components/common/standard-row-actions-menu"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { dataTableActionsColumn } from "@/components/data-table/data-table-actions-column"
import type { NavigationManagementRecord } from "@/types/navigation-admin"

type GetNavigationManagementColumnsParams = {
  onEdit: (record: NavigationManagementRecord) => void
  onDelete: (record: NavigationManagementRecord) => void
}

export function getNavigationManagementColumns({
  onEdit,
  onDelete,
}: GetNavigationManagementColumnsParams): ColumnDef<NavigationManagementRecord>[] {
  return [
    {
      accessorKey: "menu",
      header: ({ column }) => <DataTableColumnHeader label="Menu" column={column} />,
      cell: ({ row }) => (
        <span
          className="font-medium text-foreground"
          style={{ paddingLeft: `${row.original.level * 12}px` }}
        >
          {row.original.menu}
        </span>
      ),
    },
    {
      accessorKey: "navigationUrl",
      header: ({ column }) => (
        <DataTableColumnHeader label="Navigation URL" column={column} />
      ),
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {row.original.navigationUrl || "—"}
        </span>
      ),
    },
    {
      accessorKey: "level",
      header: ({ column }) => <DataTableColumnHeader label="Level" column={column} />,
      cell: ({ row }) => (
        <span className="tabular-nums text-foreground">{row.original.level}</span>
      ),
    },
    {
      accessorKey: "order",
      header: ({ column }) => <DataTableColumnHeader label="Order" column={column} />,
      cell: ({ row }) => (
        <span className="tabular-nums text-foreground">{row.original.order}</span>
      ),
    },
    {
      accessorKey: "active",
      header: ({ column }) => <DataTableColumnHeader label="Active" column={column} />,
    },
    {
      accessorKey: "updatedBy",
      header: ({ column }) => (
        <DataTableColumnHeader label="Updated By" column={column} />
      ),
    },
    {
      accessorKey: "parentMenu",
      header: ({ column }) => (
        <DataTableColumnHeader label="Parent Menu" column={column} />
      ),
      cell: ({ row }) => row.original.parentMenu || "—",
    },
    dataTableActionsColumn<NavigationManagementRecord>({
      ariaLabel: "Navigation menu actions",
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
