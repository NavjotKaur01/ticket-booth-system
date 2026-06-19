import type { ColumnDef } from "@tanstack/react-table"

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { MarketingFilterRowActionsMenu } from "@/features/marketing-filter/marketing-filter-row-actions-menu"
import { formatMarketingFilterName } from "@/lib/filter-marketing-records"
import type { MarketingFilterRecord } from "@/types/marketing-filter"

export const marketingFilterColumns: ColumnDef<MarketingFilterRecord>[] = [
  {
    id: "name",
    accessorFn: (row) => formatMarketingFilterName(row),
    header: ({ column }) => (
      <DataTableColumnHeader label="Name" column={column} />
    ),
    cell: ({ row }) => (
      <span className="font-medium text-foreground">
        {formatMarketingFilterName(row.original)}
      </span>
    ),
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader label="Email" column={column} />
    ),
    cell: ({ row }) => (
      <a
        href={`mailto:${row.original.email}`}
        className="cursor-pointer font-medium text-primary hover:underline"
      >
        {row.original.email}
      </a>
    ),
  },
  {
    accessorKey: "address",
    header: ({ column }) => (
      <DataTableColumnHeader label="Address" column={column} />
    ),
  },
  {
    accessorKey: "address2",
    header: ({ column }) => (
      <DataTableColumnHeader label="Address2" column={column} />
    ),
  },
  {
    accessorKey: "phoneNumbers",
    header: ({ column }) => (
      <DataTableColumnHeader label="Phone No." column={column} />
    ),
    cell: ({ row }) => (
      <div className="space-y-0.5 tabular-nums">
        {row.original.phoneNumbers.map((phone) => (
          <div key={phone}>{phone}</div>
        ))}
      </div>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "zipCode",
    header: ({ column }) => (
      <DataTableColumnHeader label="Zip Code" column={column} />
    ),
  },
  {
    accessorKey: "createdOn",
    header: ({ column }) => (
      <DataTableColumnHeader label="Created On" column={column} />
    ),
    cell: ({ row }) => row.original.createdOn || "\u00A0",
  },
  {
    accessorKey: "city",
    header: ({ column }) => (
      <DataTableColumnHeader label="City" column={column} />
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader label="Status" column={column} />
    ),
    cell: ({ row }) => row.original.status || "\u00A0",
  },
  {
    id: "action",
    header: "Action",
    enableSorting: false,
    meta: { sticky: "right" },
    cell: () => <MarketingFilterRowActionsMenu />,
  },
]
