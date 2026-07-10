import { useMemo } from "react"

import { DataTable } from "@/components/data-table/data-table"
import { getPromotionColumns } from "@/features/promotions/promotion-columns"
import type { Promotion } from "@/types/promotion"

type PromotionDataTableProps = {
  data: Promotion[]
  loading?: boolean
  emptyMessage?: string
  onEdit?: (promotion: Promotion) => void
}

export function PromotionDataTable({
  data,
  loading = false,
  emptyMessage = "No promotion found",
  onEdit,
}: PromotionDataTableProps) {
  const columns = useMemo(() => getPromotionColumns({ onEdit }), [onEdit])

  return (
    <DataTable
      columns={columns}
      data={data}
      emptyMessage={loading ? "Searching promotions..." : emptyMessage}
      entityLabel="promotions"
      pageSize={10}
    />
  )
}
