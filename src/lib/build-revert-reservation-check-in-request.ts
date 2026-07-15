import { formatUsDateTime } from "@/lib/format-us-datetime"
import type { RevertReservationCheckInRequest } from "@/types/api/reservation-check-in"

type BuildRevertReservationCheckInRequestParams = {
  connectionName: string
  reservationId: string
  lastUpdateId: string
}

export function buildRevertReservationCheckInRequest({
  connectionName,
  reservationId,
  lastUpdateId,
}: BuildRevertReservationCheckInRequestParams): RevertReservationCheckInRequest {
  return {
    ConnectionString: connectionName,
    ReservationId: reservationId,
    LastUpdateDt: formatUsDateTime(new Date()),
    LastUpdateID: lastUpdateId,
  }
}
