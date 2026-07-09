import type { ColumnDef } from "@tanstack/react-table"

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import type { TransactionLog } from "@/types/transaction-log"

export function getTransactionLogColumns(): ColumnDef<TransactionLog>[] {
  return [
    {
      accessorKey: "locationLabel",
      header: ({ column }) => (
        <DataTableColumnHeader label="Location" column={column} />
      ),
      cell: ({ row }) => row.original.locationLabel,
    },
    {
      accessorKey: "firstName",
      header: ({ column }) => (
        <DataTableColumnHeader label="First Name" column={column} />
      ),
      cell: ({ row }) => row.original.firstName || "—",
    },
    {
      accessorKey: "lastName",
      header: ({ column }) => (
        <DataTableColumnHeader label="Last Name" column={column} />
      ),
      cell: ({ row }) => row.original.lastName || "—",
    },
    {
      accessorKey: "email",
      header: ({ column }) => <DataTableColumnHeader label="Email" column={column} />,
      cell: ({ row }) => row.original.email,
    },
    {
      accessorKey: "transactionDate",
      header: ({ column }) => (
        <DataTableColumnHeader label="Transaction Date" column={column} />
      ),
      cell: ({ row }) => (
        <span className="whitespace-nowrap tabular-nums text-foreground">
          {row.original.transactionDate}
        </span>
      ),
    },
  ]
}
