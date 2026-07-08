import { useMemo } from "react"

import { DataTable } from "@/components/data-table/data-table"
import { getVenueGatewayColumns } from "@/features/venue-gateway/venue-gateway-columns"
import type { VenueGateway } from "@/types/venue-gateway"

type VenueGatewayDataTableProps = {
  data: VenueGateway[]
  loading?: boolean
  onEdit: (record: VenueGateway) => void
}

export function VenueGatewayDataTable({
  data,
  loading = false,
  onEdit,
}: VenueGatewayDataTableProps) {
  const columns = useMemo(() => getVenueGatewayColumns({ onEdit }), [onEdit])

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
