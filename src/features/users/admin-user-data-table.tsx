import { useMemo } from "react"

import { DataTable } from "@/components/data-table/data-table"
import { getAdminUserColumns } from "@/features/users/admin-user-columns"
import type { AdminUser } from "@/types/user-admin"

type AdminUserDataTableProps = {
  data: AdminUser[]
  loading?: boolean
  onEdit: (user: AdminUser) => void
}

export function AdminUserDataTable({
  data,
  loading = false,
  onEdit,
}: AdminUserDataTableProps) {
  const columns = useMemo(() => getAdminUserColumns({ onEdit }), [onEdit])

  return (
    <DataTable
      columns={columns}
      data={data}
      emptyMessage={loading ? "Loading users..." : "No record found"}
      entityLabel="records"
      pageSize={10}
    />
  )
}
