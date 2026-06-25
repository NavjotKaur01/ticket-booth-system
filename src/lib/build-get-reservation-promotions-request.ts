import { buildReservationDayRange } from '@/lib/reservation-date-range'

export type GetReservationPromotionsRequest = {
  ConnectionString: string
  LocationId: string
  ShowId: string
  PromoStartDate: string
  PromoEmdDate: string
  IsManager: boolean
  IsPhoneIn: boolean
  IsWalkup: boolean
  IsWeb: boolean
  Day: string
}

type BuildGetReservationPromotionsRequestParams = {
  connectionName: string
  locationId: string
  showId: string
  showDate: string
  isManager?: boolean
}

function getPromoDayOfWeek (isoDate: string) {
  const date = new Date(`${isoDate}T00:00:00`)
  if (Number.isNaN(date.getTime())) {
    return '1'
  }

  return String(date.getDay() + 1)
}

export function buildGetReservationPromotionsRequest ({
  connectionName,
  locationId,
  showId,
  showDate,
  isManager = false
}: BuildGetReservationPromotionsRequestParams): GetReservationPromotionsRequest {
  const { startDate, endDate } = buildReservationDayRange(showDate)

  return {
    ConnectionString: connectionName,
    LocationId: locationId,
    ShowId: showId,
    PromoStartDate: startDate,
    PromoEmdDate: endDate,
    IsManager: isManager,
    IsPhoneIn: true,
    IsWalkup: true,
    IsWeb: false,
    Day: getPromoDayOfWeek(showDate)
  }
}
