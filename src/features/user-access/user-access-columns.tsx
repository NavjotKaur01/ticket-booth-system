import type { ColumnDef } from "@tanstack/react-table"

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { Checkbox } from "@/components/ui/checkbox"
import type {
  PermissionRole,
  ReportPermission,
  UserAccessEditableRoles,
} from "@/types/user-access"

type UserAccessColumnsOptions = {
  editableRoles: UserAccessEditableRoles
  onToggle: (id: string, role: PermissionRole, checked: boolean) => void
}

export function createUserAccessColumns({
  editableRoles,
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
    cell: ({ row }) => {
      const enabled = editableRoles[role]
      return (
        <div className="flex justify-center">
          <Checkbox
            checked={row.original[role]}
            disabled={!enabled}
            onCheckedChange={(value) => {
              if (!enabled) return
              onToggle(row.original.id, role, value === true)
            }}
            aria-label={`${label} access for ${row.original.name}`}
          />
        </div>
      )
    },
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
