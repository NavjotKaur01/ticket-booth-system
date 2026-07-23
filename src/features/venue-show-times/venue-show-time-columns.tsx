import type { ColumnDef } from "@tanstack/react-table"

import { dataTableActionsColumn } from "@/components/data-table/data-table-actions-column"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import type { VenueShowTimeRecord } from "@/types/venue-show-time"

function BooleanPill({ value }: { value: boolean }) {
  return (
    <span
      className={
        value
          ? "inline-flex items-center justify-center rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300"
          : "inline-flex items-center justify-center rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground"
      }
    >
      {value ? "Yes" : "No"}
    </span>
  )
}

type GetVenueShowTimeColumnsParams = {
  onEdit: (row: VenueShowTimeRecord) => void
  onDelete: (row: VenueShowTimeRecord) => void
}

export function getVenueShowTimeColumns({
  onEdit,
  onDelete,
}: GetVenueShowTimeColumnsParams): ColumnDef<VenueShowTimeRecord>[] {
  return [
    {
      accessorKey: "dayOfWeek",
      header: ({ column }) => (
        <DataTableColumnHeader label="Day of Week" column={column} />
      ),
    },
    {
      accessorKey: "showTime",
      header: ({ column }) => (
        <DataTableColumnHeader label="Show Time" column={column} />
      ),
      cell: ({ row }) => (
        <span className="font-medium text-foreground">{row.original.showTime}</span>
      ),
    },
    {
      accessorKey: "arrivalTime",
      header: ({ column }) => (
        <DataTableColumnHeader label="Arrival Time" column={column} />
      ),
    },
    {
      accessorKey: "dinner",
      header: ({ column }) => (
        <DataTableColumnHeader label="Dinner" column={column} />
      ),
      cell: ({ row }) => <BooleanPill value={row.original.dinner} />,
    },
    {
      accessorKey: "noPasses",
      header: ({ column }) => (
        <DataTableColumnHeader label="No Passes" column={column} />
      ),
      cell: ({ row }) => <BooleanPill value={row.original.noPasses} />,
    },
    {
      accessorKey: "vip",
      header: ({ column }) => (
        <DataTableColumnHeader label="VIP" column={column} />
      ),
      cell: ({ row }) => <BooleanPill value={row.original.vip} />,
    },
    {
      accessorKey: "over21",
      header: ({ column }) => (
        <DataTableColumnHeader label="Over 21" column={column} />
      ),
      cell: ({ row }) => <BooleanPill value={row.original.over21} />,
    },
    {
      accessorKey: "showSeatingChart",
      header: ({ column }) => (
        <DataTableColumnHeader label="Show Seating Chart" column={column} />
      ),
      cell: ({ row }) => <BooleanPill value={row.original.showSeatingChart} />,
    },
    dataTableActionsColumn<VenueShowTimeRecord>({
      header: "Action",
      ariaLabel: "Show time actions",
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
