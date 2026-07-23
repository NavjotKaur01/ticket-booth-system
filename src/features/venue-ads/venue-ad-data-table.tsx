import { useMemo } from "react"

import { DataTable } from "@/components/data-table/data-table"
import { getVenueAdColumns } from "@/features/venue-ads/venue-ad-columns"
import type { VenueAdRecord } from "@/types/venue-ad"

type VenueAdDataTableProps = {
  data: VenueAdRecord[]
  selectedAdId: string
  loading?: boolean
  emptyMessage?: string
  onSelect: (row: VenueAdRecord) => void
  onEdit: (row: VenueAdRecord) => void
  onDelete: (row: VenueAdRecord) => void
}

export function VenueAdDataTable({
  data,
  selectedAdId,
  loading = false,
  emptyMessage = "No record found",
  onSelect,
  onEdit,
  onDelete,
}: VenueAdDataTableProps) {
  const columns = useMemo(
    () =>
      getVenueAdColumns({
        selectedAdId,
        onSelect,
        onEdit,
        onDelete,
      }),
    [selectedAdId, onSelect, onEdit, onDelete]
  )

  return (
    <DataTable
      columns={columns}
      data={data}
      emptyMessage={loading ? "Loading venue ads..." : emptyMessage}
      entityLabel="records"
      pageSize={10}
      getRowId={(row) => row.id}
      onRowClick={(row) => onEdit(row.original)}
      getRowClassName={(row) =>
        row.id === selectedAdId
          ? "bg-primary/10 hover:bg-primary/10"
          : undefined
      }
    />
  )
}
