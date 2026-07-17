import { useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react'

import { useReservationPromoOptions } from '@/hooks/use-reservation-promo-options'
import { useShowSections } from '@/hooks/use-show-sections'
import type { ReservationPromoOrigin } from '@/lib/build-get-reservation-promotions-request'
import { mapReservationPromoOptions } from '@/lib/map-reservation-promo'
import type { ReservationSectionOption } from '@/types/reservation'

type ShowDataCacheEntry = {
  sections: ReservationSectionOption[]
  sectionsError: string | null
}

type UseCachedReservationShowDataParams = {
  connectionName: string
  locationId: string
  showDate: string
  showId: string
  enabled?: boolean
  isManager?: boolean
  origin?: ReservationPromoOrigin
}

function clearCacheScope(
  cacheRef: MutableRefObject<{
    scopeKey: string
    byShowId: Map<string, ShowDataCacheEntry>
  }>,
  scopeKey: string
) {
  cacheRef.current = {
    scopeKey,
    byShowId: new Map()
  }
}

export function useCachedReservationShowData({
  connectionName,
  locationId,
  showDate,
  showId,
  enabled = true,
  isManager,
  origin = 'walkup'
}: UseCachedReservationShowDataParams) {
  const cacheRef = useRef<{
    scopeKey: string
    byShowId: Map<string, ShowDataCacheEntry>
  }>({
    scopeKey: showDate,
    byShowId: new Map()
  })
  const [cacheVersion, bumpCacheVersion] = useState(0)

  useEffect(() => {
    if (cacheRef.current.scopeKey !== showDate) {
      clearCacheScope(cacheRef, showDate)
      bumpCacheVersion(version => version + 1)
    }
  }, [showDate])

  useEffect(() => {
    if (!enabled) {
      clearCacheScope(cacheRef, showDate)
      bumpCacheVersion(version => version + 1)
    }
  }, [enabled, showDate])

  const shouldLoad = enabled && Boolean(showId)

  const {
    sections: fetchedSections,
    loading: fetchedSectionsLoading,
    error: fetchedSectionsError
  } = useShowSections(connectionName, showId, shouldLoad)

  const {
    promos: fetchedPromos,
    loading: fetchedPromosLoading,
    error: fetchedPromosError
  } = useReservationPromoOptions({
    connectionName,
    locationId,
    showId,
    showDate,
    enabled: shouldLoad,
    isManager,
    origin
  })

  useEffect(() => {
    if (!shouldLoad || !showId || fetchedSectionsLoading) {
      return
    }

    const existing = cacheRef.current.byShowId.get(showId)
    const nextEntry: ShowDataCacheEntry = {
      sections: fetchedSections,
      sectionsError: fetchedSectionsError
    }

    if (
      existing?.sections === fetchedSections &&
      existing.sectionsError === fetchedSectionsError
    ) {
      return
    }

    cacheRef.current.byShowId.set(showId, nextEntry)
    bumpCacheVersion(version => version + 1)
  }, [
    fetchedSections,
    fetchedSectionsError,
    fetchedSectionsLoading,
    shouldLoad,
    showId
  ])

  void cacheVersion

  const activeEntry = cacheRef.current.byShowId.get(showId)
  const sections = activeEntry?.sections ?? fetchedSections
  const sectionsError = activeEntry?.sectionsError ?? fetchedSectionsError
  const loading =
    shouldLoad &&
    ((!activeEntry && fetchedSectionsLoading) || fetchedPromosLoading)

  const promoOptions = useMemo(
    () => mapReservationPromoOptions(fetchedPromos),
    [fetchedPromos]
  )

  const promoById = useMemo(
    () => new Map(fetchedPromos.map(promo => [promo.id, promo])),
    [fetchedPromos]
  )

  return {
    sections,
    sectionsLoading: loading,
    sectionsError,
    promoOptions,
    promoById,
    promoLoading: loading,
    promosError: fetchedPromosError
  }
}
