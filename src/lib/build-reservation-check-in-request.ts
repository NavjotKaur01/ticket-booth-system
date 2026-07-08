import { formatUsDateTime } from '@/lib/format-us-datetime'
import type { ReservationCheckInRequest } from '@/types/api/reservation-check-in'

type BuildReservationCheckInRequestParams = {
  connectionName: string
  reservationId: string
  lastUpdateId: string
}

export function buildReservationCheckInRequest({
  connectionName,
  reservationId,
  lastUpdateId,
}: BuildReservationCheckInRequestParams): ReservationCheckInRequest {
  return {
    ConnectionString: connectionName,
    ReservationId: reservationId,
    LastUpdateDt: formatUsDateTime(new Date()),
    LastUpdateId: lastUpdateId,
  }
}
