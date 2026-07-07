export type UpdateShowSectionDetModel = {
  ShowDetID: string | null
  ShowSec: string | null
  ShowSecOrder: number | null
  ShowPrice: number | null
  ShowNon: number | null
  ShowSmoking: number | null
  Web: string | null
  ShowAppearing: string
  Active: string
  RestrictPromoForSection: string | null
  walkupsvccharge: number | null
  phonesvccharge: number | null
  websvccharge: number | null
  LookupSectionCode: string | null
}

export type UpdateShowRequestModel = {
  ConnectionString: string
  LocationId: string
  ShowId: string
  ShowTime: string
  ShowArrival: string
  LastUpdateDt: string
  LastUpdateId: string
  HeadlinerGuid1: string | null
  HeadlinerGuid2: string | null
  FeatureGuid1: string | null
  FeatureGuid2: string | null
  OpenerGuid: string | null
  IsDinner: boolean
  IsNoPasses: boolean
  IsVIPSeating: boolean
  IsHub: boolean
  DayOfShowFee: number
  PhoneInFee: number
  WalkUpFee: number
  WebFee: number
  IsUseSectionFee: boolean
  SelectedAge: string | null
  MinAge: string | null
  IsShowSoldOut: boolean
  IsShowAvailableOnWeb: boolean
  IsPrivate: boolean
  specialshownotes: string | null
  SectionList: UpdateShowSectionDetModel[]
  NewLookupList: any[]
  DeleteShowSectionIds: string[]
}
