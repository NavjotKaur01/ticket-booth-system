import type { ColumnDef } from "@tanstack/react-table"

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { createSelectColumn } from "@/components/data-table/data-table-select-column"
import type { Reservation } from "@/types/reservation"
import { cn } from "@/lib/utils"

/** Column definitions for the reservations table — extend here when adding fields. */
export const reservationColumns: ColumnDef<Reservation>[] = [
  createSelectColumn<Reservation>(),
  {
    id: "guest",
    accessorFn: (row) => `${row.firstName} ${row.lastName}`,
    header: ({ column }) => (
      <DataTableColumnHeader label="Guest" column={column} />
    ),
    cell: ({ row }) => {
      const { firstName, lastName, businessName } = row.original
      return (
        <div>
          <p className="font-medium text-foreground">
            {firstName} {lastName}
          </p>
          {businessName && (
            <p className="text-xs text-muted-foreground">{businessName}</p>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader label="Email" column={column} />
    ),
    cell: ({ row }) => (
      <a
        href={`mailto:${row.original.email}`}
        className="font-medium text-primary hover:underline cursor-pointer"
      >
        {row.original.email}
      </a>
    ),
  },
  {
    accessorKey: "source",
    header: ({ column }) => (
      <DataTableColumnHeader label="Source" column={column} />
    ),
    cell: ({ row }) => (
      <span
        className={cn(
          "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
          row.original.source === "Web" &&
            "bg-red-50 text-red-600 dark:bg-red-950/30",
          row.original.source === "Phone" &&
            "bg-blue-50 text-blue-600 dark:bg-blue-950/30",
          row.original.source === "Walkup" &&
            "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30"
        )}
      >
        {row.original.source}
      </span>
    ),
  },
  {
    accessorKey: "section",
    header: ({ column }) => (
      <DataTableColumnHeader label="Section" column={column} />
    ),
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.section}</span>
    ),
  },
  {
    accessorKey: "qty",
    header: ({ column }) => (
      <DataTableColumnHeader label="Qty" column={column} />
    ),
    cell: ({ row }) => (
      <span className="font-medium tabular-nums">{row.original.qty}</span>
    ),
  },
  {
    accessorKey: "total",
    header: ({ column }) => (
      <DataTableColumnHeader label="Total" column={column} />
    ),
    cell: ({ row }) => (
      <span className="font-semibold tabular-nums">{row.original.total}</span>
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
    accessorKey: "createdDt",
    header: ({ column }) => (
      <DataTableColumnHeader label="Created" column={column} />
    ),
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.createdDt}</span>
    ),
  },
  {
    accessorKey: "seated",
    header: "Seated",
    cell: ({ row }) => (
      <span className="tabular-nums text-muted-foreground">
        {row.original.seated}
      </span>
    ),
  },
]
