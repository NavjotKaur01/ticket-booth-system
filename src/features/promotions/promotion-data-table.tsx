import { DataTable } from "@/components/data-table/data-table"
import { promotionColumns } from "@/features/promotions/promotion-columns"
import type { Promotion } from "@/types/promotion"

type PromotionDataTableProps = {
  data: Promotion[]
  loading?: boolean
  emptyMessage?: string
}

export function PromotionDataTable({
  data,
  loading = false,
  emptyMessage = "No promotion found",
}: PromotionDataTableProps) {
  return (
    <DataTable
      columns={promotionColumns}
      data={data}
      emptyMessage={loading ? "Searching promotions..." : emptyMessage}
      entityLabel="promotions"
      pageSize={10}
    />
  )
}
