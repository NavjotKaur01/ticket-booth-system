import { useMemo } from "react"

import { DataTable } from "@/components/data-table/data-table"
import { getEmploymentQuestionColumns } from "@/features/employment-questions/employment-question-columns"
import type { EmploymentQuestionRecord } from "@/types/employment-question"

type EmploymentQuestionDataTableProps = {
  data: EmploymentQuestionRecord[]
  loading?: boolean
  emptyMessage?: string
  onEdit: (row: EmploymentQuestionRecord) => void
  onDelete: (row: EmploymentQuestionRecord) => void
}

export function EmploymentQuestionDataTable({
  data,
  loading = false,
  emptyMessage = "No record found",
  onEdit,
  onDelete,
}: EmploymentQuestionDataTableProps) {
  const columns = useMemo(
    () => getEmploymentQuestionColumns({ onEdit, onDelete }),
    [onEdit, onDelete]
  )

  return (
    <DataTable
      columns={columns}
      data={data}
      emptyMessage={loading ? "Loading employment questions..." : emptyMessage}
      entityLabel="records"
      pageSize={10}
      getRowId={(row) => row.id}
    />
  )
}
