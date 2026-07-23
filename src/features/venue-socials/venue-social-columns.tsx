import type { ColumnDef } from "@tanstack/react-table"
import { ExternalLink } from "lucide-react"

import { dataTableActionsColumn } from "@/components/data-table/data-table-actions-column"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import type { VenueSocialRecord } from "@/types/venue-social"

function formatSocialLabel(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

type GetVenueSocialColumnsParams = {
  onEdit: (row: VenueSocialRecord) => void
  onDelete: (row: VenueSocialRecord) => void
}

export function getVenueSocialColumns({
  onEdit,
  onDelete,
}: GetVenueSocialColumnsParams): ColumnDef<VenueSocialRecord>[] {
  return [
    {
      accessorKey: "social",
      header: ({ column }) => (
        <DataTableColumnHeader label="Social" column={column} />
      ),
      cell: ({ row }) => (
        <span className="font-medium text-foreground">
          {formatSocialLabel(row.original.social)}
        </span>
      ),
    },
    {
      accessorKey: "displayOrder",
      header: ({ column }) => (
        <DataTableColumnHeader label="Display Order" column={column} />
      ),
      cell: ({ row }) => (
        <span className="tabular-nums text-muted-foreground">
          {row.original.displayOrder}
        </span>
      ),
    },
    {
      accessorKey: "url",
      header: ({ column }) => (
        <DataTableColumnHeader label="URL" column={column} />
      ),
      cell: ({ row }) => (
        <a
          href={row.original.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex max-w-md items-center gap-1.5 truncate text-sm text-primary hover:underline"
          onClick={(event) => event.stopPropagation()}
        >
          <ExternalLink className="size-3.5 shrink-0 text-muted-foreground" />
          <span className="truncate">{row.original.url}</span>
        </a>
      ),
    },
    dataTableActionsColumn<VenueSocialRecord>({
      header: "Action",
      ariaLabel: "Social link actions",
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
