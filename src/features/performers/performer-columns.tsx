import type { ColumnDef } from "@tanstack/react-table"

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { createSelectColumn } from "@/components/data-table/data-table-select-column"
import { PerformerRowActionsMenu } from "@/features/performers/performer-row-actions-menu"
import { Checkbox } from "@/components/ui/checkbox"
import type { Performer } from "@/types/performer"

type GetPerformerColumnsParams = {
  onEdit: (performer: Performer) => void
  onDelete: (performer: Performer) => void
  onToggleHidden: (performer: Performer, hidden: boolean) => void
}

export function getPerformerColumns({
  onEdit,
  onDelete,
  onToggleHidden,
}: GetPerformerColumnsParams): ColumnDef<Performer>[] {
  return [
    createSelectColumn<Performer>(),
    {
      accessorKey: "hidden",
      header: "Disable/Hide",
      cell: ({ row }) => (
        <Checkbox
          checked={row.original.hidden}
          onCheckedChange={(value) =>
            onToggleHidden(row.original, value === true)
          }
          aria-label={`Disable or hide ${row.original.stageName || "performer"}`}
        />
      ),
      enableSorting: false,
    },
    {
      accessorKey: "firstName",
      header: ({ column }) => (
        <DataTableColumnHeader label="First Name" column={column} />
      ),
      cell: ({ row }) => (
        <span className="text-foreground">
          {row.original.firstName || "\u00A0"}
        </span>
      ),
    },
    {
      accessorKey: "lastName",
      header: ({ column }) => (
        <DataTableColumnHeader label="Last Name" column={column} />
      ),
      cell: ({ row }) => (
        <span className="text-foreground">
          {row.original.lastName || "\u00A0"}
        </span>
      ),
    },
    {
      accessorKey: "stageName",
      header: ({ column }) => (
        <DataTableColumnHeader label="Stage Name" column={column} />
      ),
      cell: ({ row }) => (
        <span className="font-medium text-foreground">
          {row.original.stageName || row.original.comicName || "\u00A0"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Action",
      enableSorting: false,
      meta: { sticky: "right" },
      cell: ({ row }) => (
        <PerformerRowActionsMenu
          performer={row.original}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ),
    },
  ]
}
