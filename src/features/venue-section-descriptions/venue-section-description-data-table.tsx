import { useMemo } from "react"

import { DataTable } from "@/components/data-table/data-table"
import { getVenueSectionDescriptionColumns } from "@/features/venue-section-descriptions/venue-section-description-columns"
import type { VenueSectionDescriptionRecord } from "@/types/venue-section-description"

type VenueSectionDescriptionDataTableProps = {
  data: VenueSectionDescriptionRecord[]
  loading?: boolean
  emptyMessage?: string
  onEdit: (row: VenueSectionDescriptionRecord) => void
  onDelete: (row: VenueSectionDescriptionRecord) => void
}

export function VenueSectionDescriptionDataTable({
  data,
  loading = false,
  emptyMessage = "No record found",
  onEdit,
  onDelete,
}: VenueSectionDescriptionDataTableProps) {
  const columns = useMemo(
    () => getVenueSectionDescriptionColumns({ onEdit, onDelete }),
    [onEdit, onDelete]
  )

  return (
    <DataTable
      columns={columns}
      data={data}
      emptyMessage={loading ? "Loading section descriptions..." : emptyMessage}
      entityLabel="records"
      pageSize={10}
      getRowId={(row) => row.id}
    />
  )
}
