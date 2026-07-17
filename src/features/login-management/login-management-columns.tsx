import { Eye, EyeOff } from "lucide-react"
import { useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"

import type { StandardRowAction } from "@/components/common/standard-row-actions-menu"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { dataTableActionsColumn } from "@/components/data-table/data-table-actions-column"
import { Button } from "@/components/ui/button"
import { formatCustomerLoginYn } from "@/lib/filter-customer-logins"
import type { CustomerLogin } from "@/types/customer-login"

type GetLoginManagementColumnsParams = {
  onEdit: (record: CustomerLogin) => void
}

const MASKED_PASSWORD = "********"

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
        <LoginPasswordCell password={row.original.password} />
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

/** Phase 0: passwords masked by default; reveal is explicit and local to the row. */
function LoginPasswordCell({ password }: { password: string }) {
  const [revealed, setRevealed] = useState(false)
  const hasPassword = Boolean(password?.trim())

  return (
    <div className="flex items-center gap-1.5">
      <span className="font-mono text-sm tabular-nums">
        {revealed && hasPassword ? password : MASKED_PASSWORD}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-7 shrink-0"
        disabled={!hasPassword}
        aria-label={revealed ? "Hide password" : "Reveal password"}
        onClick={() => setRevealed((current) => !current)}
      >
        {revealed ? (
          <EyeOff className="size-3.5" />
        ) : (
          <Eye className="size-3.5" />
        )}
      </Button>
    </div>
  )
}
