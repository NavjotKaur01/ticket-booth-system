import { apiRequest, reservationApiPath } from "@/lib/api/client"
import { buildReservationDayRange } from "@/lib/reservation-date-range"
import type { ReservationDataItem } from "@/types/api/reservation-data"
import type {
  GetShowDetailsByDateRequest,
  ShowDetailsByDateItem,
} from "@/types/api/show-details"

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
  return apiRequest<ReservationDataItem[]>(
    reservationApiPath(
      connectionString,
      showId,
      String(includeCancelledReservations),
      "false",
      "false",
      "GetReservationData"
    ),
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    }
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
  const { startDate, endDate } = buildReservationDayRange(showDate)

  const body: GetShowDetailsByDateRequest = {
    ConnectionString: connectionString,
    LocationId: locationId,
    StartDate: startDate,
    EndDate: endDate,
    IsCancelledShow: isCancelledShow,
  }

  return apiRequest<ShowDetailsByDateItem[]>(
    reservationApiPath("GetShowDetailsByDate"),
    {
      method: "PUT",
      body: JSON.stringify(body),
    }
  )
}
