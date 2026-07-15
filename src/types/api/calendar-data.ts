export type ApiCalendarModel = {
  ShowId: string
  ShowDate: string | null
  ShowTim: string | null
  ShowTime?: string | null
  Headliner: string | null
  BookedCount: number | null
  DinnerCount: number | null
  ShowDinner?: string | null
  SeatsCount: number | null
  IsActive: string | boolean | null
  ComicId: string | null
  ButtionForColor?: string | null
  RowColor?: string | null
}

export type CalendarRequestModel = {
  ConnectionString: string
  LocationID: string
  StartDate: string
  EndDate: string
  IsCancelled: boolean
}
