import { dispatchEndpoint } from "@/lib/api/dispatch-endpoint"
import { clubmanApi } from "@/store/api/clubmanApi"
import type { ApiCalendarModel } from "@/types/api/calendar-data"

type FetchCalendarDataParams = {
  connectionString: string
  locationId: string
  calendarDate: string
  isCancelled: boolean
}

export function fetchCalendarData(params: FetchCalendarDataParams) {
  return dispatchEndpoint<ApiCalendarModel[], FetchCalendarDataParams>(
    clubmanApi.endpoints.getCalendarData,
    params
  )
}
