import { DataTable } from "@/components/data-table/data-table"
import { systemDefaultColumns } from "@/features/system-defaults/system-defaults-columns"
import type { SystemDefault } from "@/types/system-default"

type SystemDefaultsDataTableProps = {
  data: SystemDefault[]
}

export function SystemDefaultsDataTable({ data }: SystemDefaultsDataTableProps) {
  return (
    <DataTable
      columns={systemDefaultColumns}
      data={data}
      emptyMessage="No record found"
      entityLabel="records"
      pageSize={10}
    />
  )
}
