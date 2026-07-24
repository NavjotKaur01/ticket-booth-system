export type ShowDetailsByDateItem = {
  ShowId: string
  ShowDate: string
  ShowTim: string
  HeadlinerName: string | null
  ComicId: string
  IsShowActive: boolean
  IsShowSoldOut: boolean
  IsPrivate: boolean
  /** Desktop brush name (e.g. "RED") — selected show chip uses red. */
  ForgroundColor?: string | null
}

export type GetShowDetailsByDateRequest = {
  ConnectionString: string
  LocationId: string
  StartDate: string
  EndDate: string
  IsCancelledShow: boolean
}
