import { useMemo } from "react"

import { DataTable } from "@/components/data-table/data-table"
import { getDomainConfigurationColumns } from "@/features/domain-configuration/domain-configuration-columns"
import type { DomainConfiguration } from "@/types/domain-configuration"

type DomainConfigurationDataTableProps = {
  data: DomainConfiguration[]
  loading?: boolean
  onEdit: (record: DomainConfiguration) => void
  onDelete: (record: DomainConfiguration) => void
}

export function DomainConfigurationDataTable({
  data,
  loading = false,
  onEdit,
  onDelete,
}: DomainConfigurationDataTableProps) {
  const columns = useMemo(
    () => getDomainConfigurationColumns({ onEdit, onDelete }),
    [onEdit, onDelete]
  )

  return (
    <DataTable
      columns={columns}
      data={data}
      emptyMessage={loading ? "Loading records..." : "No record found"}
      entityLabel="records"
      pageSize={10}
    />
  )
}
