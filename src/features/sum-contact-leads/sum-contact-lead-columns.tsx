import type { ColumnDef } from "@tanstack/react-table"

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import type { SumContactLead } from "@/types/sum-contact-lead"

export function getSumContactLeadColumns(): ColumnDef<SumContactLead>[] {
  return [
    {
      accessorKey: "fullName",
      header: ({ column }) => (
        <DataTableColumnHeader label="Full Name" column={column} />
      ),
      cell: ({ row }) => (
        <span className="font-medium text-foreground">{row.original.fullName}</span>
      ),
    },
    {
      accessorKey: "venue",
      header: ({ column }) => <DataTableColumnHeader label="Venue" column={column} />,
      cell: ({ row }) => row.original.venue || "—",
    },
    {
      accessorKey: "phone",
      header: ({ column }) => <DataTableColumnHeader label="Phone" column={column} />,
      cell: ({ row }) => (
        <span className="tabular-nums">{row.original.phone || "—"}</span>
      ),
    },
    {
      accessorKey: "city",
      header: ({ column }) => <DataTableColumnHeader label="City" column={column} />,
      cell: ({ row }) => row.original.city || "—",
    },
    {
      accessorKey: "state",
      header: ({ column }) => <DataTableColumnHeader label="State" column={column} />,
      cell: ({ row }) => row.original.state || "—",
    },
    {
      accessorKey: "email",
      header: ({ column }) => <DataTableColumnHeader label="Email" column={column} />,
      cell: ({ row }) => row.original.email,
    },
    {
      accessorKey: "message",
      header: ({ column }) => (
        <DataTableColumnHeader label="Message" column={column} />
      ),
      cell: ({ row }) => (
        <span className="block max-w-md truncate text-sm">{row.original.message}</span>
      ),
    },
    {
      accessorKey: "createdOn",
      header: ({ column }) => (
        <DataTableColumnHeader label="Created On" column={column} />
      ),
      cell: ({ row }) => (
        <span className="whitespace-nowrap tabular-nums text-foreground">
          {row.original.createdOn}
        </span>
      ),
    },
  ]
}
