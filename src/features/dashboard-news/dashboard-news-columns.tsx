import type { ColumnDef } from "@tanstack/react-table"

import type { StandardRowAction } from "@/components/common/standard-row-actions-menu"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { dataTableActionsColumn } from "@/components/data-table/data-table-actions-column"
import type { DashboardNewsItem } from "@/types/dashboard-news"

type GetDashboardNewsColumnsParams = {
  onEdit: (record: DashboardNewsItem) => void
  onDelete: (record: DashboardNewsItem) => void
}

export function getDashboardNewsColumns({
  onEdit,
  onDelete,
}: GetDashboardNewsColumnsParams): ColumnDef<DashboardNewsItem>[] {
  return [
    {
      accessorKey: "header",
      header: ({ column }) => <DataTableColumnHeader label="Header" column={column} />,
      cell: ({ row }) => (
        <span className="font-medium text-foreground">{row.original.header}</span>
      ),
    },
    {
      accessorKey: "date",
      header: ({ column }) => <DataTableColumnHeader label="Date" column={column} />,
      cell: ({ row }) => (
        <span className="whitespace-nowrap tabular-nums text-foreground">
          {row.original.date}
        </span>
      ),
    },
    {
      accessorKey: "startingDate",
      header: ({ column }) => (
        <DataTableColumnHeader label="Starting Date" column={column} />
      ),
      cell: ({ row }) => (
        <span className="whitespace-nowrap tabular-nums text-foreground">
          {row.original.startingDate}
        </span>
      ),
    },
    {
      accessorKey: "endingDate",
      header: ({ column }) => (
        <DataTableColumnHeader label="Ending Date" column={column} />
      ),
      cell: ({ row }) => (
        <span className="whitespace-nowrap tabular-nums text-foreground">
          {row.original.endingDate}
        </span>
      ),
    },
    dataTableActionsColumn<DashboardNewsItem>({
      ariaLabel: "Dashboard news actions",
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
