/**
 * ClubMan ShowTimesVM → Adminstrator ShowDef APIs.
 * Separate from Calendar SaveShowRequestModel.
 */

export type ApiDefShowItem = {
  ShowDefID: string
  LocationID?: string | null
  ShowDefDay?: string | null
  ShowDefType?: string | null
  ShowDefArrival?: string | null
  ShowDefTime?: string | null
  ShowDefFloorPlan?: string | null
  ShowDefDinner?: string | null
  ShowDefNPasses?: string | null
  ShowDefVIP?: string | null
  ShowDef21?: string | null
  ShowDefPromo?: string | null
  ShowDefAssignSeat?: string | null
  ShowDefAssign?: string | null
  ShowDefHub?: string | null
  UpdateCount?: number | null
  LastUpdateID?: string | null
  LastUpdateDt?: string | null
  ShowDetID?: string | null
  ShowDetSec?: string | null
  ShowSecOrder?: number | null
  ShowDetPrice?: number | null
  ShowDetSmoking?: number | null
  ShowDetNon?: number | null
  ShowDetDinner?: string | null
  ShowDetWeb?: string | null
  ShowRestrictedPromo?: string | null
  ShowDefDetwalkupsvc?: number | null
  ShowDefDetphonesvc?: number | null
  ShowDefDetwebsvc?: number | null
}

export type ShowDefSectionDetModel = {
  ShowDetID?: string | null
  ShowDinner: string | null
  ShowPrice: number | null
  ShowSmoking: number | null
  ShowNon: number | null
  Web: string | null
  RestrictPromoForSection: string | null
  walkupsvccharge: number | null
  phonesvccharge: number | null
  websvccharge: number | null
  ShowSec: string | null
}

export type ShowDefLookupModel = {
  LookupCode: string
  LookupType: string
  LookupSDesc: string
  LookupLDesc: string
  LookupOrder: number
}

/** Request body for SearchDefShow / SaveShowDef / UpdateShowDef / DeleteShowDefs */
export type ShowDefRequestModel = {
  ConnectionString: string
  LocationId: string
  LastUpdateId?: string
  LastUpdateDt?: string
  DayOfWeek?: string
  ShowDefID?: string
  ShowArrival?: string
  ShowTime?: string
  IsDinner?: boolean
  IsNoPasses?: boolean
  IsVIPSeating?: boolean
  Is21Over?: boolean
  IsHub?: boolean
  NewLookupList?: ShowDefLookupModel[] | null
  SectionList?: ShowDefSectionDetModel[] | null
}
