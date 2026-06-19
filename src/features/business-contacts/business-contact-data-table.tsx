import { DataTable } from "@/components/data-table/data-table"
import { businessContactColumns } from "@/features/business-contacts/business-contact-columns"
import type { BusinessContact } from "@/types/business-contact"

type BusinessContactDataTableProps = {
  data: BusinessContact[]
}

export function BusinessContactDataTable({ data }: BusinessContactDataTableProps) {
  return (
    <DataTable
      columns={businessContactColumns}
      data={data}
      emptyMessage="No record found"
      entityLabel="records"
      pageSize={10}
    />
  )
}
