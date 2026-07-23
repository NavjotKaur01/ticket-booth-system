import { useMemo } from "react"

import { DataTable } from "@/components/data-table/data-table"
import { getVenueRotatingAdColumns } from "@/features/venue-rotating-ads/venue-rotating-ad-columns"
import type { VenueRotatingAdRecord } from "@/types/venue-rotating-ad"

type VenueRotatingAdDataTableProps = {
  data: VenueRotatingAdRecord[]
  loading?: boolean
  emptyMessage?: string
  onEdit: (row: VenueRotatingAdRecord) => void
  onDelete: (row: VenueRotatingAdRecord) => void
}

export function VenueRotatingAdDataTable({
  data,
  loading = false,
  emptyMessage = "No record found",
  onEdit,
  onDelete,
}: VenueRotatingAdDataTableProps) {
  const columns = useMemo(
    () => getVenueRotatingAdColumns({ onEdit, onDelete }),
    [onEdit, onDelete]
  )

  return (
    <DataTable
      columns={columns}
      data={data}
      emptyMessage={loading ? "Loading rotating ads..." : emptyMessage}
      entityLabel="records"
      pageSize={10}
      getRowId={(row) => row.id}
    />
  )
}
