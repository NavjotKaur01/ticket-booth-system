import type { ColumnDef } from "@tanstack/react-table"
import { CheckCircle2, Circle, ExternalLink } from "lucide-react"

import { dataTableActionsColumn } from "@/components/data-table/data-table-actions-column"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import type { VenueAdRecord } from "@/types/venue-ad"

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

type GetVenueAdColumnsParams = {
  selectedAdId: string
  onSelect: (row: VenueAdRecord) => void
  onEdit: (row: VenueAdRecord) => void
  onDelete: (row: VenueAdRecord) => void
}

export function getVenueAdColumns({
  selectedAdId,
  onSelect,
  onEdit,
  onDelete,
}: GetVenueAdColumnsParams): ColumnDef<VenueAdRecord>[] {
  return [
    {
      id: "selected",
      header: "Selected",
      enableSorting: false,
      cell: ({ row }) => {
        const isSelected = row.original.id === selectedAdId

        return (
          <button
            type="button"
            aria-label={isSelected ? "Selected venue ad" : "Select venue ad"}
            className="inline-flex items-center justify-center rounded-full text-primary"
            onClick={(event) => {
              event.stopPropagation()
              onSelect(row.original)
            }}
          >
            {isSelected ? (
              <CheckCircle2 className="size-5" />
            ) : (
              <Circle className="size-5 text-muted-foreground" />
            )}
          </button>
        )
      },
    },
    {
      accessorKey: "navigateUrl",
      header: ({ column }) => (
        <DataTableColumnHeader label="Navigate URL" column={column} />
      ),
      cell: ({ row }) => (
        <div className="flex min-w-0 max-w-md items-start gap-2">
          <ExternalLink className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
          <span
            className="block truncate text-sm text-foreground"
            title={row.original.navigateUrl}
          >
            {row.original.navigateUrl}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "displayText",
      header: ({ column }) => (
        <DataTableColumnHeader label="Display Text" column={column} />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.displayText || "—"}
        </span>
      ),
    },
    {
      accessorKey: "active",
      header: ({ column }) => (
        <DataTableColumnHeader label="Active" column={column} />
      ),
      cell: ({ row }) => <StatusPill active={row.original.active} />,
    },
    {
      accessorKey: "section",
      header: ({ column }) => (
        <DataTableColumnHeader label="Section" column={column} />
      ),
      cell: ({ row }) => (
        <span className="font-medium text-foreground">{row.original.section}</span>
      ),
    },
    dataTableActionsColumn<VenueAdRecord>({
      header: "Action",
      ariaLabel: "Venue ad actions",
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
