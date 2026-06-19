import { DataTable } from "@/components/data-table/data-table"
import { customerColumns } from "@/features/customers/customer-columns"
import type { Customer } from "@/types/customer"

type CustomerDataTableProps = {
  data: Customer[]
}

export function CustomerDataTable({ data }: CustomerDataTableProps) {
  return (
    <DataTable
      columns={customerColumns}
      data={data}
      emptyMessage="No record found"
      entityLabel="records"
      pageSize={10}
    />
  )
}
