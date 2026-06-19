import { DataTable } from "@/components/data-table/data-table"
import { marketingFilterColumns } from "@/features/marketing-filter/marketing-filter-columns"
import type { MarketingFilterRecord } from "@/types/marketing-filter"

type MarketingFilterDataTableProps = {
  data: MarketingFilterRecord[]
}

export function MarketingFilterDataTable({
  data,
}: MarketingFilterDataTableProps) {
  return (
    <DataTable
      columns={marketingFilterColumns}
      data={data}
      emptyMessage="No record found"
      entityLabel="records"
      pageSize={10}
    />
  )
}
