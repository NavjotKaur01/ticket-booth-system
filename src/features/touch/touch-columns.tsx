import type { ColumnDef } from "@tanstack/react-table"

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { dataTableActionsColumn } from "@/components/data-table/data-table-actions-column"
import type { TouchReservation } from "@/types/touch"

export const touchColumns: ColumnDef<TouchReservation>[] = [
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
    accessorKey: "source",
    header: ({ column }) => (
      <DataTableColumnHeader label="Source" column={column} />
    ),
  },
  {
    accessorKey: "tables",
    header: ({ column }) => (
      <DataTableColumnHeader label="Table(s)" column={column} />
    ),
    cell: ({ row }) => row.original.tables || "\u00A0",
  },
  {
    accessorKey: "seatNo",
    header: ({ column }) => (
      <DataTableColumnHeader label="Seat No" column={column} />
    ),
    cell: ({ row }) => row.original.seatNo || "\u00A0",
  },
  {
    accessorKey: "notes",
    header: ({ column }) => (
      <DataTableColumnHeader label="Notes" column={column} />
    ),
    cell: ({ row }) => row.original.notes || "\u00A0",
  },
  {
    accessorKey: "promo",
    header: ({ column }) => (
      <DataTableColumnHeader label="Promo" column={column} />
    ),
    cell: ({ row }) => row.original.promo || "\u00A0",
  },
  {
    accessorKey: "dinner",
    header: ({ column }) => (
      <DataTableColumnHeader label="Dinner" column={column} />
    ),
  },
  {
    accessorKey: "section",
    header: ({ column }) => (
      <DataTableColumnHeader label="Section" column={column} />
    ),
  },
  {
    accessorKey: "qty",
    header: ({ column }) => (
      <DataTableColumnHeader label="Qty" column={column} />
    ),
    cell: ({ row }) => (
      <span className="tabular-nums">{row.original.qty}</span>
    ),
  },
  {
    accessorKey: "seated",
    header: ({ column }) => (
      <DataTableColumnHeader label="Seated" column={column} />
    ),
    cell: ({ row }) => (
      <span className="tabular-nums">{row.original.seated}</span>
    ),
  },
  {
    accessorKey: "total",
    header: ({ column }) => (
      <DataTableColumnHeader label="Total" column={column} />
    ),
    cell: ({ row }) => (
      <span className="font-medium tabular-nums">{row.original.total}</span>
    ),
  },
  {
    accessorKey: "paid",
    header: ({ column }) => (
      <DataTableColumnHeader label="Paid" column={column} />
    ),
    cell: ({ row }) => (
      <span className="font-medium tabular-nums text-emerald-600">
        {row.original.paid}
      </span>
    ),
  },
  {
    accessorKey: "createdBy",
    header: ({ column }) => (
      <DataTableColumnHeader label="CreatedBy" column={column} />
    ),
  },
  {
    accessorKey: "createdDt",
    header: ({ column }) => (
      <DataTableColumnHeader label="CreatedDt" column={column} />
    ),
    cell: ({ row }) => (
      <span className="whitespace-nowrap tabular-nums">{row.original.createdDt}</span>
    ),
  },
  dataTableActionsColumn<TouchReservation>({
    ariaLabel: "Reservation actions",
  }),
]
