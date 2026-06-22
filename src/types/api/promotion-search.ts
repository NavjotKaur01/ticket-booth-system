export type SearchPromotionRequest = {
  Connection: string
  LocationID: string
  DiscountType: string
  IsShowExpired: boolean
  PromotionName: string
  PromotionCode: string
}

export type ApiPromotionSearchItem = {
  PromotionID: string
  LocationID: string
  PromotionName: string
  PromotionCode: string
  WalkUp: string
  Web: string
  PhoneIn: string
  ManagerOnly: string
  CCReq: string
  StartDt: string
  EndDt: string | null
  DiscountType: string
  WeekDays: string
  BuyTix: number | null
  BuyTixFree: number | null
  SpecialReq: string | null
  DollarOff: number | null
  PercOff: number | null
  Price: number | null
  MinTix: number | null
  DollarMax: number | null
  TixMax: number | null
  LastUpdateID: string
  LastUpdateDt: string
  DayOfShowFee: number | null
  WalkUpFee: number | null
  PhoneInFee: number | null
  WebFee: number | null
  UseShowFees: string
  overrideccfee: boolean
  Flag: string | null
  IsSelected: boolean
  ShowId: string | null
  PromoTix: number
  IsPhoneInRequest: boolean | null
  IsWalkupRequest: boolean | null
  IsWebRequest: boolean | null
}
