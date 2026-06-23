import type { ColumnDef } from "@tanstack/react-table"

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import type {
  ReservationBusinessSearchResult,
  ReservationCustomerSearchResult,
} from "@/data/reservation-search-results"

function formatPersonName (firstName: string, lastName: string) {
  return `${firstName} ${lastName}`.trim()
}

export const reservationCustomerSearchColumns: ColumnDef<ReservationCustomerSearchResult>[] =
  [
    {
      id: "name",
      accessorFn: row => formatPersonName(row.firstName, row.lastName),
      header: ({ column }) => (
        <DataTableColumnHeader label="Name" column={column} />
      ),
      cell: ({ row }) => (
        <span className="font-medium text-foreground">
          {formatPersonName(row.original.firstName, row.original.lastName)}
        </span>
      ),
    },
    {
      accessorKey: "phoneNo",
      header: ({ column }) => (
        <DataTableColumnHeader label="Phone No." column={column} />
      ),
      cell: ({ row }) => (
        <span className="whitespace-nowrap tabular-nums">
          {row.original.phoneNo}
        </span>
      ),
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <DataTableColumnHeader label="Email" column={column} />
      ),
      cell: ({ row }) => (
        <a
          href={`mailto:${row.original.email}`}
          className="cursor-pointer font-medium text-primary hover:underline"
        >
          {row.original.email}
        </a>
      ),
    },
  ]

export const reservationBusinessSearchColumns: ColumnDef<ReservationBusinessSearchResult>[] =
  [
    {
      accessorKey: "businessName",
      header: ({ column }) => (
        <DataTableColumnHeader label="Business Name" column={column} />
      ),
      cell: ({ row }) => (
        <span className="font-medium text-foreground">
          {row.original.businessName}
        </span>
      ),
    },
    {
      id: "name",
      accessorFn: row => formatPersonName(row.firstName, row.lastName),
      header: ({ column }) => (
        <DataTableColumnHeader label="Name" column={column} />
      ),
      cell: ({ row }) => (
        <span className="font-medium text-foreground">
          {formatPersonName(row.original.firstName, row.original.lastName)}
        </span>
      ),
    },
    {
      accessorKey: "phoneNo",
      header: ({ column }) => (
        <DataTableColumnHeader label="Phone No." column={column} />
      ),
      cell: ({ row }) => (
        <span className="whitespace-nowrap tabular-nums">
          {row.original.phoneNo}
        </span>
      ),
    },
  ]
