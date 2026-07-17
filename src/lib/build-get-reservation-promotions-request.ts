import { buildReservationDayRange } from '@/lib/reservation-date-range'

export type ReservationPromoOrigin = 'phone' | 'walkup' | 'web'

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
  /** Exactly one channel flag is set from this origin. */
  origin?: ReservationPromoOrigin
}

function getPromoDayOfWeek(isoDate: string) {
  const date = new Date(`${isoDate}T00:00:00`)
  if (Number.isNaN(date.getTime())) {
    return '1'
  }

  return String(date.getDay() + 1)
}

export function mapPromoOriginFlags(origin: ReservationPromoOrigin = 'walkup') {
  return {
    IsPhoneIn: origin === 'phone',
    IsWalkup: origin === 'walkup',
    IsWeb: origin === 'web'
  }
}

export function buildGetReservationPromotionsRequest({
  connectionName,
  locationId,
  showId,
  showDate,
  isManager = false,
  origin = 'walkup'
}: BuildGetReservationPromotionsRequestParams): GetReservationPromotionsRequest {
  const { startDate, endDate } = buildReservationDayRange(showDate)
  const channelFlags = mapPromoOriginFlags(origin)

  return {
    ConnectionString: connectionName,
    LocationId: locationId,
    ShowId: showId,
    PromoStartDate: startDate,
    PromoEmdDate: endDate,
    IsManager: isManager,
    ...channelFlags,
    Day: getPromoDayOfWeek(showDate)
  }
}
