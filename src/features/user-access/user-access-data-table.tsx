import { useMemo } from "react"

import { DataTable } from "@/components/data-table/data-table"
import { createUserAccessColumns } from "@/features/user-access/user-access-columns"
import type {
  PermissionRole,
  ReportPermission,
  UserAccessEditableRoles,
} from "@/types/user-access"

type UserAccessDataTableProps = {
  data: ReportPermission[]
  emptyMessage?: string
  editableRoles: UserAccessEditableRoles
  onToggle: (id: string, role: PermissionRole, checked: boolean) => void
}

export function UserAccessDataTable({
  data,
  emptyMessage = "No reports found",
  editableRoles,
  onToggle,
}: UserAccessDataTableProps) {
  const columns = useMemo(
    () => createUserAccessColumns({ editableRoles, onToggle }),
    [editableRoles, onToggle]
  )

  return (
    <DataTable
      columns={columns}
      data={data}
      emptyMessage={emptyMessage}
      entityLabel="reports"
      pageSize={10}
    />
  )
}
