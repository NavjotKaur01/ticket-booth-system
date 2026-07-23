import { useMemo } from "react"

import { DataTable } from "@/components/data-table/data-table"
import { getEmploymentApplicantColumns } from "@/features/employment-applicants/employment-applicant-columns"
import type { EmploymentApplicantRecord } from "@/types/employment-applicant"

type EmploymentApplicantDataTableProps = {
  data: EmploymentApplicantRecord[]
  loading?: boolean
  emptyMessage?: string
  onEdit: (row: EmploymentApplicantRecord) => void
  onPreviewPdf: (row: EmploymentApplicantRecord) => void
}

export function EmploymentApplicantDataTable({
  data,
  loading = false,
  emptyMessage = "No record found",
  onEdit,
  onPreviewPdf,
}: EmploymentApplicantDataTableProps) {
  const columns = useMemo(
    () => getEmploymentApplicantColumns({ onEdit, onPreviewPdf }),
    [onEdit, onPreviewPdf]
  )

  return (
    <DataTable
      columns={columns}
      data={data}
      emptyMessage={loading ? "Loading applicants..." : emptyMessage}
      entityLabel="records"
      pageSize={10}
      getRowId={(row) => row.id}
    />
  )
}
