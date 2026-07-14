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
  dueAmt?: number
}

export type ReservationDetail = {
  ReservationID?: string
  CustomerID?: string | null
  ShowId?: string | null
  ShowDetID?: string | null
  PartyNo?: number | null
  OrigPartyNo?: number | null
  CheckedIn?: number | null
  ResSec?: string | null
  Sources?: string | null
  ResSource?: string | null
  Promo?: string | null
  NumPasses?: number | null
  SubTotal?: number | null
  SVC?: number | null
  Discount?: number | null
  SalesTax?: number | null
  Total?: number | null
  Dinner?: string | null
  VIP?: string | null
  ResPayments?: number | null
  CustFirstName?: string | null
  CustLastName?: string | null
  busName?: string | null
  busFirstName?: string | null
  busLastName?: string | null
  Note?: string | null
  ReservationNotes?: string | null
  PaymentList?: ReservationDetailPaymentItem[]
  Price?: number | null
  DayOfShowFee?: number | null
  PhoneInFee?: number | null
  WalkUpFee?: number | null
  WebFee?: number | null
  LookupSDescSource?: string | null
  ResStatus?: string | null
  Memo?: string | null
  TixPaid?: number | null
  TixComp?: number | null
  TixDisc?: number | null
}
