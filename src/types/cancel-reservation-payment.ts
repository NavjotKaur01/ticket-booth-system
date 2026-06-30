export type CancelReservationPaymentRow = {
  paymentId: string
  reservationId: string
  isSelected: boolean
  pymtStatus: string
  lastName: string
  firstName: string
  pymtType: string
  ccType: string
  cardNum: string
  amount: number
  auth: string
  pnref: string
  split: string
  paymentStatusCode: string
  canSelect: boolean
}
