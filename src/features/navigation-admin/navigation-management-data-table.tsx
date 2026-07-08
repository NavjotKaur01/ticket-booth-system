import { useMemo } from "react"

import { DataTable } from "@/components/data-table/data-table"
import { getNavigationManagementColumns } from "@/features/navigation-admin/navigation-management-columns"
import type { NavigationManagementRecord } from "@/types/navigation-admin"

type NavigationManagementDataTableProps = {
  data: NavigationManagementRecord[]
  onEdit: (record: NavigationManagementRecord) => void
  onDelete: (record: NavigationManagementRecord) => void
}

export function NavigationManagementDataTable({
  data,
  onEdit,
  onDelete,
}: NavigationManagementDataTableProps) {
  const columns = useMemo(
    () => getNavigationManagementColumns({ onEdit, onDelete }),
    [onEdit, onDelete]
  )

  return (
    <DataTable
      columns={columns}
      data={data}
      emptyMessage="No navigation records found"
      entityLabel="records"
      pageSize={15}
    />
  )
}
