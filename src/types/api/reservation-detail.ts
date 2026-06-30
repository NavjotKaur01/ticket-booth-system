export type ReservationDetailPaymentItem = {
  PaymentID: string
  ReservationID?: string | null
  CustomerID?: string | null
  PymtStatus?: string | null
  PymtType?: string | null
  CCType?: string | null
  CardNum?: string | null
  Amount?: number | null
  Auth?: string | null
  PNREF?: string | null
  Split?: string | null
  LastName?: string | null
  FirstName?: string | null
  PaymentTypeCode?: string | null
  PaymentStatusCode?: string | null
  IsSelected?: boolean
}

export type ReservationDetail = {
  ReservationID?: string
  PartyNo?: number | null
  ResPayments?: number | null
  CustFirstName?: string | null
  CustLastName?: string | null
  busName?: string | null
  busFirstName?: string | null
  busLastName?: string | null
  Note?: string | null
  ReservationNotes?: string | null
  PaymentList?: ReservationDetailPaymentItem[]
}
