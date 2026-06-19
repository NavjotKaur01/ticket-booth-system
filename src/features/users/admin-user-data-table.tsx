import { DataTable } from "@/components/data-table/data-table"
import { adminUserColumns } from "@/features/users/admin-user-columns"
import type { AdminUser } from "@/types/user-admin"

type AdminUserDataTableProps = {
  data: AdminUser[]
}

export function AdminUserDataTable({ data }: AdminUserDataTableProps) {
  return (
    <DataTable
      columns={adminUserColumns}
      data={data}
      emptyMessage="No record found"
      entityLabel="records"
      pageSize={10}
    />
  )
}
