import { useMemo } from "react"

import { DataTable } from "@/components/data-table/data-table"
import { getVenueSocialColumns } from "@/features/venue-socials/venue-social-columns"
import type { VenueSocialRecord } from "@/types/venue-social"

type VenueSocialDataTableProps = {
  data: VenueSocialRecord[]
  loading?: boolean
  emptyMessage?: string
  onEdit: (row: VenueSocialRecord) => void
  onDelete: (row: VenueSocialRecord) => void
}

export function VenueSocialDataTable({
  data,
  loading = false,
  emptyMessage = "No record found",
  onEdit,
  onDelete,
}: VenueSocialDataTableProps) {
  const columns = useMemo(
    () => getVenueSocialColumns({ onEdit, onDelete }),
    [onEdit, onDelete]
  )

  return (
    <DataTable
      columns={columns}
      data={data}
      emptyMessage={loading ? "Loading social links..." : emptyMessage}
      entityLabel="records"
      pageSize={10}
      getRowId={(row) => row.id}
    />
  )
}
