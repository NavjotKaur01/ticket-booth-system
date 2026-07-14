import { useMemo } from 'react'

import {
  mapReservationPromo,
  mapReservationPromoOptions
} from '@/lib/map-reservation-promo'
import { getClubmanErrorMessage } from '@/store/api/baseQuery'
import { useGetReservationPromotionsQuery } from '@/store/api/clubmanApi'
// import type { ReservationPromo } from '@/types/reservation-promo'

type UseReservationPromoOptionsParams = {
  connectionName: string
  locationId: string
  showId: string
  showDate: string
  enabled?: boolean
}

export function useReservationPromoOptions({
  connectionName,
  locationId,
  showId,
  showDate,
  enabled = true
}: UseReservationPromoOptionsParams) {
  const shouldSkip = !enabled || !connectionName || !locationId || !showId || !showDate

  const { data, isLoading, isFetching, error, refetch } = useGetReservationPromotionsQuery(
    {
      connectionName,
      locationId,
      showId,
      showDate
    },
    { skip: shouldSkip }
  )

  const promos = useMemo(() => {
    if (shouldSkip || !data) {
      return []
    }

    return [...data]
      .map(mapReservationPromo)
      .sort((left, right) =>
        left.promotionCode.localeCompare(right.promotionCode)
      )
  }, [data, shouldSkip])

  const options = useMemo(
    () => mapReservationPromoOptions(promos),
    [promos]
  )

  const promoById = useMemo(
    () => new Map(promos.map(promo => [promo.id, promo])),
    [promos]
  )

  return {
    options,
    promos,
    promoById,
    loading: shouldSkip ? false : isLoading || isFetching,
    error: error ? getClubmanErrorMessage(error) : null,
    reload: refetch
  }
}
