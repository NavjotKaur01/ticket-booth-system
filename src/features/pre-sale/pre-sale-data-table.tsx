import { DataTable } from "@/components/data-table/data-table"
import { preSaleColumns } from "@/features/pre-sale/pre-sale-columns"
import type { PreSaleRecord } from "@/types/pre-sale"

type PreSaleDataTableProps = {
  data: PreSaleRecord[]
}

export function PreSaleDataTable({ data }: PreSaleDataTableProps) {
  return (
    <DataTable
      columns={preSaleColumns}
      data={data}
      emptyMessage="No record found"
      entityLabel="records"
      pageSize={10}
    />
  )
}
