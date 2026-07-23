import { useMemo } from "react"

import { DataTable } from "@/components/data-table/data-table"
import { getVenueShowTimeColumns } from "@/features/venue-show-times/venue-show-time-columns"
import type { VenueShowTimeRecord } from "@/types/venue-show-time"

type VenueShowTimeDataTableProps = {
  data: VenueShowTimeRecord[]
  loading?: boolean
  emptyMessage?: string
  onEdit: (row: VenueShowTimeRecord) => void
  onDelete: (row: VenueShowTimeRecord) => void
}

export function VenueShowTimeDataTable({
  data,
  loading = false,
  emptyMessage = "No record found",
  onEdit,
  onDelete,
}: VenueShowTimeDataTableProps) {
  const columns = useMemo(
    () => getVenueShowTimeColumns({ onEdit, onDelete }),
    [onEdit, onDelete]
  )

  return (
    <DataTable
      columns={columns}
      data={data}
      emptyMessage={loading ? "Loading show times..." : emptyMessage}
      entityLabel="records"
      pageSize={10}
      getRowId={(row) => row.id}
    />
  )
}
