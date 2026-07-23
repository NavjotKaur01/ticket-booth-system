import { useMemo } from "react"

import { DataTable } from "@/components/data-table/data-table"
import { getFoodMenuCategoryColumns } from "@/features/food-menu/food-menu-category-columns"
import type { FoodMenuCategory } from "@/types/food-menu"

type FoodMenuCategoryDataTableProps = {
  data: FoodMenuCategory[]
  loading?: boolean
  emptyMessage?: string
  onEdit: (row: FoodMenuCategory) => void
  onDelete: (row: FoodMenuCategory) => void
}

export function FoodMenuCategoryDataTable({
  data,
  loading = false,
  emptyMessage = "No record found",
  onEdit,
  onDelete,
}: FoodMenuCategoryDataTableProps) {
  const columns = useMemo(
    () => getFoodMenuCategoryColumns({ onEdit, onDelete }),
    [onEdit, onDelete]
  )

  return (
    <DataTable
      columns={columns}
      data={data}
      emptyMessage={loading ? "Loading food menu data..." : emptyMessage}
      entityLabel="records"
      pageSize={10}
      getRowId={(row) => row.id}
    />
  )
}
