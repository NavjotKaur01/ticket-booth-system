import { useMemo } from "react"

import { DataTable } from "@/components/data-table/data-table"
import { createUserAccessColumns } from "@/features/user-access/user-access-columns"
import type { ReportPermission } from "@/types/user-access"

type UserAccessDataTableProps = {
  data: ReportPermission[]
  onToggle: (
    id: string,
    role: "user" | "manager" | "admin",
    checked: boolean
  ) => void
}

export function UserAccessDataTable({
  data,
  onToggle,
}: UserAccessDataTableProps) {
  const columns = useMemo(
    () => createUserAccessColumns({ onToggle }),
    [onToggle]
  )

  return (
    <DataTable
      columns={columns}
      data={data}
      emptyMessage="No reports found"
      entityLabel="reports"
      pageSize={10}
    />
  )
}
