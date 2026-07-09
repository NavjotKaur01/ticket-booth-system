import { useMemo } from "react"

import { DataTable } from "@/components/data-table/data-table"
import { getFeatureTipsColumns } from "@/features/features-and-tips/feature-tips-columns"
import type { FeatureTip } from "@/types/feature-tip"

type FeatureTipsDataTableProps = {
  data: FeatureTip[]
  onEdit: (record: FeatureTip) => void
  onDelete: (record: FeatureTip) => void
}

export function FeatureTipsDataTable({
  data,
  onEdit,
  onDelete,
}: FeatureTipsDataTableProps) {
  const columns = useMemo(
    () => getFeatureTipsColumns({ onEdit, onDelete }),
    [onDelete, onEdit]
  )

  return (
    <DataTable
      columns={columns}
      data={data}
      emptyMessage="No feature tips found"
      entityLabel="records"
      pageSize={10}
    />
  )
}
