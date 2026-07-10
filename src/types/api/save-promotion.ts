export type SavePromotionRequest = {
  Connection: string
  LocationID: string
  LastUpdateID: string
  LastUpdateDt: string
  PromotionName: string
  PromotionCode: string
  StartDt: string
  EndDt: string | null
  IsWalkup: boolean
  IsPhoneIn: boolean
  IsWeb: boolean
  IsManagerComp: boolean
  IsShowFees: boolean
  DayOfShowFee: number | null
  PhoneInFee: number | null
  WalkUpFee: number | null
  WebFee: number | null
  CreditCard: string
  ShowDay: string
  MinTix: number | null
  IsAdditionalAmountDoller: boolean
  IsAdditionalAmountTicket: boolean
  DollarMax: number | null
  TixMax: number | null
  DiscountType: string
  IsOverrideCCFee: boolean
  IsDiscountAmountDoller: boolean
  IsDiscountAmountPercentage: boolean
  IsBuy: boolean
  IsSpecialPromotion: boolean
  DollarOff?: number | null
  PercOff?: number | null
  BuyTix?: number | null
  BuyTixFree?: number | null
  SpecialReq?: string | null
  Price?: number | null
}

/** Matches desktop `PromotionsRequestModel` for `UpdatePromotion` (includes PromotionId). */
export type UpdatePromotionRequest = SavePromotionRequest & {
  PromotionId: string
}
