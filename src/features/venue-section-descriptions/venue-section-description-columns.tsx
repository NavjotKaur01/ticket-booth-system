import type { ColumnDef } from "@tanstack/react-table"

import { dataTableActionsColumn } from "@/components/data-table/data-table-actions-column"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import type { VenueSectionDescriptionRecord } from "@/types/venue-section-description"

type GetVenueSectionDescriptionColumnsParams = {
  onEdit: (row: VenueSectionDescriptionRecord) => void
  onDelete: (row: VenueSectionDescriptionRecord) => void
}

export function getVenueSectionDescriptionColumns({
  onEdit,
  onDelete,
}: GetVenueSectionDescriptionColumnsParams): ColumnDef<VenueSectionDescriptionRecord>[] {
  return [
    {
      id: "index",
      header: "#",
      enableSorting: false,
      cell: ({ row }) => (
        <span className="tabular-nums text-muted-foreground">{row.index + 1}</span>
      ),
    },
    {
      accessorKey: "sectionName",
      header: ({ column }) => (
        <DataTableColumnHeader label="Section Name" column={column} />
      ),
      cell: ({ row }) => (
        <span className="font-medium text-foreground">
          {row.original.sectionName}
        </span>
      ),
    },
    {
      accessorKey: "sectionDetail",
      header: ({ column }) => (
        <DataTableColumnHeader label="Section Detail" column={column} />
      ),
      cell: ({ row }) => (
        <span className="max-w-2xl text-sm text-muted-foreground whitespace-normal">
          {row.original.sectionDetail}
        </span>
      ),
    },
    dataTableActionsColumn<VenueSectionDescriptionRecord>({
      header: "Action",
      ariaLabel: "Section description actions",
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
