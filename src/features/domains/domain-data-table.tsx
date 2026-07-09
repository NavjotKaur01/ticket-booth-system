import { useMemo } from "react"

import { DataTable } from "@/components/data-table/data-table"
import { getDomainColumns } from "@/features/domains/domain-columns"
import type { Domain } from "@/types/domain"

type DomainDataTableProps = {
  data: Domain[]
  loading?: boolean
  onEdit: (domain: Domain) => void
  onDelete: (domain: Domain) => void
}

export function DomainDataTable({
  data,
  loading = false,
  onEdit,
  onDelete,
}: DomainDataTableProps) {
  const columns = useMemo(
    () => getDomainColumns({ onEdit, onDelete }),
    [onEdit, onDelete]
  )

  return (
    <DataTable
      columns={columns}
      data={data}
      emptyMessage={loading ? "Loading records..." : "No record found"}
      entityLabel="records"
      pageSize={20}
    />
  )
}
