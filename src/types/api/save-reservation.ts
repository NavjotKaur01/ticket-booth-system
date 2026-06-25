export type SaveReservationPaymentRequest = {
  PaymentType: string
  PaymentStatus: string
  BillingAddress: string
  BillingZip: string
  PaymentAmount: number
  Taxes: number
  ServiceCharge: number
  GiftCardNumber?: string
  CCType?: string
  CreditCardNubmer?: string
  CCExpYear?: string
  CCExpMonth?: string
  SecurityCode?: string
  IsSwipeCard?: boolean
  IsCustomerSearch?: boolean
  IsSplitPayment?: boolean
  WebGiftCertificateNumber?: string
}

export type SaveReservationCustomerRequest = {
  CustomerId: string
  CustLastName: string
  CustFirstName: string
  Email1: string
  AreaCode: string
  Phone1: string
  Phone2: string
}

export type SaveReservationBusinessCustomerRequest = {
  BusinessId: string
  BusinessName: string
  BusLastName: string
  BusFirstName: string
  AreaCode: string
  Phone1: string
  Phone2: string
}

export type SaveReservationRequest = {
  ConnectionString: string
  LocationId: string
  UserRights?: string
  CustomerId: string
  ShowID: string
  ShowDetID: string
  ShowSec: string
  ShowPrice: number
  DayOfShowFee: number
  PhoneInFee: number
  WalkUpFee: number
  WebFee: number
  LookUpCode: string
  ReservationSource?: string
  OrigParty: number
  Party: number
  PromotionID: string
  PromotionCode: string
  Passes: number
  SubTotal: number
  ServiceChage: number
  Discount: number
  Taxes: number
  Total: number
  ReservationStatus: string
  IsDinner: boolean
  IsVIP: boolean
  LastUpdateDt: string
  LastUpdateId: string
  ReservationNote: string
  Action: string
  ActionForm: string
  PaymentTypeLookupCode?: string
  PaymentAmount?: number
  IsReservationCheckedIn: boolean
  TixPaid: number
  TixComp: number
  TixDisc: number
  IsSaveReservationOnly: boolean
  ReservationId?: string
  IsTicketPartyUpdate?: boolean
  CustomerModel?: SaveReservationCustomerRequest
  BusinessCustomerModel?: SaveReservationBusinessCustomerRequest
  PaymentModel?: SaveReservationPaymentRequest
}
