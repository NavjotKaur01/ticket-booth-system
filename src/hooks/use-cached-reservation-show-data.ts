import { useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react'

import { useReservationPromoOptions } from '@/hooks/use-reservation-promo-options'
import { useShowSections } from '@/hooks/use-show-sections'
import { mapReservationPromoOptions } from '@/lib/map-reservation-promo'
import type { ReservationSectionOption } from '@/types/reservation'
import type { ReservationPromo } from '@/types/reservation-promo'

type ShowDataCacheEntry = {
  sections: ReservationSectionOption[]
  promos: ReservationPromo[]
  sectionsError: string | null
  promosError: string | null
}

type UseCachedReservationShowDataParams = {
  connectionName: string
  locationId: string
  showDate: string
  showId: string
  enabled?: boolean
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
  enabled = true
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
  const cachedEntry = cacheRef.current.byShowId.get(showId)
  const isPromosCached = Boolean(cachedEntry)
  const shouldFetchPromos = shouldLoad && !isPromosCached

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
    enabled: shouldFetchPromos
  })

  useEffect(() => {
    if (!shouldLoad || !showId || fetchedSectionsLoading) {
      return
    }

    const existing = cacheRef.current.byShowId.get(showId)
    const nextEntry: ShowDataCacheEntry = {
      sections: fetchedSections,
      promos: existing?.promos ?? fetchedPromos,
      sectionsError: fetchedSectionsError,
      promosError: existing?.promosError ?? fetchedPromosError
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

  useEffect(() => {
    if (!shouldFetchPromos || !showId) {
      return
    }

    if (fetchedPromosLoading) {
      return
    }

    const existing = cacheRef.current.byShowId.get(showId)
    cacheRef.current.byShowId.set(showId, {
      sections: existing?.sections ?? fetchedSections,
      promos: fetchedPromos,
      sectionsError: existing?.sectionsError ?? fetchedSectionsError,
      promosError: fetchedPromosError
    })
    bumpCacheVersion(version => version + 1)
  }, [
    fetchedPromos,
    fetchedPromosError,
    fetchedPromosLoading,
    fetchedSections,
    fetchedSectionsError,
    shouldFetchPromos,
    showId
  ])

  void cacheVersion

  const activeEntry = cacheRef.current.byShowId.get(showId)
  const sections = activeEntry?.sections ?? fetchedSections
  const promos = activeEntry?.promos ?? fetchedPromos
  const sectionsError = activeEntry?.sectionsError ?? fetchedSectionsError
  const promosError = activeEntry?.promosError ?? fetchedPromosError
  const loading =
    shouldLoad &&
    !activeEntry &&
    (fetchedSectionsLoading || fetchedPromosLoading)

  const promoOptions = useMemo(
    () => mapReservationPromoOptions(promos),
    [promos]
  )

  const promoById = useMemo(
    () => new Map(promos.map(promo => [promo.id, promo])),
    [promos]
  )

  return {
    sections,
    sectionsLoading: loading,
    sectionsError,
    promoOptions,
    promoById,
    promoLoading: loading,
    promosError
  }
}
