export type ApiShowProperties = {
  Over21: string
  MinAge: string | null
  ShowDate: string
  PhoneCharge: number
  WalkupCharge: number
  WebCharge: number
  DayOfShowCharge: number
  ShowSectionFee: string
}

export type ApiShowData = {
  // Show-level fields (present on all rows, usually read from [0])
  ShowId: string
  ShowDate: string
  ShowTim: string
  ShowArrival: string
  Headliner: string | null
  Headliner2: string | null
  Feature: string | null
  Feature2: string | null
  Opener: string | null
  DayOfShowCharge: number
  PhoneCharge: number
  WalkupCharge: number
  WebCharge: number
  ShowDinner: string
  NoPasses: string
  VIP: string
  Over21: string
  Hub: string
  MinAge: string | null
  IsUseSectionFee: boolean
  /** Canonical API field; some legacy responses use the misspelled Solid variant. */
  IsShowSoldOut?: boolean | string | null
  IsShowSolidOut?: boolean | string | null
  IsShowAvailableOnWeb: boolean
  specialnotes: string | null
  IsPrivateShow: boolean

  // Section-level fields (specific to this row)
  ShowDetID: string
  IsSelected: boolean
  Section: string | null
  ShowPrice: number | null
  ShowNon: number | null
  ShowDetRestrictPromo: string | null
  Web: string | null
  ShowDefDetwalkupsvc: number | null
  ShowDefDetphonesvc: number | null
  ShowDefDetwebsvc: number | null
}
