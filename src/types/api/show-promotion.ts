export type GetShowPromotionRequest = {
  ConnectionString: string
  LocationId: string
  CalendarShowId: string
  TodayDate: string
}

export type ApiShowPromotionItem = {
  PromotionID: string
  LocationID?: string | null
  PromotionName?: string | null
  PromotionCode?: string | null
  WalkUp?: string | null
  Web?: string | null
  PhoneIn?: string | null
  ManagerOnly?: string | null
  CCReq?: string | null
  StartDt?: string | null
  EndDt?: string | null
  DiscountType?: string | null
  WeekDays?: string | null
  BuyTix?: number | null
  BuyTixFree?: number | null
  SpecialReq?: string | null
  DollarOff?: number | null
  PercOff?: number | null
  Price?: number | null
  MinTix?: number | null
  DollarMax?: number | null
  TixMax?: number | null
  DayOfShowFee?: number | null
  WalkUpFee?: number | null
  PhoneInFee?: number | null
  WebFee?: number | null
  UseShowFees?: string | null
  IsSelected?: boolean | null
  Flag?: string | null
  SpecialEng?: string | null
  ShowPromotionAddInList?: string[] | null
  ShowPromotionRemoveInList?: string[] | null
  LastUpdateID?: string | null
  LastUpdateDt?: string | null
}

export type SaveShowPromotionItem = {
  PromotionID: string
  PromotionCode: string
  Flag: string | null
  IsSelected: boolean
  LastUpdateDt: string
  LastUpdateID: string
}

export type SaveShowPromotionRequest = {
  ConnectionString: string
  LocationId: string
  CalendarShowId: string
  LastUpdateDt: string
  LastUpdateId: string
  PromotionList: SaveShowPromotionItem[]
}
