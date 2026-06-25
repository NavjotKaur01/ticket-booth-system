import { useMemo } from "react"

import { DataTable } from "@/components/data-table/data-table"
import { createCustomerColumns } from "@/features/customers/customer-columns"
import type { Customer } from "@/types/customer"

type CustomerDataTableProps = {
  data: Customer[]
  loading?: boolean
  emptyMessage?: string
  onDetails?: (customer: Customer) => void
  onEdit?: (customer: Customer) => void
  onDelete?: (customer: Customer) => void
}

export function CustomerDataTable({
  data,
  loading = false,
  emptyMessage = "No record found",
  onDetails,
  onEdit,
  onDelete,
}: CustomerDataTableProps) {
  const columns = useMemo(
    () => createCustomerColumns({ onDetails, onEdit, onDelete }),
    [onDetails, onEdit, onDelete]
  )

  return (
    <DataTable
      columns={columns}
      data={data}
      emptyMessage={loading ? "Searching customers..." : emptyMessage}
      entityLabel="records"
      pageSize={10}
    />
  )
}
