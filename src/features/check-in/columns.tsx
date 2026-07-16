import type { ColumnDef } from "@tanstack/react-table"

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { RowActionsMenu } from "@/components/common/row-actions-menu"
import { CheckInStatusIcon } from "@/features/check-in/status-legend"
import type { CheckInRecord } from "@/types/check-in"
import { cn } from "@/lib/utils"

type CheckInColumnsOptions = {
  onCancelReservation?: (record: CheckInRecord) => void
  onUnCancelReservation?: (record: CheckInRecord) => void
  onCheckIn?: (record: CheckInRecord) => void
  onUnCheckIn?: (record: CheckInRecord) => void
  onPartialCheckInOrSplit?: (record: CheckInRecord) => void
  onPartialUnscan?: (record: CheckInRecord) => void
  onQuickPay?: (record: CheckInRecord) => void
  onAssignSeatsAndCheckIn?: (record: CheckInRecord) => void
  onMoveReservation?: (record: CheckInRecord) => void
  onPrintTickets?: (record: CheckInRecord) => void
  onPrintIndividualTickets?: (record: CheckInRecord) => void
  onPrintReceipt?: (record: CheckInRecord) => void
  onReservationHistory?: (record: CheckInRecord) => void
  onAddNote?: (record: CheckInRecord) => void
  onPrintSignature?: (record: CheckInRecord) => void
  onResendTicket?: (record: CheckInRecord) => void
  showScannerColumn?: boolean
}

export function createCheckInColumns({
  onCancelReservation,
  onUnCancelReservation,
  onCheckIn,
  onUnCheckIn,
  onPartialCheckInOrSplit,
  onPartialUnscan,
  onQuickPay,
  onAssignSeatsAndCheckIn,
  onMoveReservation,
  onPrintTickets,
  onPrintIndividualTickets,
  onPrintReceipt,
  onReservationHistory,
  onAddNote,
  onPrintSignature,
  onResendTicket,
  showScannerColumn = true,
}: CheckInColumnsOptions = {}): ColumnDef<CheckInRecord>[] {
  const columns: ColumnDef<CheckInRecord>[] = [
    {
      id: "status",
      header: "",
      cell: ({ row }) => <CheckInStatusIcon status={row.original.status} />,
      enableSorting: false,
    },
    {
      accessorKey: "lastName",
      header: ({ column }) => (
        <DataTableColumnHeader label="Last Name" column={column} />
      ),
    },
    {
      accessorKey: "firstName",
      header: ({ column }) => (
        <DataTableColumnHeader label="First Name" column={column} />
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
          <a
            href={`mailto:${email}`}
            className="font-medium text-primary hover:underline"
          >
            {email}
          </a>
        )
      },
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
      accessorKey: "tables",
      header: "Table(s)",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.tables || ""}
        </span>
      ),
    },
    {
      accessorKey: "notes",
      header: "Notes",
      cell: ({ row }) => (
        <span className="max-w-[8rem] truncate text-muted-foreground">
          {row.original.notes || ""}
        </span>
      ),
    },
    {
      accessorKey: "promo",
      header: "Promo",
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.promo || ""}</span>
      ),
    },
    {
      accessorKey: "din",
      header: "Din",
      cell: ({ row }) => (
        <span className="tabular-nums">{row.original.din}</span>
      ),
    },
    {
      accessorKey: "qty",
      header: ({ column }) => (
        <DataTableColumnHeader label="QTY" column={column} />
      ),
      cell: ({ row }) => (
        <span className="font-medium tabular-nums">{row.original.qty}</span>
      ),
    },
    {
      accessorKey: "seatNo",
      header: "SeatNo",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.seatNo || ""}
        </span>
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
    ...(showScannerColumn
      ? ([
          {
            accessorKey: "scanner",
            header: "Scanner",
            cell: ({ row }) => (
              <span className="tabular-nums text-muted-foreground">
                {row.original.scanner}
              </span>
            ),
          },
        ] as ColumnDef<CheckInRecord>[])
      : []),
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
      accessorKey: "createdBy",
      header: "Created By",
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.createdBy}</span>
      ),
    },
    {
      accessorKey: "createdDt",
      header: "Create Dt",
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-muted-foreground">
          {row.original.createdDt}
        </span>
      ),
    },
    {
      accessorKey: "lastUpdateDt",
      header: "LastUpdateDt",
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-muted-foreground">
          {row.original.lastUpdateDt || ""}
        </span>
      ),
    },
    {
      accessorKey: "lastUpdateBy",
      header: "LastUpdateBy",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.lastUpdateBy || ""}
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
          onUnCheckIn={
            onUnCheckIn ? () => onUnCheckIn(row.original) : undefined
          }
          onPartialCheckInOrSplit={
            onPartialCheckInOrSplit
              ? () => onPartialCheckInOrSplit(row.original)
              : undefined
          }
          onPartialUnscan={
            onPartialUnscan ? () => onPartialUnscan(row.original) : undefined
          }
          onQuickPay={
            onQuickPay ? () => onQuickPay(row.original) : undefined
          }
          onAssignSeatsAndCheckIn={
            onAssignSeatsAndCheckIn
              ? () => onAssignSeatsAndCheckIn(row.original)
              : undefined
          }
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
          onResendTicket={
            onResendTicket &&
            (row.original.source === "Web" || row.original.source === "Phone")
              ? () => onResendTicket(row.original)
              : undefined
          }
        />
      ),
    },
  ]

  return columns
}

/** @deprecated Prefer createCheckInColumns with action handlers. */
export const checkInColumns = createCheckInColumns()
