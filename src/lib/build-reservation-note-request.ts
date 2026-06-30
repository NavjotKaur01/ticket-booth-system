import { formatUsDateTime } from '@/lib/format-us-datetime'
import type { ReservationNoteRequest } from '@/types/api/reservation-note'

type BuildReservationNoteRequestParams = {
  connectionName: string
  locationId: string
  reservationId: string
  lastUpdateId: string
  reservationNote: string
}

export function buildReservationNoteRequest ({
  connectionName,
  locationId,
  reservationId,
  lastUpdateId,
  reservationNote
}: BuildReservationNoteRequestParams): ReservationNoteRequest {
  return {
    ConnectionString: connectionName,
    LocationId: locationId,
    ReservationId: reservationId,
    LastUpdateID: lastUpdateId,
    LastUpdateDt: formatUsDateTime(new Date()),
    ReservationNote: reservationNote
  }
}
