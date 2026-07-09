import { useMemo } from "react"

import { DataTable } from "@/components/data-table/data-table"
import { getSumContactLeadColumns } from "@/features/sum-contact-leads/sum-contact-lead-columns"
import type { SumContactLead } from "@/types/sum-contact-lead"

type SumContactLeadDataTableProps = {
  data: SumContactLead[]
}

export function SumContactLeadDataTable({ data }: SumContactLeadDataTableProps) {
  const columns = useMemo(() => getSumContactLeadColumns(), [])

  return (
    <DataTable
      columns={columns}
      data={data}
      emptyMessage="No data to display"
      entityLabel="items"
      pageSize={10}
      getRowId={(row) => row.id}
    />
  )
}
