import type { ColumnDef } from "@tanstack/react-table"

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { BusinessContactRowActionsMenu } from "@/features/business-contacts/business-contact-row-actions-menu"
import {
  getBusinessContactName,
  type BusinessContact,
} from "@/types/business-contact"

export const businessContactColumns: ColumnDef<BusinessContact>[] = [
  {
    accessorKey: "businessName",
    header: ({ column }) => (
      <DataTableColumnHeader label="Business Name" column={column} />
    ),
    cell: ({ row }) => (
      <span className="font-medium text-foreground">
        {row.original.businessName}
      </span>
    ),
  },
  {
    id: "contactName",
    accessorFn: (row) => getBusinessContactName(row),
    header: ({ column }) => (
      <DataTableColumnHeader label="Contact Name" column={column} />
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
    accessorKey: "webAddress",
    header: ({ column }) => (
      <DataTableColumnHeader label="Web Address" column={column} />
    ),
  },
  {
    accessorKey: "address",
    header: ({ column }) => (
      <DataTableColumnHeader label="Address" column={column} />
    ),
  },
  {
    accessorKey: "phoneNo",
    header: ({ column }) => (
      <DataTableColumnHeader label="Phone No." column={column} />
    ),
    cell: ({ row }) => (
      <span className="whitespace-nowrap tabular-nums">{row.original.phoneNo}</span>
    ),
  },
  {
    accessorKey: "fax",
    header: ({ column }) => (
      <DataTableColumnHeader label="Fax" column={column} />
    ),
    cell: ({ row }) => (
      <span className="whitespace-nowrap tabular-nums">
        {row.original.fax || "\u00A0"}
      </span>
    ),
  },
  {
    id: "action",
    header: "Action",
    enableSorting: false,
    meta: { sticky: "right" },
    cell: () => <BusinessContactRowActionsMenu />,
  },
]
