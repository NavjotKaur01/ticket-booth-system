import type { ColumnDef } from "@tanstack/react-table"

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { dataTableActionsColumn } from "@/components/data-table/data-table-actions-column"
import type { PastCustomerRecord } from "@/types/past-customer-report"

function emptyCell(value: string) {
  return value || "\u00A0"
}

export const pastCustomerColumns: ColumnDef<PastCustomerRecord>[] = [
  {
    accessorKey: "lastName",
    header: ({ column }) => (
      <DataTableColumnHeader label="LastName" column={column} />
    ),
    cell: ({ row }) => (
      <span className="font-medium text-foreground">{row.original.lastName}</span>
    ),
  },
  {
    accessorKey: "firstName",
    header: ({ column }) => (
      <DataTableColumnHeader label="FirstName" column={column} />
    ),
  },
  {
    accessorKey: "addr1",
    header: ({ column }) => (
      <DataTableColumnHeader label="Addr1" column={column} />
    ),
    cell: ({ row }) => emptyCell(row.original.addr1),
  },
  {
    accessorKey: "addr2",
    header: ({ column }) => (
      <DataTableColumnHeader label="Addr2" column={column} />
    ),
    cell: ({ row }) => emptyCell(row.original.addr2),
  },
  {
    accessorKey: "city",
    header: ({ column }) => (
      <DataTableColumnHeader label="City" column={column} />
    ),
    cell: ({ row }) => emptyCell(row.original.city),
  },
  {
    accessorKey: "state",
    header: ({ column }) => (
      <DataTableColumnHeader label="State" column={column} />
    ),
    cell: ({ row }) => emptyCell(row.original.state),
  },
  {
    accessorKey: "zip",
    header: ({ column }) => (
      <DataTableColumnHeader label="Zip" column={column} />
    ),
    cell: ({ row }) => (
      <span className="whitespace-nowrap tabular-nums">
        {emptyCell(row.original.zip)}
      </span>
    ),
  },
  {
    accessorKey: "country",
    header: ({ column }) => (
      <DataTableColumnHeader label="Country" column={column} />
    ),
    cell: ({ row }) => emptyCell(row.original.country),
  },
  {
    accessorKey: "phone",
    header: ({ column }) => (
      <DataTableColumnHeader label="Phone" column={column} />
    ),
    cell: ({ row }) => (
      <span className="whitespace-nowrap tabular-nums">
        {emptyCell(row.original.phone)}
      </span>
    ),
  },
  {
    accessorKey: "emailAddress",
    header: ({ column }) => (
      <DataTableColumnHeader label="Email Address" column={column} />
    ),
    cell: ({ row }) => emptyCell(row.original.emailAddress),
  },
  dataTableActionsColumn<PastCustomerRecord>({
    ariaLabel: "Past customer actions",
  }),
]
