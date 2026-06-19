import type { ColumnDef } from "@tanstack/react-table"

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { Checkbox } from "@/components/ui/checkbox"
import type { ReportPermission } from "@/types/user-access"

type PermissionRole = "user" | "manager" | "admin"

type UserAccessColumnsOptions = {
  onToggle: (id: string, role: PermissionRole, checked: boolean) => void
}

export function createUserAccessColumns({
  onToggle,
}: UserAccessColumnsOptions): ColumnDef<ReportPermission>[] {
  const roleColumn = (
    role: PermissionRole,
    label: string
  ): ColumnDef<ReportPermission> => ({
    accessorKey: role,
    header: ({ column }) => (
      <div className="flex justify-center">
        <DataTableColumnHeader label={label} column={column} />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex justify-center">
        <Checkbox
          checked={row.original[role]}
          onCheckedChange={(value) =>
            onToggle(row.original.id, role, value === true)
          }
          aria-label={`${label} access for ${row.original.name}`}
        />
      </div>
    ),
  })

  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader label="List" column={column} />
      ),
      cell: ({ row }) => (
        <span className="font-medium text-foreground">{row.original.name}</span>
      ),
    },
    roleColumn("user", "User"),
    roleColumn("manager", "Manager"),
    roleColumn("admin", "Admin"),
  ]
}
