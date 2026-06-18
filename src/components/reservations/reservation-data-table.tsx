import { DataTable } from "@/components/data-table/data-table"
import { reservationColumns } from "@/components/reservations/reservation-columns"
import type { Reservation } from "@/types/reservation"

type ReservationDataTableProps = {
  data: Reservation[]
}

/** Reservations-specific wrapper around the shared DataTable component. */
export function ReservationDataTable({ data }: ReservationDataTableProps) {
  return (
    <DataTable
      columns={reservationColumns}
      data={data}
      emptyMessage="No reservations found."
      enableRowSelection
      pageSize={10}
    />
  )
}
