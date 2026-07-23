export type ApiDefaultShowSection = {
  ShowId?: string
  ShowDefID: string
  ShowDetID: string
  ShowDay: string
  WeekDay: number
  ShowDate: string | null
  ShowArrival: string | null
  ShowTim: string | null
  Section: string | null
  ShowSec?: string | null
  ShowPrice: number | null
  ShowNon: number | null
  ShowSmoking: number | null
  Web: string | null
  Hub: string | null
  NoPasses: string | null
  VIP: string | null
  Over21: string | null
  ShowDinner: string | null
  ShowDetRestrictPromo: string | null
  ShowDefDetwalkupsvc: number | null
  ShowDefDetphonesvc: number | null
  ShowDefDetwebsvc: number | null
  IsSelected?: boolean
}

export type ShowSectionDetModel = {
  ShowSec: string | null
  ShowSecOrder?: number | null
  ShowPrice: number | null
  ShowNon: number | null
  ShowSmoking: number | 0
  Web: string | null
  AssignSeats: string
  RestrictPromoForSection: string | null
  walkupsvccharge: number | null
  phonesvccharge: number | null
  websvccharge: number | null
}

export type SaveShowListItem = {
  ShowDate: string
  ShowTim: string
  ShowArrival: string
  Headliner: string | null
  Headliner2: string | null
  Feature: string | null
  Feature2: string | null
  Opener: string | null
  IsUseSectionFee: boolean
  ShowDinner: string
  NoPasses: string
  VIP: string
  Hub: string
  MinAge: string | null
  Over21: string
  ShowType: string
  specialshownotes: string | null
  DayOfShowCharge: number
  PhoneCharge: number
  WalkupCharge: number
  WebCharge: number
  IsPrivate: boolean
  SectionList: ShowSectionDetModel[]
}

export type LookupModel = {
  LookupCode: string
  LookupType: string
  LookupSDesc: string
  LookupLDesc: string
  LookupOrder: number
}

export type SaveShowRequestModel = {
  ConnectionString: string
  LocationId: string
  ShowDate: string
  ShowArivalTime: string
  LastUpdateDt: string
  LastUpdateId: string
  IsShowAvailableOnWeb: boolean
  ShowList: SaveShowListItem[]
  NewLookupList: LookupModel[]
  StartDate?: string
  EndDate?: string
  DayOfWeek?: string
}

export type ComedianSearchRequestModel = {
  ConnectionString: string
  LocationId: string
  LastName?: string
  FirstName?: string
  StageName?: string
  IsActiveComedian?: boolean
  IsComedianSerach?: string
}

export type ApiComedianSearchItem = {
  ComicID: string
  ComicName: string | null
  LastName: string | null
  FirstName: string | null
  StageName: string | null
  GlobalBio?: string | null
  LocalBio?: string | null
  IsGlobalPic?: string | null
  IsLocalPic?: string | null
  Active?: string | null
}
