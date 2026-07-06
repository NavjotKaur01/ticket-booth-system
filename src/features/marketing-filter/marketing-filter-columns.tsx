import type { ColumnDef } from "@tanstack/react-table"

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { formatMarketingFilterName } from "@/lib/filter-marketing-records"
import { formatPhoneParts, parsePhoneString } from "@/lib/phone-segment-input"
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
    cell: ({ row }) => {
      const email = row.original.email
      if (!email) {
        return "\u00A0"
      }

      return (
        <a
          href={`mailto:${email}`}
          className="cursor-pointer font-medium text-primary hover:underline"
        >
          {email}
        </a>
      )
    },
  },
  {
    accessorKey: "address",
    header: ({ column }) => (
      <DataTableColumnHeader label="Address" column={column} />
    ),
    cell: ({ row }) => row.original.address || "\u00A0",
  },
  {
    accessorKey: "address2",
    header: ({ column }) => (
      <DataTableColumnHeader label="Address2" column={column} />
    ),
    cell: ({ row }) => row.original.address2 || "\u00A0",
  },
  {
    id: "phoneNumbers",
    header: ({ column }) => (
      <DataTableColumnHeader label="Phone No." column={column} />
    ),
    cell: ({ row }) => {
      const numbers = [row.original.phone, row.original.phone1, row.original.phone2]
        .map((value) => value.trim())
        .filter(Boolean)

      if (numbers.length === 0) {
        return "\u00A0"
      }

      return (
        <div className="space-y-0.5 tabular-nums">
          {numbers.map((phone, index) => {
            const formatted = formatPhoneParts(parsePhoneString(phone))
            return (
              <div key={`${phone}-${index}`}>
                {formatted || phone}
              </div>
            )
          })}
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: "zipCode",
    header: ({ column }) => (
      <DataTableColumnHeader label="Zip Code" column={column} />
    ),
    cell: ({ row }) => row.original.zipCode || "\u00A0",
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
    cell: ({ row }) => row.original.city || "\u00A0",
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader label="Status" column={column} />
    ),
    cell: ({ row }) => row.original.status || "\u00A0",
  },
]
