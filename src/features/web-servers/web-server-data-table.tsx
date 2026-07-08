import { useMemo } from "react"

import { DataTable } from "@/components/data-table/data-table"
import { getWebServerColumns } from "@/features/web-servers/web-server-columns"
import type { WebServer } from "@/types/web-server"

type WebServerDataTableProps = {
  data: WebServer[]
  loading?: boolean
  onEdit: (server: WebServer) => void
}

export function WebServerDataTable({
  data,
  loading = false,
  onEdit,
}: WebServerDataTableProps) {
  const columns = useMemo(() => getWebServerColumns({ onEdit }), [onEdit])

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
