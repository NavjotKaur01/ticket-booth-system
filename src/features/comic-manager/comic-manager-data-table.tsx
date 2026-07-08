import { useMemo } from "react"

import { DataTable } from "@/components/data-table/data-table"
import { getComicManagerColumns } from "@/features/comic-manager/comic-manager-columns"
import type { Performer } from "@/types/performer"

type ComicManagerDataTableProps = {
  data: Performer[]
  selectedIds: string[]
  onToggleRow: (id: string, checked: boolean) => void
}

export function ComicManagerDataTable({
  data,
  selectedIds,
  onToggleRow,
}: ComicManagerDataTableProps) {
  const columns = useMemo(
    () => getComicManagerColumns({ selectedIds, onToggleRow }),
    [onToggleRow, selectedIds]
  )

  return (
    <DataTable
      columns={columns}
      data={data}
      emptyMessage="No comics match the current filters."
      entityLabel="items"
      pageSize={10}
      getRowId={(row) => row.id}
      getRowClassName={(row) =>
        selectedIds.includes(row.id) ? "bg-primary/10 hover:bg-primary/15" : undefined
      }
      onRowClick={(row) => {
        const id = row.original.id
        onToggleRow(id, !selectedIds.includes(id))
      }}
    />
  )
}
