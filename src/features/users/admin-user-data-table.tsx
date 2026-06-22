import { DataTable } from "@/components/data-table/data-table"
import { adminUserColumns } from "@/features/users/admin-user-columns"
import type { AdminUser } from "@/types/user-admin"

type AdminUserDataTableProps = {
  data: AdminUser[]
  loading?: boolean
}

export function AdminUserDataTable({
  data,
  loading = false,
}: AdminUserDataTableProps) {
  return (
    <DataTable
      columns={adminUserColumns}
      data={data}
      emptyMessage={loading ? "Loading users..." : "No record found"}
      entityLabel="records"
      pageSize={10}
    />
  )
}
