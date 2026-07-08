import type { ColumnDef } from "@tanstack/react-table"

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { Checkbox } from "@/components/ui/checkbox"
import type { Performer } from "@/types/performer"

type GetComicManagerColumnsParams = {
  selectedIds: string[]
  onToggleRow: (id: string, checked: boolean) => void
}

export function getComicManagerColumns({
  selectedIds,
  onToggleRow,
}: GetComicManagerColumnsParams): ColumnDef<Performer>[] {
  return [
    {
      id: "index",
      header: "#",
      enableSorting: false,
      cell: ({ row, table }) => {
        const pageIndex = table.getState().pagination.pageIndex
        const pageSize = table.getState().pagination.pageSize
        return (
          <span className="tabular-nums text-muted-foreground">
            {pageIndex * pageSize + row.index + 1}
          </span>
        )
      },
    },
    {
      id: "selected",
      header: "Selected",
      enableSorting: false,
      cell: ({ row }) => {
        const checked = selectedIds.includes(row.original.id)

        return (
          <div
            className="flex items-center"
            onClick={(event) => event.stopPropagation()}
          >
            <Checkbox
              checked={checked}
              aria-label={`Select ${row.original.stageName || "comic"}`}
              onCheckedChange={(value) =>
                onToggleRow(row.original.id, value === true)
              }
            />
          </div>
        )
      },
    },
    {
      accessorKey: "firstName",
      header: ({ column }) => (
        <DataTableColumnHeader label="First Name" column={column} />
      ),
      cell: ({ row }) => row.original.firstName || "—",
    },
    {
      accessorKey: "lastName",
      header: ({ column }) => (
        <DataTableColumnHeader label="Last Name" column={column} />
      ),
      cell: ({ row }) => row.original.lastName || "—",
    },
    {
      accessorKey: "stageName",
      header: ({ column }) => (
        <DataTableColumnHeader label="Stage Name" column={column} />
      ),
      cell: ({ row }) => (
        <span className="font-medium text-foreground">{row.original.stageName}</span>
      ),
    },
  ]
}
