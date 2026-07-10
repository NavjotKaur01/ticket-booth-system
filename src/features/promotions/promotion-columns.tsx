import type { ColumnDef } from "@tanstack/react-table"

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { PromotionRowActionsMenu } from "@/features/promotions/promotion-row-actions-menu"
import type { Promotion } from "@/types/promotion"

type GetPromotionColumnsOptions = {
  onEdit?: (promotion: Promotion) => void
}

export function getPromotionColumns({
  onEdit,
}: GetPromotionColumnsOptions = {}): ColumnDef<Promotion>[] {
  return [
    {
      accessorKey: "promotionName",
      header: ({ column }) => (
        <DataTableColumnHeader label="Promotion Name" column={column} />
      ),
      cell: ({ row }) => (
        <span className="font-medium text-foreground">
          {row.original.promotionName}
        </span>
      ),
    },
    {
      accessorKey: "promotionCode",
      header: ({ column }) => (
        <DataTableColumnHeader label="Promotion Code" column={column} />
      ),
    },
    {
      accessorKey: "startDate",
      header: ({ column }) => (
        <DataTableColumnHeader label="Start Date" column={column} />
      ),
    },
    {
      accessorKey: "endDate",
      header: ({ column }) => (
        <DataTableColumnHeader label="End Date" column={column} />
      ),
    },
    {
      accessorKey: "weekDays",
      header: ({ column }) => (
        <DataTableColumnHeader label="WeekDays" column={column} />
      ),
      cell: ({ row }) => (
        <span className="tabular-nums">{row.original.weekDays}</span>
      ),
    },
    {
      accessorKey: "walkup",
      header: ({ column }) => (
        <DataTableColumnHeader label="Walkup" column={column} />
      ),
    },
    {
      accessorKey: "phoneIn",
      header: ({ column }) => (
        <DataTableColumnHeader label="Phone-In" column={column} />
      ),
    },
    {
      accessorKey: "web",
      header: ({ column }) => (
        <DataTableColumnHeader label="Web" column={column} />
      ),
    },
    {
      accessorKey: "mgr",
      header: ({ column }) => (
        <DataTableColumnHeader label="Mgr" column={column} />
      ),
    },
    {
      accessorKey: "useShowFee",
      header: ({ column }) => (
        <DataTableColumnHeader label="UseShowFee" column={column} />
      ),
    },
    {
      accessorKey: "dayOfShowFee",
      header: ({ column }) => (
        <DataTableColumnHeader label="DayOfShowFee" column={column} />
      ),
      cell: ({ row }) => (
        <span className="tabular-nums">{row.original.dayOfShowFee}</span>
      ),
    },
    {
      accessorKey: "walkupFee",
      header: ({ column }) => (
        <DataTableColumnHeader label="WalkupFee" column={column} />
      ),
      cell: ({ row }) => (
        <span className="tabular-nums">{row.original.walkupFee}</span>
      ),
    },
    {
      accessorKey: "phoneInFee",
      header: ({ column }) => (
        <DataTableColumnHeader label="PhoneInFee" column={column} />
      ),
      cell: ({ row }) => (
        <span className="tabular-nums">{row.original.phoneInFee}</span>
      ),
    },
    {
      accessorKey: "ccReq",
      header: ({ column }) => (
        <DataTableColumnHeader label="CCReq" column={column} />
      ),
    },
    {
      accessorKey: "lastUpdateId",
      header: ({ column }) => (
        <DataTableColumnHeader label="LastUpdateID" column={column} />
      ),
    },
    {
      accessorKey: "lastUpdateDt",
      header: ({ column }) => (
        <DataTableColumnHeader label="LastUpdateDt" column={column} />
      ),
      cell: ({ row }) => (
        <span className="whitespace-nowrap tabular-nums">
          {row.original.lastUpdateDt}
        </span>
      ),
    },
    {
      id: "action",
      header: "Action",
      enableSorting: false,
      meta: { sticky: "right" },
      cell: ({ row }) => (
        <PromotionRowActionsMenu promotion={row.original} onEdit={onEdit} />
      ),
    },
  ]
}

/** @deprecated Prefer getPromotionColumns({ onEdit }) */
export const promotionColumns = getPromotionColumns()
