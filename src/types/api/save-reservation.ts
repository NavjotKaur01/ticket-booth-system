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
  /** Desktop DLL typo — binder expects SplitServiceChage, not SplitServiceCharge. */
  SplitServiceChage?: number
  /** @deprecated Prefer SplitServiceChage for desktop binder parity. */
  SplitServiceCharge?: number
  SplitTotal?: number
  CustomerFirstName?: string
  CustomerLastName?: string
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
  /** Desktop edit-save prompt: email customer about the update. */
  IsSendUpdateToCustomer?: boolean
  CustomerModel?: SaveReservationCustomerRequest
  BusinessCustomerModel?: SaveReservationBusinessCustomerRequest
  PaymentModel?: SaveReservationPaymentRequest
  IsSplitReservation?: boolean
  SplitCustomerFirstName?: string
  SplitCustomerLastName?: string
  SplitParty?: number
  /** Desktop ReservationRequestModel field used by Split Party (UpdateReservation). */
  SpltParty?: number
  SplitSubTotal?: number
  SplitTaxes?: number
  TaxRate?: number
  SVCDiffAmount?: number
  SplitPromotionID?: string
  SplitPromotionCode?: string
  SplitPromoPass?: number
  SplitDiscount?: number
}

export type RemoveReservationPromoRequest = {
  ConnectionString: string
  ReservationId: string
}

export type MultiplePromoModel = {
  PromotionCode: string
  Passes: number
  Discount: number
  PromoTix: number
}

export type SaveSplitReservationRequestModel = Omit<
  SaveReservationRequest,
  'TixPaid' | 'TixComp' | 'TixDisc'
> & {
  TaxRate?: number
  SplitSubTotal?: number
  SplitServiceChage?: number
  SplitDiscount?: number
  SplitTaxes?: number
  SplitTotal?: number
  SplitParty?: number
  SplitPasses?: number
  SvcDiffAmount?: number
  IsMultiplePromo?: boolean
  MultiplePromoList?: MultiplePromoModel[]
  /** Omitted on partial split payments so parent ticket counts are not overwritten. */
  TixPaid?: number
  TixComp?: number
  TixDisc?: number
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

