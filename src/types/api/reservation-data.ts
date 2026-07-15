export type ReservationDataItem = {
  ReservationID: string
  ShowId: string
  ScannerIn: number
  ResPayments: number | null
  CreatedBy: string
  CreateDt: string
  Dinner: string | null
  PartyNo: number
  CheckedIn: number
  Total: number
  TableNums: string | null
  LastUpdateID: string | null
  LastUpdateDt: string | null
  Promo: string | null
  LookupSDescSection: string | null
  LookupSDescSource: string | null
  CustFirstName: string | null
  CustLastName: string | null
  Note: string | null
  busName: string | null
  PaidForLastName: string | null
  PaidForFirstName: string | null
  EmailAddress: string | null
  SeatNumbers: string | null
  Phone?: string | null
  AreaCode?: string | null
  Phone1?: string | null
  Phone2?: string | null
  ResStatus?: string | null
  ReservationStatus?: string | null
  OldReservationID?: string | null
  LastFourCardDigit?: string | null
  CustPhone1?: string | null
  PromoPymts?: number | null
  Discount?: number | null
  Price?: number | null
}
