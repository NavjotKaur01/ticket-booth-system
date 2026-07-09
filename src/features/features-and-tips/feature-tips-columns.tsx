import type { ColumnDef } from "@tanstack/react-table"

import type { StandardRowAction } from "@/components/common/standard-row-actions-menu"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { dataTableActionsColumn } from "@/components/data-table/data-table-actions-column"
import type { FeatureTip } from "@/types/feature-tip"

type GetFeatureTipsColumnsParams = {
  onEdit: (record: FeatureTip) => void
  onDelete: (record: FeatureTip) => void
}

export function getFeatureTipsColumns({
  onEdit,
  onDelete,
}: GetFeatureTipsColumnsParams): ColumnDef<FeatureTip>[] {
  return [
    {
      accessorKey: "header",
      header: ({ column }) => (
        <DataTableColumnHeader label="Feature Header" column={column} />
      ),
      cell: ({ row }) => (
        <span className="font-medium text-foreground">{row.original.header}</span>
      ),
    },
    {
      accessorKey: "navigateUrl",
      header: ({ column }) => (
        <DataTableColumnHeader label="Navigate Url" column={column} />
      ),
      cell: ({ row }) =>
        row.original.navigateUrl ? (
          <span className="block max-w-md truncate text-sm text-primary">
            {row.original.navigateUrl}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      accessorKey: "description",
      header: ({ column }) => (
        <DataTableColumnHeader label="Description" column={column} />
      ),
      cell: ({ row }) => (
        <span className="block max-w-xl text-sm text-foreground">
          {row.original.description}
        </span>
      ),
    },
    dataTableActionsColumn<FeatureTip>({
      ariaLabel: "Feature tip actions",
      hiddenActions: ["Add"] satisfies readonly StandardRowAction[],
      onAction: (record, action) => {
        if (action === "Edit") {
          onEdit(record)
          return
        }
        if (action === "Delete") {
          onDelete(record)
        }
      },
    }),
  ]
}
