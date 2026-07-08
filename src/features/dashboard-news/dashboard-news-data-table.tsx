import { useMemo } from "react"

import { DataTable } from "@/components/data-table/data-table"
import { getDashboardNewsColumns } from "@/features/dashboard-news/dashboard-news-columns"
import type { DashboardNewsItem } from "@/types/dashboard-news"

type DashboardNewsDataTableProps = {
  data: DashboardNewsItem[]
  onEdit: (record: DashboardNewsItem) => void
  onDelete: (record: DashboardNewsItem) => void
}

export function DashboardNewsDataTable({
  data,
  onEdit,
  onDelete,
}: DashboardNewsDataTableProps) {
  const columns = useMemo(
    () => getDashboardNewsColumns({ onEdit, onDelete }),
    [onEdit, onDelete]
  )

  return (
    <DataTable
      columns={columns}
      data={data}
      emptyMessage="No news records found"
      entityLabel="records"
      pageSize={10}
    />
  )
}
