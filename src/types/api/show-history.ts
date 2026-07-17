/**
 * ClubMan Calendar GetShowHistory / GetShowHistoryDetail response item.
 * Both endpoints return ShowHistoryModel[]; fields used differ by feature.
 */
export type ApiShowHistoryItem = {
  HistoryID: string
  HistoryDt: string
  HistoryAction?: string | null
  ShowID?: string | null
  LocationID?: string | null
  ShowDt?: string | null
  ShowArrival?: string | null
  ShowTm?: string | null
  ShowType?: string | null
  FloorPlanID?: string | null
  Headliner?: string | null
  Headliner2?: string | null
  Feature?: string | null
  Feature2?: string | null
  Opener?: string | null
  PromoCode?: string | null
  ShowDinner?: string | null
  NoPasses?: string | null
  VIP?: string | null
  Over21?: string | null
  DayOfShowCharge?: number | null
  PhoneCharge?: number | null
  WebCharge?: number | null
  WalkupCharge?: number | null
  LastUpdateID?: string | null
  LastUpdateDt?: string | null
  PaidFor?: string | null
  Hub?: string | null
  // Detail-history fields
  ShowDetID?: string | null
  ShowSec?: string | null
  ShowSecName?: string | null
  ShowSecOrder?: number | null
  Active?: string | null
  ShowPrice?: number | null
  ShowSmoking?: number | null
  ShowNon?: number | null
  ShowPromo?: string | null
  ShowAppearing?: string | null
  AssignSeats?: string | null
  Web?: string | null
}
