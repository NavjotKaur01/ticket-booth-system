import type { ColumnDef } from "@tanstack/react-table"

import { RowActionsMenu } from "@/components/common/row-actions-menu"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { cn } from "@/lib/utils"
import type { Reservation } from "@/types/reservation"

type ReservationColumnsOptions = {
  displayPhone?: boolean
  onCancelReservation?: (reservation: Reservation) => void
  onUnCancelReservation?: (reservation: Reservation) => void
  onCheckIn?: (reservation: Reservation) => void
  onMoveReservation?: (reservation: Reservation) => void
  onPrintTickets?: (reservation: Reservation) => void
  onPrintIndividualTickets?: (reservation: Reservation) => void
  onPrintReceipt?: (reservation: Reservation) => void
  onReservationHistory?: (reservation: Reservation) => void
  onAddNote?: (reservation: Reservation) => void
  onPrintSignature?: (reservation: Reservation) => void
}

function emptyCell(value: string | number | null | undefined) {
  if (value == null || value === "") {
    return "—"
  }

  return value
}

function groupValues(values: string[], separator: string) {
  const lines: string[] = []

  for (let index = 0; index < values.length; index += 6) {
    lines.push(values.slice(index, index + 6).join(separator))
  }

  return lines.join("\n")
}

function formatSeatNumbers(value: string) {
  const encodedSeatNumbers = Array.from(
    value.matchAll(/#\d+\$(\d+)/g),
    match => match[1]
  )

  const seatNumbers =
    encodedSeatNumbers.length > 0
      ? encodedSeatNumbers
      : value
          .split("|")
          .map(seat => seat.trim())
          .filter(Boolean)

  return groupValues(seatNumbers, " | ")
}

function formatTableNumbers(value: string) {
  const tableNumbers = value
    .split(",")
    .map(table => table.trim())
    .filter(Boolean)

  return groupValues(tableNumbers, ", ")
}

/** Column definitions aligned with desktop ClubMan reservation grid. */
export function createReservationColumns({
  displayPhone = false,
  onCancelReservation,
  onUnCancelReservation,
  onCheckIn,
  onMoveReservation,
  onPrintTickets,
  onPrintIndividualTickets,
  onPrintReceipt,
  onReservationHistory,
  onAddNote,
  onPrintSignature,
}: ReservationColumnsOptions = {}): ColumnDef<Reservation>[] {
  const columns: ColumnDef<Reservation>[] = [
    {
      accessorKey: "lastName",
      header: ({ column }) => (
        <DataTableColumnHeader label="Last Name" column={column} />
      ),
      cell: ({ row }) => (
        <span className="font-medium text-foreground">
          {emptyCell(row.original.lastName)}
        </span>
      ),
    },
    {
      accessorKey: "firstName",
      header: ({ column }) => (
        <DataTableColumnHeader label="First Name" column={column} />
      ),
      cell: ({ row }) => (
        <span className="text-foreground">
          {emptyCell(row.original.firstName)}
        </span>
      ),
    },
    {
      accessorKey: "businessName",
      header: ({ column }) => (
        <DataTableColumnHeader label="Business Name" column={column} />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {emptyCell(row.original.businessName)}
        </span>
      ),
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <DataTableColumnHeader label="Email" column={column} />
      ),
      cell: ({ row }) => {
        const email = row.original.email.trim()
        if (!email) {
          return <span className="text-muted-foreground">—</span>
        }

        return (
          <span
            className="cursor-pointer font-normal text-sm"
          >
            {email}
          </span>
        )
      },
    },
  ]

  if (displayPhone) {
    columns.push({
      accessorKey: "phoneNo",
      header: ({ column }) => (
        <DataTableColumnHeader label="Phone" column={column} />
      ),
      cell: ({ row }) => (
        <span className="whitespace-nowrap tabular-nums text-muted-foreground">
          {emptyCell(row.original.phoneNo)}
        </span>
      ),
    })
  }

  columns.push(
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
      accessorKey: "tables",
      header: ({ column }) => (
        <DataTableColumnHeader label="Table(s)" column={column} />
      ),
      cell: ({ row }) => (
        <span className="block w-56 whitespace-pre-line leading-relaxed text-muted-foreground">
          {emptyCell(formatTableNumbers(row.original.tables))}
        </span>
      ),
    },
    {
      accessorKey: "seatNo",
      header: ({ column }) => (
        <DataTableColumnHeader label="SeatNo" column={column} />
      ),
      cell: ({ row }) => (
        <span className="block w-64 whitespace-pre-line leading-relaxed text-muted-foreground">
          {emptyCell(formatSeatNumbers(row.original.seatNo))}
        </span>
      ),
    },
    {
      accessorKey: "notes",
      header: ({ column }) => (
        <DataTableColumnHeader label="Notes" column={column} />
      ),
      cell: ({ row }) => {
        const notes = row.original.notes.trim()
        if (!notes) {
          return <span className="text-muted-foreground">—</span>
        }

        return (
          <span
            className="block max-w-48 truncate font-medium text-red-600"
            title={notes}
          >
            {notes}
          </span>
        )
      },
    },
    {
      accessorKey: "promo",
      header: ({ column }) => (
        <DataTableColumnHeader label="Promo" column={column} />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {emptyCell(row.original.promo)}
        </span>
      ),
    },
    {
      accessorKey: "din",
      header: ({ column }) => (
        <DataTableColumnHeader label="Din" column={column} />
      ),
      cell: ({ row }) => (
        <span className="tabular-nums text-muted-foreground">
          {emptyCell(row.original.din)}
        </span>
      ),
    },
    {
      accessorKey: "section",
      header: ({ column }) => (
        <DataTableColumnHeader label="Section" column={column} />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {emptyCell(row.original.section)}
        </span>
      ),
    },
    {
      accessorKey: "qty",
      header: ({ column }) => (
        <DataTableColumnHeader label="QTY" column={column} />
      ),
      cell: ({ row }) => (
        <span className="tabular-nums text-muted-foreground">
          {row.original.qty}
        </span>
      ),
    },
    {
      accessorKey: "seated",
      header: ({ column }) => (
        <DataTableColumnHeader label="Seated" column={column} />
      ),
      cell: ({ row }) => (
        <span className="tabular-nums text-muted-foreground">
          {row.original.seated}
        </span>
      ),
    },
    {
      accessorKey: "scanner",
      header: ({ column }) => (
        <DataTableColumnHeader label="Scanner" column={column} />
      ),
      cell: ({ row }) => (
        <span className="tabular-nums text-muted-foreground">
          {row.original.scanner}
        </span>
      ),
    },
    {
      accessorKey: "total",
      header: ({ column }) => (
        <DataTableColumnHeader label="Total" column={column} />
      ),
      cell: ({ row }) => (
        <span className="tabular-nums text-muted-foreground">
          {row.original.total}
        </span>
      ),
    },
    {
      accessorKey: "paid",
      header: ({ column }) => (
        <DataTableColumnHeader label="Paid" column={column} />
      ),
      cell: ({ row }) => (
        <span className="tabular-nums text-muted-foreground">
          {row.original.paid}
        </span>
      ),
    },
    {
      accessorKey: "createdBy",
      header: ({ column }) => (
        <DataTableColumnHeader label="Created By" column={column} />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {emptyCell(row.original.createdBy)}
        </span>
      ),
    },
    {
      accessorKey: "createdDt",
      header: ({ column }) => (
        <DataTableColumnHeader label="Created Dt" column={column} />
      ),
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-muted-foreground">
          {emptyCell(row.original.createdDt)}
        </span>
      ),
    },
    {
      accessorKey: "lastUpdateBy",
      header: ({ column }) => (
        <DataTableColumnHeader label="Last Update" column={column} />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {emptyCell(row.original.lastUpdateBy)}
        </span>
      ),
    },
    {
      accessorKey: "lastUpdateDt",
      header: ({ column }) => (
        <DataTableColumnHeader label="Last Update Dt" column={column} />
      ),
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-muted-foreground">
          {emptyCell(row.original.lastUpdateDt)}
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
          isCancelled={row.original.isCancelled}
          onCancelReservation={
            onCancelReservation
              ? () => onCancelReservation(row.original)
              : undefined
          }
          onUnCancelReservation={
            onUnCancelReservation
              ? () => onUnCancelReservation(row.original)
              : undefined
          }
          onCheckIn={onCheckIn ? () => onCheckIn(row.original) : undefined}
          onMoveReservation={
            onMoveReservation ? () => onMoveReservation(row.original) : undefined
          }
          onPrintTickets={
            onPrintTickets ? () => onPrintTickets(row.original) : undefined
          }
          onPrintIndividualTickets={
            onPrintIndividualTickets
              ? () => onPrintIndividualTickets(row.original)
              : undefined
          }
          onPrintReceipt={
            onPrintReceipt ? () => onPrintReceipt(row.original) : undefined
          }
          onReservationHistory={
            onReservationHistory
              ? () => onReservationHistory(row.original)
              : undefined
          }
          onAddNote={onAddNote ? () => onAddNote(row.original) : undefined}
          onPrintSignature={
            onPrintSignature ? () => onPrintSignature(row.original) : undefined
          }
        />
      ),
    }
  )

  return columns
}

