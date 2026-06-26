import { useMemo } from "react"

import { DataTable } from "@/components/data-table/data-table"
import { createBusinessContactColumns } from "@/features/business-contacts/business-contact-columns"
import type { BusinessContact } from "@/types/business-contact"

type BusinessContactDataTableProps = {
  data: BusinessContact[]
  loading?: boolean
  emptyMessage?: string
  onDetails?: (contact: BusinessContact) => void
  onEdit?: (contact: BusinessContact) => void
  onDelete?: (contact: BusinessContact) => void
}

export function BusinessContactDataTable({
  data,
  loading = false,
  emptyMessage = "No record found",
  onDetails,
  onEdit,
  onDelete,
}: BusinessContactDataTableProps) {
  const columns = useMemo(
    () => createBusinessContactColumns({ onEdit, onDelete }),
    [onEdit, onDelete]
  )

  return (
    <DataTable
      columns={columns}
      data={data}
      emptyMessage={loading ? "Searching business contacts..." : emptyMessage}
      entityLabel="records"
      pageSize={10}
      getRowId={(row) => row.id}
      onRowDoubleClick={(row) => onDetails?.(row.original)}
    />
  )
}
