import type { ColumnDef } from "@tanstack/react-table"

import { RowActionsMenu } from "@/components/common/row-actions-menu"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { formatCurrency } from "@/lib/format-currency"
import { cn } from "@/lib/utils"
import type { PaymentHistoryRecord } from "@/types/payment-history"

export const paymentHistoryColumns: ColumnDef<PaymentHistoryRecord>[] = [
  {
    accessorKey: "lastName",
    header: ({ column }) => (
      <DataTableColumnHeader label="Last Name" column={column} />
    ),
    cell: ({ row }) => (
      <span className="font-medium text-foreground">{row.original.lastName}</span>
    ),
  },
  {
    accessorKey: "firstName",
    header: ({ column }) => (
      <DataTableColumnHeader label="First Name" column={column} />
    ),
  },
  {
    accessorKey: "pnref",
    header: ({ column }) => (
      <DataTableColumnHeader label="PNREF" column={column} />
    ),
    cell: ({ row }) => (
      <span className="font-mono text-xs">{row.original.pnref}</span>
    ),
  },
  {
    accessorKey: "lastUpdateDate",
    header: ({ column }) => (
      <DataTableColumnHeader label="Last Update Date" column={column} />
    ),
    cell: ({ row }) => (
      <span className="whitespace-nowrap tabular-nums">
        {row.original.lastUpdateDate}
      </span>
    ),
  },
  {
    accessorKey: "transactionType",
    header: ({ column }) => (
      <DataTableColumnHeader label="Transaction Type" column={column} />
    ),
  },
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <div className="flex justify-end">
        <DataTableColumnHeader label="AMT" column={column} />
      </div>
    ),
    cell: ({ row }) => (
      <span
        className={cn(
          "block text-right tabular-nums",
          row.original.amount < 0 && "text-destructive"
        )}
      >
        {formatCurrency(row.original.amount)}
      </span>
    ),
  },
  {
    accessorKey: "responseMessage",
    header: ({ column }) => (
      <DataTableColumnHeader label="RESPMSG" column={column} />
    ),
  },
  {
    id: "actions",
    header: "Action",
    enableSorting: false,
    cell: () => <RowActionsMenu />,
  },
]
