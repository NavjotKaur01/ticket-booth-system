import { DataTable } from "@/components/data-table/data-table"
import { showTimeColumns } from "@/features/show-times/show-time-columns"
import {
  enrichShowTimeRows,
  type ShowTimeTableRow,
} from "@/lib/enrich-show-time-rows"
import type { ShowTimeRow } from "@/types/show-time"
import { useMemo } from "react"

type ShowTimeDataTableProps = {
  data: ShowTimeRow[]
}

export function ShowTimeDataTable({ data }: ShowTimeDataTableProps) {
  const tableRows = useMemo(() => enrichShowTimeRows(data), [data])

  return (
    <DataTable<ShowTimeTableRow>
      columns={showTimeColumns}
      data={tableRows}
      emptyMessage="No record found"
      entityLabel="records"
      pageSize={10}
    />
  )
}
