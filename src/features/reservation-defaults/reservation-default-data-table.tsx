import { useMemo } from "react"

import { DataTable } from "@/components/data-table/data-table"
import { getReservationDefaultColumns } from "@/features/reservation-defaults/reservation-default-columns"
import type { ReservationDefault } from "@/types/reservation-default"

type ReservationDefaultDataTableProps = {
  data: ReservationDefault[]
  onEdit: (record: ReservationDefault) => void
}

export function ReservationDefaultDataTable({
  data,
  onEdit,
}: ReservationDefaultDataTableProps) {
  const columns = useMemo(() => getReservationDefaultColumns({ onEdit }), [onEdit])

  return (
    <DataTable
      columns={columns}
      data={data}
      emptyMessage="No record found"
      entityLabel="records"
      pageSize={10}
    />
  )
}
