export type Promotion = {
  id: string
  promotionName: string
  promotionCode: string
  startDate: string
  endDate: string
  weekDays: string
  walkup: string
  phoneIn: string
  web: string
  mgr: string
  useShowFee: string
  dayOfShowFee: string
  walkupFee: string
  phoneInFee: string
  ccReq: string
  lastUpdateId: string
  lastUpdateDt: string
  expired: boolean
}

export type PromotionFilters = {
  promotionName: string
  promotionCode: string
  /** Discount category filter — matches desktop DiscountType dropdown */
  discountType: string
  displayExpired: boolean
}

export const DEFAULT_PROMOTION_FILTERS: PromotionFilters = {
  promotionName: "",
  promotionCode: "",
  discountType: "all-promos",
  displayExpired: false,
}
