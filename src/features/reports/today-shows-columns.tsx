import type { ColumnDef } from "@tanstack/react-table"

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { formatCurrency } from "@/lib/format-currency"
import type { TodayShowRecord } from "@/types/today-sales-report"

export const todayShowsColumns: ColumnDef<TodayShowRecord>[] = [
  {
    accessorKey: "showName",
    header: ({ column }) => (
      <DataTableColumnHeader label="Show Name" column={column} />
    ),
    cell: ({ row }) => (
      <span className="font-medium text-foreground">{row.original.showName}</span>
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
    accessorKey: "reservations",
    header: ({ column }) => (
      <div className="flex justify-end">
        <DataTableColumnHeader label="Reservations" column={column} />
      </div>
    ),
    cell: ({ row }) => (
      <span className="block text-right tabular-nums">
        {row.original.reservations}
      </span>
    ),
  },
  {
    accessorKey: "ticketsSold",
    header: ({ column }) => (
      <div className="flex justify-end">
        <DataTableColumnHeader label="Tickets Sold" column={column} />
      </div>
    ),
    cell: ({ row }) => (
      <span className="block text-right tabular-nums">
        {row.original.ticketsSold}
      </span>
    ),
  },
  {
    accessorKey: "revenue",
    header: ({ column }) => (
      <div className="flex justify-end">
        <DataTableColumnHeader label="Revenue" column={column} />
      </div>
    ),
    cell: ({ row }) => (
      <span className="block text-right tabular-nums">
        {formatCurrency(row.original.revenue)}
      </span>
    ),
  },
]
