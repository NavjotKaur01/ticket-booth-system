import type { ColumnDef } from "@tanstack/react-table"

import { dataTableActionsColumn } from "@/components/data-table/data-table-actions-column"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import type { FreeFormRecord } from "@/types/free-form"

function ActivePill({ active }: { active: boolean }) {
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

type GetFreeFormColumnsParams = {
  onEdit: (row: FreeFormRecord) => void
  onDelete: (row: FreeFormRecord) => void
}

export function getFreeFormColumns({
  onEdit,
  onDelete,
}: GetFreeFormColumnsParams): ColumnDef<FreeFormRecord>[] {
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
      accessorKey: "buttonText",
      header: ({ column }) => (
        <DataTableColumnHeader label="Button Text" column={column} />
      ),
      cell: ({ row }) => (
        <span className="max-w-md whitespace-normal font-medium text-foreground">
          {row.original.buttonText}
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
      accessorKey: "active",
      header: ({ column }) => (
        <DataTableColumnHeader label="Active" column={column} />
      ),
      cell: ({ row }) => <ActivePill active={row.original.active} />,
    },
    dataTableActionsColumn<FreeFormRecord>({
      header: "Action",
      ariaLabel: "Free form actions",
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
