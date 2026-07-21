/**
 * Refund / Void payment shapes mirroring the desktop ClubMan models
 * (ClubmanWebApi.Common.Models). Field names/casing match the desktop
 * `reqModel` population in `ReservationVM` so the same backend endpoints bind.
 */

/** Subset of desktop `PaymentModel` returned by GetPaymentById. */
export type ApiPaymentDetail = {
  PaymentID: string
  ReservationID: string | null
  CustomerID: string | null
  PymtStatus: string | null
  PymtType: string | null
  PaymentTypeCode: string | null
  PaymentStatusCode: string | null
  PromoCode: string | null
  CCType: string | null
  CCTypeCode: string | null
  CardNum: string | null
  DecryptCardNum: string | null
  ExpMo: string | null
  ExpYr: string | null
  Auth: string | null
  PNREF: string | null
  Amount: number | null
  SVC: number | null
  LastName: string | null
  FirstName: string | null
}

/** Desktop ReservationCancelRequestModel fields used by RefundPayment. */
export type RefundPaymentRequest = {
  ConnectionString: string
  LocationId: string
  LastUpdateId: string
  LastUpdateDt: string
  PaymentType: string
  RefundAmount: number
  PNREF: string
  CreditCardNum: string
  CCTypeCode: string
  ExpMonth: string
  ExpYear: string
  ReservationId: string
  CustomerId: string
  PromoCode: string
  Auth: string
  LastName: string
  FirstName: string
}

/** Desktop ReservationRequestModel fields used by VoidCreditAndGiftCardPayment. */
export type VoidPaymentRequest = {
  ConnectionString: string
  LocationId: string
  LastUpdateId: string
  LastUpdateDt: string
  PaymentID: string
}
