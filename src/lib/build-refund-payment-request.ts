import { formatUsDateTime } from '@/lib/format-us-datetime'
import type { ApiPaymentDetail } from '@/types/api/reservation-payment-actions'
import type {
  RefundPaymentRequest,
  VoidPaymentRequest,
} from '@/types/api/reservation-payment-actions'

type BuildRefundPaymentRequestParams = {
  connectionName: string
  locationId: string
  lastUpdateId: string
  refundAmount: number
  /** Full payment record for the card being refunded (GetPaymentById). */
  payment: ApiPaymentDetail
}

/**
 * Mirrors desktop ReservationVM.IsRefundPayment reqModel: PaymentType from the
 * selected card, decrypted card number, and the card's PNREF/Auth/exp details.
 */
export function buildRefundPaymentRequest({
  connectionName,
  locationId,
  lastUpdateId,
  refundAmount,
  payment,
}: BuildRefundPaymentRequestParams): RefundPaymentRequest {
  return {
    ConnectionString: connectionName,
    LocationId: locationId,
    LastUpdateId: lastUpdateId,
    LastUpdateDt: formatUsDateTime(new Date()),
    PaymentType: (payment.PaymentTypeCode ?? '').trim().toUpperCase(),
    RefundAmount: Math.round(refundAmount * 100) / 100,
    PNREF: payment.PNREF ?? '',
    CreditCardNum: payment.DecryptCardNum ?? payment.CardNum ?? '',
    CCTypeCode: payment.CCTypeCode ?? '',
    ExpMonth: payment.ExpMo ?? '',
    ExpYear: payment.ExpYr ?? '',
    ReservationId: payment.ReservationID ?? '',
    CustomerId: payment.CustomerID ?? '',
    PromoCode: payment.PromoCode ?? '',
    Auth: payment.Auth ?? '',
    LastName: payment.LastName ?? '',
    FirstName: payment.FirstName ?? '',
  }
}

type BuildVoidPaymentRequestParams = {
  connectionName: string
  locationId: string
  lastUpdateId: string
  paymentId: string
}

/** Mirrors desktop ReservationVM.VoidCreditAndGiftCardPayment reqModel. */
export function buildVoidPaymentRequest({
  connectionName,
  locationId,
  lastUpdateId,
  paymentId,
}: BuildVoidPaymentRequestParams): VoidPaymentRequest {
  return {
    ConnectionString: connectionName,
    LocationId: locationId,
    LastUpdateId: lastUpdateId,
    LastUpdateDt: formatUsDateTime(new Date()),
    PaymentID: paymentId,
  }
}
