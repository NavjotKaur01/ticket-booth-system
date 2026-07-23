import type { ColumnDef } from "@tanstack/react-table"

import { dataTableActionsColumn } from "@/components/data-table/data-table-actions-column"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import type { FoodMenuCategory } from "@/types/food-menu"

function StatusPill({ active }: { active: boolean }) {
  return (
    <span
      className={
        active
          ? "inline-flex items-center justify-center rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300"
          : "inline-flex items-center justify-center rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground"
      }
    >
      {active ? "Yes" : "No"}
    </span>
  )
}

type GetFoodMenuCategoryColumnsParams = {
  onEdit: (row: FoodMenuCategory) => void
  onDelete: (row: FoodMenuCategory) => void
}

export function getFoodMenuCategoryColumns({
  onEdit,
  onDelete,
}: GetFoodMenuCategoryColumnsParams): ColumnDef<FoodMenuCategory>[] {
  return [
    {
      accessorKey: "menuName",
      header: ({ column }) => (
        <DataTableColumnHeader label="Menu Name" column={column} />
      ),
      cell: ({ row }) => (
        <span className="font-medium text-foreground">{row.original.menuName}</span>
      ),
    },
    {
      accessorKey: "menuOrder",
      header: ({ column }) => (
        <DataTableColumnHeader label="Menu Order" column={column} />
      ),
      cell: ({ row }) => (
        <span className="tabular-nums">{row.original.menuOrder}</span>
      ),
    },
    {
      accessorKey: "active",
      header: ({ column }) => (
        <DataTableColumnHeader label="Active" column={column} />
      ),
      cell: ({ row }) => <StatusPill active={row.original.active} />,
    },
    dataTableActionsColumn<FoodMenuCategory>({
      header: "Action",
      ariaLabel: "Food menu category actions",
      hiddenActions: ["Add"],
      onAction: (row, action) => {
        if (action === "Edit") {
          onEdit(row)
        }
        if (action === "Delete") {
          onDelete(row)
        }
      },
    }),
  ]
}
