import { useMemo } from "react"

import { DataTable } from "@/components/data-table/data-table"
import { createCheckInColumns } from "@/features/check-in/columns"
import { getCheckInRowClassName } from "@/lib/check-in-row-class"
import type { CheckInRecord } from "@/types/check-in"

type CheckInDataTableProps = {
  data: CheckInRecord[]
  loading?: boolean
  onCancelReservation?: (record: CheckInRecord) => void
  onUnCancelReservation?: (record: CheckInRecord) => void
  onCheckIn?: (record: CheckInRecord) => void
  onUnCheckIn?: (record: CheckInRecord) => void
  onPartialCheckInOrSplit?: (record: CheckInRecord) => void
  onPartialUnscan?: (record: CheckInRecord) => void
  onQuickPay?: (record: CheckInRecord) => void
  onAssignSeats?: (record: CheckInRecord) => void
  onAssignSeatsAndCheckIn?: (record: CheckInRecord) => void
  onMoveReservation?: (record: CheckInRecord) => void
  onPrintTickets?: (record: CheckInRecord) => void
  onPrintIndividualTickets?: (record: CheckInRecord) => void
  onPrintReceipt?: (record: CheckInRecord) => void
  onReservationHistory?: (record: CheckInRecord) => void
  onAddNote?: (record: CheckInRecord) => void
  onPrintSignature?: (record: CheckInRecord) => void
  onResendTicket?: (record: CheckInRecord) => void
  onEditReservation?: (record: CheckInRecord) => void
  onSelectReservation?: (record: CheckInRecord) => void
  showScannerColumn?: boolean
}

/** Check-in guest table — wraps the shared DataTable with check-in columns. */
export function CheckInDataTable({
  data,
  loading = false,
  onCancelReservation,
  onUnCancelReservation,
  onCheckIn,
  onUnCheckIn,
  onPartialCheckInOrSplit,
  onPartialUnscan,
  onQuickPay,
  onAssignSeats,
  onAssignSeatsAndCheckIn,
  onMoveReservation,
  onPrintTickets,
  onPrintIndividualTickets,
  onPrintReceipt,
  onReservationHistory,
  onAddNote,
  onPrintSignature,
  onResendTicket,
  onEditReservation,
  onSelectReservation,
  showScannerColumn = true,
}: CheckInDataTableProps) {
  const columns = useMemo(
    () =>
      createCheckInColumns({
        onCancelReservation,
        onUnCancelReservation,
        onCheckIn,
        onUnCheckIn,
        onPartialCheckInOrSplit,
        onPartialUnscan,
        onQuickPay,
        onAssignSeats,
        onAssignSeatsAndCheckIn,
        onMoveReservation,
        onPrintTickets,
        onPrintIndividualTickets,
        onPrintReceipt,
        onReservationHistory,
        onAddNote,
        onPrintSignature,
        onResendTicket,
        showScannerColumn,
      }),
    [
      onCancelReservation,
      onUnCancelReservation,
      onCheckIn,
      onUnCheckIn,
      onPartialCheckInOrSplit,
      onPartialUnscan,
      onQuickPay,
      onAssignSeats,
      onAssignSeatsAndCheckIn,
      onMoveReservation,
      onPrintTickets,
      onPrintIndividualTickets,
      onPrintReceipt,
      onReservationHistory,
      onAddNote,
      onPrintSignature,
      onResendTicket,
      showScannerColumn,
    ]
  )

  return (
    <DataTable
      columns={columns}
      data={data}
      emptyMessage={
        loading ? "Loading check-in records..." : "No check-in records found."
      }
      entityLabel="records"
      pageSize={12}
      getRowClassName={getCheckInRowClassName}
      getRowId={(row) => row.id}
      onRowClick={(row) => onSelectReservation?.(row.original)}
      onRowDoubleClick={(row) => onEditReservation?.(row.original)}
    />
  )
}
