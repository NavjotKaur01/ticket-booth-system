import { ClipboardCopy } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"

import type { StandardRowAction } from "@/components/common/standard-row-actions-menu"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { dataTableActionsColumn } from "@/components/data-table/data-table-actions-column"
import { Button } from "@/components/ui/button"
import { formatCustomerLoginYn } from "@/lib/filter-customer-logins"
import { copyTextToClipboard } from "@/lib/export-table-data"
import type { CustomerLogin } from "@/types/customer-login"

type GetLoginManagementColumnsParams = {
  onEdit: (record: CustomerLogin) => void
}

export function getLoginManagementColumns({
  onEdit,
}: GetLoginManagementColumnsParams): ColumnDef<CustomerLogin>[] {
  return [
    {
      accessorKey: "id",
      header: ({ column }) => (
        <DataTableColumnHeader label="Customer ID" column={column} />
      ),
      cell: ({ row }) => (
        <span className="font-mono text-xs text-foreground">{row.original.id}</span>
      ),
    },
    {
      accessorKey: "locationLabel",
      header: ({ column }) => (
        <DataTableColumnHeader label="Location" column={column} />
      ),
      cell: ({ row }) => row.original.locationLabel,
    },
    {
      accessorKey: "firstName",
      header: ({ column }) => (
        <DataTableColumnHeader label="First Name" column={column} />
      ),
      cell: ({ row }) => row.original.firstName || "—",
    },
    {
      accessorKey: "lastName",
      header: ({ column }) => (
        <DataTableColumnHeader label="Last Name" column={column} />
      ),
      cell: ({ row }) => row.original.lastName || "—",
    },
    {
      accessorKey: "email",
      header: ({ column }) => <DataTableColumnHeader label="Email" column={column} />,
      cell: ({ row }) => row.original.email,
    },
    {
      accessorKey: "password",
      header: "Password",
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-sm tabular-nums">{row.original.password}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7 shrink-0"
            aria-label={`Copy password for ${row.original.email}`}
            onClick={() => void copyTextToClipboard(row.original.password)}
          >
            <ClipboardCopy className="size-3.5" />
          </Button>
        </div>
      ),
    },
    {
      accessorKey: "banned",
      header: ({ column }) => <DataTableColumnHeader label="Banned" column={column} />,
      cell: ({ row }) => (
        <span className="tabular-nums">{formatCustomerLoginYn(row.original.banned)}</span>
      ),
    },
    {
      accessorKey: "inactive",
      header: ({ column }) => (
        <DataTableColumnHeader label="Inactive" column={column} />
      ),
      cell: ({ row }) => (
        <span className="tabular-nums">{formatCustomerLoginYn(row.original.inactive)}</span>
      ),
    },
    {
      accessorKey: "active",
      header: ({ column }) => <DataTableColumnHeader label="Active" column={column} />,
      cell: ({ row }) => (
        <span className="tabular-nums">{formatCustomerLoginYn(row.original.active)}</span>
      ),
    },
    dataTableActionsColumn<CustomerLogin>({
      ariaLabel: "Customer login actions",
      hiddenActions: ["Add", "Delete"] satisfies readonly StandardRowAction[],
      onAction: (record, action) => {
        if (action === "Edit") {
          onEdit(record)
        }
      },
    }),
  ]
}
