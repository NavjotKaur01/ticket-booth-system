import { DataTable } from "@/components/data-table/data-table"
import { touchColumns } from "@/features/touch/touch-columns"
import type { TouchReservation } from "@/types/touch"

type TouchDataTableProps = {
  data: TouchReservation[]
}

export function TouchDataTable({ data }: TouchDataTableProps) {
  return (
    <DataTable
      columns={touchColumns}
      data={data}
      emptyMessage="No record found"
      entityLabel="records"
      pageSize={10}
    />
  )
}
