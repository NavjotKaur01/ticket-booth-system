import { DataTable } from "@/components/data-table/data-table"
import { customerColumns } from "@/features/customers/customer-columns"
import type { Customer } from "@/types/customer"

type CustomerDataTableProps = {
  data: Customer[]
  loading?: boolean
  emptyMessage?: string
}

export function CustomerDataTable({
  data,
  loading = false,
  emptyMessage = "No record found",
}: CustomerDataTableProps) {
  return (
    <DataTable
      columns={customerColumns}
      data={data}
      emptyMessage={loading ? "Searching customers..." : emptyMessage}
      entityLabel="records"
      pageSize={10}
    />
  )
}
