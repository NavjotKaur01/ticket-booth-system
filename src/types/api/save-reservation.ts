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
  SplitTaxes?: number
  SplitServiceCharge?: number
  SplitTotal?: number
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
  /** When true, create reservation only (no payment). Omit when saving with payment. */
  IsSaveReservationOnly?: boolean
  ReservationId?: string
  IsTicketPartyUpdate?: boolean
  IsPaymentLoad?: boolean
  ResSelectedPromotionID?: string
  CustomerModel?: SaveReservationCustomerRequest
  BusinessCustomerModel?: SaveReservationBusinessCustomerRequest
  PaymentModel?: SaveReservationPaymentRequest
}

export type SaveSplitReservationRequestModel = SaveReservationRequest & {
  TaxRate?: number
  SplitSubTotal?: number
  SplitServiceChage?: number
  SplitDiscount?: number
  SplitTaxes?: number
  SplitTotal?: number
  SplitParty?: number
  SplitPasses?: number
  SvcDiffAmount?: number
}

export type UpdateSplitReservationRequestModel = {
  ConnectionString: string
  ReservationId: string
  ShowID: string
  ShowDetID: string
  ShowSec: string
  ShowPrice: number
  DayOfShowFee: number
  PhoneInFee: number
  WalkUpFee: number
  WebFee: number
  SourceLookUpCode: string
  Party: number
  SubTotal: number
  ServiceChage: number
  Discount: number
  Taxes: number
  Total: number
  LastUpdateDt: string
  LastUpdateId: string
  TableNum: string | null
}

