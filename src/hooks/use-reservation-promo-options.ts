import { useCallback, useEffect, useMemo, useState } from 'react'

import {
  mapReservationPromo,
  mapReservationPromoOptions
} from '@/lib/map-reservation-promo'
import { getClubmanErrorMessage } from '@/store/api/baseQuery'
import { useGetReservationPromotionsMutation } from '@/store/api/clubmanApi'
import type { ReservationPromo } from '@/types/reservation-promo'

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

  const [promos, setPromos] = useState<ReservationPromo[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [getReservationPromotions] = useGetReservationPromotionsMutation()

  const loadPromos = useCallback(async () => {
    if (!enabled || !connectionName || !locationId || !showId || !showDate) {
      setPromos([])
      setError(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const data = await getReservationPromotions({
        connectionName,
        locationId,
        showId,
        showDate
      }).unwrap()

      const mapped = (data ?? [])
        .map(mapReservationPromo)
        .sort((left, right) =>
          left.promotionCode.localeCompare(right.promotionCode)
        )

      setPromos(mapped)
    } catch (requestError) {
      setPromos([])
      setError(getClubmanErrorMessage(requestError))
    } finally {
      setLoading(false)
    }
  }, [
    connectionName,
    enabled,
    getReservationPromotions,
    locationId,
    showDate,
    showId
  ])

  useEffect(() => {
    void loadPromos()
  }, [loadPromos])

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
    loading,
    error,
    reload: loadPromos
  }
}
