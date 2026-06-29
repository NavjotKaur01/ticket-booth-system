import { useMemo } from "react"

import { DataTable } from "@/components/data-table/data-table"
import { createReservationColumns } from "@/features/reservations/reservation-columns"
import type { Reservation } from "@/types/reservation"

type ReservationDataTableProps = {
  data: Reservation[]
  loading?: boolean
  onPrintTickets?: (reservation: Reservation) => void
}

export function ReservationDataTable({
  data,
  loading = false,
  onPrintTickets,
}: ReservationDataTableProps) {
  const columns = useMemo(
    () => createReservationColumns({ onPrintTickets }),
    [onPrintTickets]
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
