import { useMemo } from "react"

import { DataTable } from "@/components/data-table/data-table"
import { getShowTimeColumns } from "@/features/show-times/show-time-columns"
import {
  enrichShowTimeRows,
  type ShowTimeTableRow,
} from "@/lib/enrich-show-time-rows"
import type { ShowTimeRow } from "@/types/show-time"

type ShowTimeDataTableProps = {
  data: ShowTimeRow[]
  onEdit: (row: ShowTimeRow) => void
  onDelete: (row: ShowTimeRow) => void
  emptyMessage?: string
}

export function ShowTimeDataTable({
  data,
  onEdit,
  onDelete,
  emptyMessage = "No record found",
}: ShowTimeDataTableProps) {
  const tableRows = useMemo(() => enrichShowTimeRows(data), [data])
  const columns = useMemo(
    () => getShowTimeColumns({ onEdit, onDelete }),
    [onEdit, onDelete]
  )

  return (
    <DataTable<ShowTimeTableRow>
      columns={columns}
      data={tableRows}
      emptyMessage={emptyMessage}
      entityLabel="records"
      pageSize={10}
    />
  )
}
