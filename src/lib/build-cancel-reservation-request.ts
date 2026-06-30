import { formatApiDateTime } from '@/lib/format-datetime'
import type { CancelReservationRequest } from '@/types/api/cancel-reservation'
import type { CancelReservationPaymentRow } from '@/types/cancel-reservation-payment'

type BuildCancelReservationRequestParams = {
  connectionName: string
  locationId: string
  reservationId: string
  lastUpdateId: string
  reservationNote?: string
  payments?: CancelReservationPaymentRow[]
}

export function buildCancelReservationRequest ({
  connectionName,
  locationId,
  reservationId,
  lastUpdateId,
  reservationNote = '',
  payments = []
}: BuildCancelReservationRequestParams): CancelReservationRequest {
  return {
    ConnectionString: connectionName,
    LocationId: locationId,
    ReservationId: reservationId,
    LastUpdateID: lastUpdateId,
    LastUpdateDt: formatApiDateTime(new Date().toISOString()),
    ReservationNote: reservationNote.trim(),
    PaymentList: payments.map((payment) => ({
      ReservationID: payment.reservationId,
      PaymentID: payment.paymentId,
      PaymentStatusCode: payment.paymentStatusCode,
      IsSelected: payment.isSelected
    }))
  }
}
