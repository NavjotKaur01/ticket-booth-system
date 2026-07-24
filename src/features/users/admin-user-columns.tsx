import type { ColumnDef } from "@tanstack/react-table"

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { AdminUserRowActionsMenu } from "@/features/users/admin-user-row-actions-menu"
import type { AdminUser } from "@/types/user-admin"

type GetAdminUserColumnsParams = {
  onEdit: (user: AdminUser) => void
  onDelete: (user: AdminUser) => void
}

export function getAdminUserColumns({
  onEdit,
  onDelete,
}: GetAdminUserColumnsParams): ColumnDef<AdminUser>[] {
  return [
    {
      accessorKey: "lastName",
      header: ({ column }) => (
        <DataTableColumnHeader label="Last Name" column={column} />
      ),
      cell: ({ row }) => (
        <span className="font-medium text-foreground">{row.original.lastName}</span>
      ),
    },
    {
      accessorKey: "firstName",
      header: ({ column }) => (
        <DataTableColumnHeader label="First Name" column={column} />
      ),
    },
    {
      accessorKey: "userName",
      header: ({ column }) => (
        <DataTableColumnHeader label="User Name" column={column} />
      ),
    },
    {
      accessorKey: "password",
      header: ({ column }) => (
        <DataTableColumnHeader label="Password" column={column} />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.password}</span>
      ),
    },
    {
      accessorKey: "security",
      header: ({ column }) => (
        <DataTableColumnHeader label="Security" column={column} />
      ),
    },
    {
      accessorKey: "lastUpdateId",
      header: ({ column }) => (
        <DataTableColumnHeader label="Last UpdateID" column={column} />
      ),
    },
    {
      accessorKey: "lastUpdateDt",
      header: ({ column }) => (
        <DataTableColumnHeader label="Last UpdateDt" column={column} />
      ),
      cell: ({ row }) => (
        <span className="whitespace-nowrap tabular-nums">
          {row.original.lastUpdateDt}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader label="Status" column={column} />
      ),
    },
    {
      id: "action",
      header: "Action",
      enableSorting: false,
      meta: { sticky: "right" },
      cell: ({ row }) => (
        <AdminUserRowActionsMenu
          user={row.original}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ),
    },
  ]
}
