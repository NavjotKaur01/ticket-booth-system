import type { ColumnDef } from "@tanstack/react-table"

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import {
  PreSaleCopyLinkButton,
  PreSaleRowActionsMenu,
} from "@/features/pre-sale/pre-sale-row-actions"
import type { PreSaleRecord } from "@/types/pre-sale"

type GetPreSaleColumnsParams = {
  onCopy: (record: PreSaleRecord) => void
  onDelete: (record: PreSaleRecord) => void
}

export function getPreSaleColumns({
  onCopy,
  onDelete,
}: GetPreSaleColumnsParams): ColumnDef<PreSaleRecord>[] {
  return [
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
        <span className="font-medium text-foreground">
          {row.original.createdBy}
        </span>
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
        <PreSaleCopyLinkButton
          accessCode={row.original.accessCode}
          onCopy={() => onCopy(row.original)}
        />
      ),
    },
    {
      id: "action",
      header: "Action",
      enableSorting: false,
      meta: { sticky: "right" },
      cell: ({ row }) => (
        <PreSaleRowActionsMenu onDelete={() => onDelete(row.original)} />
      ),
    },
  ]
}
