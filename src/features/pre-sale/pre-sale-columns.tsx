import type { ColumnDef } from "@tanstack/react-table"

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import {
  PreSaleCopyLinkButton,
  PreSaleRowActionsMenu,
} from "@/features/pre-sale/pre-sale-row-actions"
import type { PreSaleRecord } from "@/types/pre-sale"

export const preSaleColumns: ColumnDef<PreSaleRecord>[] = [
  {
    accessorKey: "accessCode",
    header: ({ column }) => (
      <DataTableColumnHeader label="Access Code" column={column} />
    ),
    cell: ({ row }) => (
      <span className="font-medium text-foreground">
        {row.original.accessCode}
      </span>
    ),
  },
  {
    accessorKey: "startDate",
    header: ({ column }) => (
      <DataTableColumnHeader label="Start Date" column={column} />
    ),
    cell: ({ row }) => (
      <span className="whitespace-nowrap tabular-nums">
        {row.original.startDate}
      </span>
    ),
  },
  {
    accessorKey: "endDate",
    header: ({ column }) => (
      <DataTableColumnHeader label="End Date" column={column} />
    ),
    cell: ({ row }) => (
      <span className="whitespace-nowrap tabular-nums">
        {row.original.endDate}
      </span>
    ),
  },
  {
    accessorKey: "createdBy",
    header: ({ column }) => (
      <DataTableColumnHeader label="Created By" column={column} />
    ),
    cell: ({ row }) => (
      <button
        type="button"
        className="cursor-pointer font-medium text-primary hover:underline"
      >
        {row.original.createdBy}
      </button>
    ),
  },
  {
    accessorKey: "createDate",
    header: ({ column }) => (
      <DataTableColumnHeader label="Create Date" column={column} />
    ),
    cell: ({ row }) => (
      <span className="whitespace-nowrap tabular-nums">
        {row.original.createDate}
      </span>
    ),
  },
  {
    id: "copyLink",
    header: "Copy Link",
    enableSorting: false,
    cell: ({ row }) => (
      <PreSaleCopyLinkButton accessCode={row.original.accessCode} />
    ),
  },
  {
    id: "action",
    header: "Action",
    enableSorting: false,
    meta: { sticky: "right" },
    cell: () => <PreSaleRowActionsMenu />,
  },
]
