export type MarkShowSoldOutRequest = {
  ConnectionString: string
  CalendarShowId: string
  IsShowSoldOut: boolean
}

export type MarkShowUnavailableOnWebRequest = {
  ConnectionString: string
  CalendarShowId: string
  LastUpdateDt: string
  LastUpdateID: string
}
