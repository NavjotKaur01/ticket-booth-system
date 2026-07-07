import { useMemo } from "react"

import { DataTable } from "@/components/data-table/data-table"
import { createReservationColumns } from "@/features/reservations/reservation-columns"
import { getReservationRowClassName } from "@/lib/reservation-row-class"
import type { Reservation } from "@/types/reservation"

type ReservationDataTableProps = {
  data: Reservation[]
  loading?: boolean
  displayPhone?: boolean
  onCancelReservation?: (reservation: Reservation) => void
  onUnCancelReservation?: (reservation: Reservation) => void
  onMoveReservation?: (reservation: Reservation) => void
  onPrintTickets?: (reservation: Reservation) => void
  onPrintIndividualTickets?: (reservation: Reservation) => void
  onPrintReceipt?: (reservation: Reservation) => void
  onReservationHistory?: (reservation: Reservation) => void
  onAddNote?: (reservation: Reservation) => void
  onEditReservation?: (reservation: Reservation) => void
}

export function ReservationDataTable({
  data,
  loading = false,
  displayPhone = false,
  onCancelReservation,
  onUnCancelReservation,
  onMoveReservation,
  onPrintTickets,
  onPrintIndividualTickets,
  onPrintReceipt,
  onReservationHistory,
  onAddNote,
  onEditReservation,
}: ReservationDataTableProps) {
  const columns = useMemo(
    () =>
      createReservationColumns({
        displayPhone,
        onCancelReservation,
        onUnCancelReservation,
        onMoveReservation,
        onPrintTickets,
        onPrintIndividualTickets,
        onPrintReceipt,
        onReservationHistory,
        onAddNote,
      }),
    [
      displayPhone,
      onCancelReservation,
      onUnCancelReservation,
      onMoveReservation,
      onPrintTickets,
      onPrintIndividualTickets,
      onPrintReceipt,
      onReservationHistory,
      onAddNote,
    ]
  )

  return (
    <DataTable
      columns={columns}
      data={data}
      emptyMessage={loading ? "Loading reservations..." : "No reservations found."}
      entityLabel="reservations"
      pageSize={12}
      getRowClassName={getReservationRowClassName}
      getRowId={(row) => row.id}
      onRowDoubleClick={(row) => onEditReservation?.(row.original)}
    />
  )
}
