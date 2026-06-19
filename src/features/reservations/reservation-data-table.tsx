import { DataTable } from "@/components/data-table/data-table"
import { reservationColumns } from "@/features/reservations/reservation-columns"
import type { Reservation } from "@/types/reservation"

type ReservationDataTableProps = {
  data: Reservation[]
  loading?: boolean
}

export function ReservationDataTable({
  data,
  loading = false,
}: ReservationDataTableProps) {
  return (
    <DataTable
      columns={reservationColumns}
      data={data}
      emptyMessage={loading ? "Loading reservations..." : "No reservations found."}
      entityLabel="reservations"
      pageSize={12}
    />
  )
}
