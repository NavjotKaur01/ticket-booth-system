import { formatUsDateTime } from "@/lib/format-us-datetime"
import type { UpdateTableNumberReservationRequest } from "@/types/api/update-table-number"

type BuildUpdateTableNumberParams = {
  connectionName: string
  locationId: string
  reservationId: string
  tableNums: string
  lastUpdateId: string
}

export function buildUpdateTableNumberReservationRequest({
  connectionName,
  locationId,
  reservationId,
  tableNums,
  lastUpdateId,
}: BuildUpdateTableNumberParams): UpdateTableNumberReservationRequest {
  return {
    ConnectionString: connectionName,
    LocationId: locationId,
    ReservationId: reservationId,
    TableNums: tableNums.trim(),
    LastUpdateDt: formatUsDateTime(new Date()),
    LastUpdateId: lastUpdateId,
  }
}
