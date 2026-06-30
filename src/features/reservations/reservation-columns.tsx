import type { ColumnDef } from "@tanstack/react-table"

import { RowActionsMenu } from "@/components/common/row-actions-menu"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { cn } from "@/lib/utils"
import type { Reservation } from "@/types/reservation"

type ReservationColumnsOptions = {
  onCancelReservation?: (reservation: Reservation) => void
  onPrintTickets?: (reservation: Reservation) => void
  onReservationHistory?: (reservation: Reservation) => void
}

/** Column definitions for the reservations table and row actions. */
export function createReservationColumns({
  onCancelReservation,
  onPrintTickets,
  onReservationHistory,
}: ReservationColumnsOptions = {}): ColumnDef<Reservation>[] {
  return [
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
          className="cursor-pointer font-medium text-primary hover:underline"
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
    {
      id: "actions",
      header: "Action",
      enableSorting: false,
      meta: { sticky: "right" },
      cell: ({ row }) => (
        <RowActionsMenu
          onCancelReservation={() => onCancelReservation?.(row.original)}
          onPrintTickets={() => onPrintTickets?.(row.original)}
          onPrintIndividualTickets={() => onPrintTickets?.(row.original)}
          onReservationHistory={() => onReservationHistory?.(row.original)}
        />
      ),
    },
  ]
}
