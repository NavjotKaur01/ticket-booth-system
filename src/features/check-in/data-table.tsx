import { DataTable } from "@/components/data-table/data-table"
import { checkInColumns } from "@/features/check-in/columns"
import type { CheckInRecord } from "@/types/check-in"

type CheckInDataTableProps = {
  data: CheckInRecord[]
}

/** Check-in guest table — wraps the shared DataTable with check-in columns. */
export function CheckInDataTable({ data }: CheckInDataTableProps) {
  return (
    <DataTable
      columns={checkInColumns}
      data={data}
      emptyMessage="No check-in records found."
      entityLabel="records"
      pageSize={12}
    />
  )
}
