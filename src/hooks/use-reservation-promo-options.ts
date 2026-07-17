import { useMemo } from 'react'

import type { ReservationPromoOrigin } from '@/lib/build-get-reservation-promotions-request'
import {
  mapReservationPromo,
  mapReservationPromoOptions
} from '@/lib/map-reservation-promo'
import { getClubmanErrorMessage } from '@/store/api/baseQuery'
import { useGetReservationPromotionsQuery } from '@/store/api/clubmanApi'

type UseReservationPromoOptionsParams = {
  connectionName: string
  locationId: string
  showId: string
  showDate: string
  enabled?: boolean
  isManager?: boolean
  origin?: ReservationPromoOrigin
}

export function useReservationPromoOptions({
  connectionName,
  locationId,
  showId,
  showDate,
  enabled = true,
  isManager,
  origin = 'walkup'
}: UseReservationPromoOptionsParams) {
  const shouldSkip =
    !enabled || !connectionName || !locationId || !showId || !showDate

  const { data, isLoading, isFetching, error, refetch } =
    useGetReservationPromotionsQuery(
      {
        connectionName,
        locationId,
        showId,
        showDate,
        isManager,
        origin
      },
      {
        skip: shouldSkip,
        // Origin switches change channel flags — always refetch.
        refetchOnMountOrArgChange: true
      }
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

  const options = useMemo(() => mapReservationPromoOptions(promos), [promos])

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
