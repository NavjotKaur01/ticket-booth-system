import type { ColumnDef } from "@tanstack/react-table"

import { dataTableActionsColumn } from "@/components/data-table/data-table-actions-column"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { formatCurrency } from "@/lib/format-currency"
import type { RecentSalesActivityRecord } from "@/types/today-sales-report"

function emptyCell(value: string) {
  return value || "\u00A0"
}

export const recentSalesActivityColumns: ColumnDef<RecentSalesActivityRecord>[] =
  [
    {
      accessorKey: "agent",
      header: ({ column }) => (
        <DataTableColumnHeader label="Agent" column={column} />
      ),
    },
    {
      accessorKey: "customer",
      header: ({ column }) => (
        <DataTableColumnHeader label="Customer" column={column} />
      ),
      cell: ({ row }) => (
        <span className="font-medium text-foreground">
          {row.original.customer}
        </span>
      ),
    },
    {
      accessorKey: "show",
      header: ({ column }) => (
        <DataTableColumnHeader label="Show" column={column} />
      ),
    },
    {
      accessorKey: "qty",
      header: ({ column }) => (
        <div className="flex justify-end">
          <DataTableColumnHeader label="Qty" column={column} />
        </div>
      ),
      cell: ({ row }) => (
        <span className="block text-right tabular-nums">{row.original.qty}</span>
      ),
    },
    {
      accessorKey: "total",
      header: ({ column }) => (
        <div className="flex justify-end">
          <DataTableColumnHeader label="Total" column={column} />
        </div>
      ),
      cell: ({ row }) => (
        <span className="block text-right tabular-nums">
          {formatCurrency(row.original.total)}
        </span>
      ),
    },
    {
      accessorKey: "paymentType",
      header: ({ column }) => (
        <DataTableColumnHeader label="Payment Type" column={column} />
      ),
    },
    {
      accessorKey: "createdOn",
      header: ({ column }) => (
        <DataTableColumnHeader label="Created On" column={column} />
      ),
      cell: ({ row }) => (
        <span className="whitespace-nowrap tabular-nums">
          {row.original.createdOn}
        </span>
      ),
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <DataTableColumnHeader label="Email" column={column} />
      ),
    },
    {
      accessorKey: "comment",
      header: ({ column }) => (
        <DataTableColumnHeader label="Comment" column={column} />
      ),
      cell: ({ row }) => emptyCell(row.original.comment),
    },
    dataTableActionsColumn<RecentSalesActivityRecord>({
      ariaLabel: "Recent sale actions",
    }),
  ]
