import type { ColumnDef } from "@tanstack/react-table"

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { ShowTimeRowActionsMenu } from "@/features/show-times/show-time-row-actions-menu"
import type { ShowTimeTableRow } from "@/lib/enrich-show-time-rows"
import { formatShowTime } from "@/lib/format-show-time"

export const showTimeColumns: ColumnDef<ShowTimeTableRow>[] = [
  {
    accessorKey: "startTime",
    header: ({ column }) => (
      <DataTableColumnHeader label="Start Time" column={column} />
    ),
    cell: ({ row }) => (
      <span className="font-medium text-foreground">
        {formatShowTime(row.original.startTime)}
      </span>
    ),
    meta: {
      getRowSpan: (row) => row.original.startTimeRowSpan,
    },
  },
  {
    accessorKey: "arrivalTime",
    header: ({ column }) => (
      <DataTableColumnHeader label="Arrival Time" column={column} />
    ),
    cell: ({ row }) => formatShowTime(row.original.arrivalTime),
    meta: {
      getRowSpan: (row) => row.original.arrivalTimeRowSpan,
    },
  },
  {
    accessorKey: "dinner",
    header: ({ column }) => (
      <DataTableColumnHeader label="Dinner" column={column} />
    ),
  },
  {
    accessorKey: "noPasses",
    header: ({ column }) => (
      <DataTableColumnHeader label="No Passes" column={column} />
    ),
  },
  {
    accessorKey: "age21Plus",
    header: ({ column }) => (
      <DataTableColumnHeader label="21+" column={column} />
    ),
  },
  {
    accessorKey: "hub",
    header: ({ column }) => (
      <DataTableColumnHeader label="Hub" column={column} />
    ),
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
  {
    accessorKey: "price",
    header: ({ column }) => (
      <DataTableColumnHeader label="Price" column={column} />
    ),
    cell: ({ row }) => (
      <span className="tabular-nums">{row.original.price}</span>
    ),
  },
  {
    accessorKey: "seats",
    header: ({ column }) => (
      <DataTableColumnHeader label="Seats" column={column} />
    ),
    cell: ({ row }) => (
      <span className="tabular-nums">{row.original.seats}</span>
    ),
  },
  {
    accessorKey: "restrictedPromo",
    header: ({ column }) => (
      <DataTableColumnHeader label="Restricted Promo" column={column} />
    ),
  },
  {
    accessorKey: "web",
    header: ({ column }) => (
      <DataTableColumnHeader label="Web" column={column} />
    ),
  },
  {
    id: "action",
    header: "Action",
    enableSorting: false,
    meta: {
      sticky: "right",
      getRowSpan: (row) => row.original.startTimeRowSpan,
    },
    cell: ({ row }) =>
      row.original.startTimeRowSpan > 0 ? <ShowTimeRowActionsMenu /> : null,
  },
]
