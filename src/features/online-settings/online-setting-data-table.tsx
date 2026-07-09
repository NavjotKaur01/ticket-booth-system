import { useMemo } from "react"

import { DataTable } from "@/components/data-table/data-table"
import { getOnlineSettingColumns } from "@/features/online-settings/online-setting-columns"
import type { OnlineSetting } from "@/types/online-setting"

type OnlineSettingDataTableProps = {
  data: OnlineSetting[]
  onEdit: (record: OnlineSetting) => void
  onDelete: (record: OnlineSetting) => void
}

export function OnlineSettingDataTable({
  data,
  onEdit,
  onDelete,
}: OnlineSettingDataTableProps) {
  const columns = useMemo(
    () => getOnlineSettingColumns({ onEdit, onDelete }),
    [onEdit, onDelete]
  )

  return (
    <DataTable
      columns={columns}
      data={data}
      emptyMessage="No record found"
      entityLabel="records"
      pageSize={10}
    />
  )
}
