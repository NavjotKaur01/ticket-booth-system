import { useMemo } from "react"

import type { StandardRowAction } from "@/components/common/standard-row-actions-menu"
import { DataTable } from "@/components/data-table/data-table"
import { createSystemDefaultColumns } from "@/features/system-defaults/system-defaults-columns"
import type { SystemDefault } from "@/types/system-default"

type SystemDefaultsDataTableProps = {
  data: SystemDefault[]
  hiddenActions?: readonly StandardRowAction[]
}

export function SystemDefaultsDataTable({
  data,
  hiddenActions,
}: SystemDefaultsDataTableProps) {
  const columns = useMemo(
    () => createSystemDefaultColumns({ hiddenActions }),
    [hiddenActions]
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
