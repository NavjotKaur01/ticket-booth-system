export type CancelReservationPaymentItem = {
  ReservationID: string
  PaymentID: string
  PaymentStatusCode: string
  IsSelected: boolean
}

export type CancelReservationRequest = {
  ConnectionString: string
  LocationId: string
  ReservationId: string
  LastUpdateID: string
  LastUpdateDt: string
  ReservationNote: string
  PaymentList: CancelReservationPaymentItem[]
}
