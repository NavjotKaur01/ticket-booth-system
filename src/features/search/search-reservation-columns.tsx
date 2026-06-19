import type { ColumnDef } from "@tanstack/react-table"

import { RowActionsMenu } from "@/components/common/row-actions-menu"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import type { ReservationSearchResult } from "@/types/search-reservation"

export const searchReservationColumns: ColumnDef<ReservationSearchResult>[] = [
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader label="Status" column={column} />
    ),
  },
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
    accessorKey: "phone",
    header: ({ column }) => (
      <DataTableColumnHeader label="Phone" column={column} />
    ),
    cell: ({ row }) => (
      <span className="whitespace-nowrap tabular-nums">{row.original.phone}</span>
    ),
  },
  {
    accessorKey: "showDate",
    header: ({ column }) => (
      <DataTableColumnHeader label="Show Date" column={column} />
    ),
    cell: ({ row }) => (
      <span className="whitespace-nowrap tabular-nums">{row.original.showDate}</span>
    ),
  },
  {
    accessorKey: "comedian",
    header: ({ column }) => (
      <DataTableColumnHeader label="Comedian" column={column} />
    ),
  },
  {
    accessorKey: "qty",
    header: ({ column }) => (
      <div className="flex justify-end">
        <DataTableColumnHeader label="QTY" column={column} />
      </div>
    ),
    cell: ({ row }) => (
      <span className="block text-right tabular-nums">{row.original.qty}</span>
    ),
  },
  {
    accessorKey: "price",
    header: ({ column }) => (
      <div className="flex justify-end">
        <DataTableColumnHeader label="Price" column={column} />
      </div>
    ),
    cell: ({ row }) => (
      <span className="block text-right tabular-nums">{row.original.price}</span>
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
      <span className="block text-right tabular-nums">{row.original.total}</span>
    ),
  },
  {
    id: "actions",
    header: () => null,
    cell: () => <RowActionsMenu />,
    meta: { sticky: "right" },
    enableSorting: false,
  },
]
