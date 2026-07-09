import { useMemo } from "react"

import { DataTable } from "@/components/data-table/data-table"
import { getLoginManagementColumns } from "@/features/login-management/login-management-columns"
import type { CustomerLogin } from "@/types/customer-login"

type LoginManagementDataTableProps = {
  data: CustomerLogin[]
  onEdit: (record: CustomerLogin) => void
}

export function LoginManagementDataTable({
  data,
  onEdit,
}: LoginManagementDataTableProps) {
  const columns = useMemo(() => getLoginManagementColumns({ onEdit }), [onEdit])

  return (
    <DataTable
      columns={columns}
      data={data}
      emptyMessage="No customer logins match the current filters."
      entityLabel="items"
      pageSize={10}
      getRowId={(row) => row.id}
    />
  )
}
