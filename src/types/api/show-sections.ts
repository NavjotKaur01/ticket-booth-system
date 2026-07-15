export type ShowSectionItem = {
  ShowID: string
  ShowDetID: string
  ShowSec: string
  LookupSDesc: string | null
  ShowSecOrder: number | null
  ShowPrice: number | null
  ShowSmoking: number | null
  ShowNon: number | null
  ShowDinner: string | null
  ShowSeats: number | null
  ShowSectionAvialiableSeats: number | null
  ShowSectionReservedSeats: number | null
  WalkupSvcCharge?: number | null
  PhoneSvcCharge?: number | null
  WebSvcCharge?: number | null
  DayOfShowCharge?: number | null
  PhoneCharge?: number | null
  WalkupCharge?: number | null
  WebCharge?: number | null
  RestrictPromoForSection?: string | null
  ShowDetRestrictPromo?: string | null
}
