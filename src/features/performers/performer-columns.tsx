import type { ColumnDef } from "@tanstack/react-table"

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { PerformerRowActionsMenu } from "@/features/performers/performer-row-actions-menu"
import { Checkbox } from "@/components/ui/checkbox"
import type { Performer } from "@/types/performer"

type GetPerformerColumnsParams = {
  onEdit: (performer: Performer) => void
  onDelete: (performer: Performer) => void
}

export function getPerformerColumns({
  onEdit,
  onDelete,
}: GetPerformerColumnsParams): ColumnDef<Performer>[] {
  return [
    {
      id: "select",
      header: () => <span className="sr-only">Selected</span>,
      cell: ({ row, table }) => (
        <input
          type="radio"
          name="performer-row-select"
          checked={row.getIsSelected()}
          onChange={() => table.setRowSelection({ [row.id]: true })}
          className="size-4 cursor-pointer accent-primary"
          aria-label={`Select ${row.original.stageName || "performer"}`}
        />
      ),
      enableSorting: false,
    },
    {
      accessorKey: "hidden",
      header: "Disable/Hide",
      cell: ({ row }) => (
        <Checkbox checked={row.original.hidden} aria-label="Disable or hide" />
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
          {row.original.stageName}
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
