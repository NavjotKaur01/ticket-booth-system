export type ApiMoveShowByIdItem = {
  ShowId: string
  ShowDate: string
  ShowTim: string
  ShowArrival: string
  ComicId?: string | null
  HeadlinerName?: string | null
  ForgroundColor?: string | null
  NoPasses?: string | null
}

export type ApiMoveShowSectionItem = {
  ShowId: string
  ShowDetID: string
  ShowDate?: string | null
  ShowSec?: string | null
  ShowSecOrder?: number | null
  ShowPrice?: number | null
  ShowSmoking?: number | null
  ShowNon?: number | null
  ShowAppearing?: string | null
  Web?: string | null
  Hub?: string | null
  LookupSDesc?: string | null
}

export type MoveShowToUpcomingDateRequest = {
  ConnectionString: string
  LocationId: string
  CalendarShowId: string
  MoveShowDate: string
  MoveShowStartTime: string
  MoveShowArrival: string
  LastUpdateDt: string
  LastUpdateID: string
}
