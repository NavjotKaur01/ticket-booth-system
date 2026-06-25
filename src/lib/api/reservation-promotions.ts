import { dispatchEndpoint } from '@/lib/api/dispatch-endpoint'
import { clubmanApi } from '@/store/api/clubmanApi'
import type { ApiPromotionSearchItem } from '@/types/api/promotion-search'

type FetchReservationPromotionsParams = {
  connectionName: string
  locationId: string
  showId: string
  showDate: string
  isManager?: boolean
}

export function fetchReservationPromotions ({
  connectionName,
  locationId,
  showId,
  showDate,
  isManager
}: FetchReservationPromotionsParams) {
  return dispatchEndpoint<
    ApiPromotionSearchItem[],
    FetchReservationPromotionsParams
  >(clubmanApi.endpoints.getReservationPromotions, {
    connectionName,
    locationId,
    showId,
    showDate,
    isManager
  })
}
