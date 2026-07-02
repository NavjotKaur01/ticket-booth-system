import { DataTable } from "@/components/data-table/data-table"
import { marketingFilterColumns } from "@/features/marketing-filter/marketing-filter-columns"
import type { MarketingFilterRecord } from "@/types/marketing-filter"

type MarketingFilterDataTableProps = {
  data: MarketingFilterRecord[]
  loading?: boolean
  emptyMessage?: string
  onDetails?: (record: MarketingFilterRecord) => void
}

export function MarketingFilterDataTable({
  data,
  loading = false,
  emptyMessage = "No record found",
  onDetails,
}: MarketingFilterDataTableProps) {
  return (
    <DataTable
      columns={marketingFilterColumns}
      data={data}
      emptyMessage={loading ? "Please wait while data is loading..." : emptyMessage}
      entityLabel="records"
      pageSize={10}
      getRowId={(row) => row.id}
      onRowDoubleClick={(row) => onDetails?.(row.original)}
    />
  )
}
