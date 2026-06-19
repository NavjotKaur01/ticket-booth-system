import type { ColumnDef } from "@tanstack/react-table"

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { dataTableActionsColumn } from "@/components/data-table/data-table-actions-column"
import { formatCurrency } from "@/lib/format-currency"
import { cn } from "@/lib/utils"
import type { Transaction } from "@/types/transaction"

export const transactionColumns: ColumnDef<Transaction>[] = [
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
    accessorKey: "businessName",
    header: ({ column }) => (
      <DataTableColumnHeader label="Business Name" column={column} />
    ),
    cell: ({ row }) => row.original.businessName || "\u00A0",
  },
  {
    accessorKey: "source",
    header: ({ column }) => (
      <DataTableColumnHeader label="Source" column={column} />
    ),
  },
  {
    accessorKey: "createdBy",
    header: ({ column }) => (
      <DataTableColumnHeader label="Created By" column={column} />
    ),
  },
  {
    accessorKey: "createdDt",
    header: ({ column }) => (
      <DataTableColumnHeader label="Created Dt" column={column} />
    ),
    cell: ({ row }) => (
      <span className="whitespace-nowrap tabular-nums">{row.original.createdDt}</span>
    ),
  },
  {
    accessorKey: "paymentStatus",
    header: ({ column }) => (
      <DataTableColumnHeader label="Payment Status" column={column} />
    ),
  },
  {
    accessorKey: "paymentType",
    header: ({ column }) => (
      <DataTableColumnHeader label="Payment Type" column={column} />
    ),
  },
  {
    accessorKey: "ccType",
    header: ({ column }) => (
      <DataTableColumnHeader label="CCType" column={column} />
    ),
    cell: ({ row }) => row.original.ccType || "\u00A0",
  },
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <div className="flex justify-end">
        <DataTableColumnHeader label="Amount" column={column} />
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
  dataTableActionsColumn<Transaction>({
    ariaLabel: "Transaction actions",
  }),
]
