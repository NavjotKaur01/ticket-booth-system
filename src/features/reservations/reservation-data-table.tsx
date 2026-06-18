import { DataTable } from "@/components/data-table/data-table"
import { reservationColumns } from "@/features/reservations/reservation-columns"
import type { Reservation } from "@/types/reservation"

type ReservationDataTableProps = {
  data: Reservation[]
}

export function ReservationDataTable({ data }: ReservationDataTableProps) {
  return (
    <DataTable
      columns={reservationColumns}
      data={data}
      emptyMessage="No reservations found."
      enableRowSelection
      entityLabel="reservations"
      pageSize={12}
    />
  )
}
