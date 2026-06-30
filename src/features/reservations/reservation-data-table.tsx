import { useMemo } from "react"

import { DataTable } from "@/components/data-table/data-table"
import { createReservationColumns } from "@/features/reservations/reservation-columns"
import type { Reservation } from "@/types/reservation"

type ReservationDataTableProps = {
  data: Reservation[]
  loading?: boolean
  onCancelReservation?: (reservation: Reservation) => void
  onPrintTickets?: (reservation: Reservation) => void
  onReservationHistory?: (reservation: Reservation) => void
}

export function ReservationDataTable({
  data,
  loading = false,
  onCancelReservation,
  onPrintTickets,
  onReservationHistory,
}: ReservationDataTableProps) {
  const columns = useMemo(
    () =>
      createReservationColumns({
        onCancelReservation,
        onPrintTickets,
        onReservationHistory,
      }),
    [onCancelReservation, onPrintTickets, onReservationHistory]
  )

  return (
    <DataTable
      columns={columns}
      data={data}
      emptyMessage={loading ? "Loading reservations..." : "No reservations found."}
      entityLabel="reservations"
      pageSize={12}
    />
  )
}
