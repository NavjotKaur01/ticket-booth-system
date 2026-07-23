import type { ColumnDef } from "@tanstack/react-table"

import { dataTableActionsColumn } from "@/components/data-table/data-table-actions-column"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import type { VenueRotatingAdRecord } from "@/types/venue-rotating-ad"

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

function formatDisplayDate(value: string) {
  if (!value) {
    return "—"
  }

  const parsed = new Date(`${value}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
  }).format(parsed)
}

type GetVenueRotatingAdColumnsParams = {
  onEdit: (row: VenueRotatingAdRecord) => void
  onDelete: (row: VenueRotatingAdRecord) => void
}

export function getVenueRotatingAdColumns({
  onEdit,
  onDelete,
}: GetVenueRotatingAdColumnsParams): ColumnDef<VenueRotatingAdRecord>[] {
  return [
    {
      id: "alternateText",
      accessorFn: (row) => row.alternateText || row.adName,
      header: ({ column }) => (
        <DataTableColumnHeader label="Alternate Text" column={column} />
      ),
      cell: ({ row }) => (
        <span className="font-medium text-foreground">
          {row.original.alternateText || row.original.adName}
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
    {
      accessorKey: "startingDate",
      header: ({ column }) => (
        <DataTableColumnHeader label="Starting Date" column={column} />
      ),
      cell: ({ row }) => formatDisplayDate(row.original.startingDate),
    },
    {
      accessorKey: "endingDate",
      header: ({ column }) => (
        <DataTableColumnHeader label="Ending Date" column={column} />
      ),
      cell: ({ row }) => formatDisplayDate(row.original.endingDate),
    },
    dataTableActionsColumn<VenueRotatingAdRecord>({
      header: "Action",
      ariaLabel: "Rotating ad actions",
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

export { ActivePill }
