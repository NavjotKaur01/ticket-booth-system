import { dispatchEndpoint } from "@/lib/api/dispatch-endpoint"
import { clubmanApi } from "@/store/api/clubmanApi"
import type { ReservationDataItem } from "@/types/api/reservation-data"
import type { ShowDetailsByDateItem } from "@/types/api/show-details"

type FetchReservationDataParams = {
  connectionString: string
  showId: string
  includeCancelledReservations: boolean
}

export function fetchReservationData({
  connectionString,
  showId,
  includeCancelledReservations,
}: FetchReservationDataParams) {
  return dispatchEndpoint<ReservationDataItem[], FetchReservationDataParams>(
    clubmanApi.endpoints.getReservationData,
    { connectionString, showId, includeCancelledReservations }
  )
}

type FetchShowDetailsByDateParams = {
  connectionString: string
  locationId: string
  showDate: string
  isCancelledShow: boolean
}

export function fetchShowDetailsByDate({
  connectionString,
  locationId,
  showDate,
  isCancelledShow,
}: FetchShowDetailsByDateParams) {
  return dispatchEndpoint<ShowDetailsByDateItem[], FetchShowDetailsByDateParams>(
    clubmanApi.endpoints.getShowDetailsByDate,
    { connectionString, locationId, showDate, isCancelledShow }
  )
}
