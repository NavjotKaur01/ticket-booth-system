import { DataTable } from "@/components/data-table/data-table"
import { promotionColumns } from "@/features/promotions/promotion-columns"
import type { Promotion } from "@/types/promotion"

type PromotionDataTableProps = {
  data: Promotion[]
}

export function PromotionDataTable({ data }: PromotionDataTableProps) {
  return (
    <DataTable
      columns={promotionColumns}
      data={data}
      emptyMessage="No promotion found"
      entityLabel="promotions"
      pageSize={10}
    />
  )
}
