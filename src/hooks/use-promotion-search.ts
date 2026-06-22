import { useCallback, useState } from "react"

import { filterPromotions } from "@/lib/filter-promotions"
import { mapPromotionSearchResults } from "@/lib/map-promotion-search"
import { getClubmanErrorMessage } from "@/store/api/baseQuery"
import { useSearchPromotionsMutation } from "@/store/api/clubmanApi"
import type { Promotion, PromotionFilters } from "@/types/promotion"

type UsePromotionSearchParams = {
  connectionName: string
  locationId: string
  enabled?: boolean
}

type UsePromotionSearchResult = {
  promotions: Promotion[]
  loading: boolean
  error: string | null
  hasSearched: boolean
  search: (filters: PromotionFilters) => Promise<void>
  clear: () => void
}

export function usePromotionSearch({
  connectionName,
  locationId,
  enabled = true,
}: UsePromotionSearchParams): UsePromotionSearchResult {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [searchPromotions, { isLoading, error, reset }] =
    useSearchPromotionsMutation()

  const search = useCallback(
    async (filters: PromotionFilters) => {
      if (!enabled || !connectionName || !locationId) {
        setPromotions([])
        setHasSearched(true)
        return
      }

      setHasSearched(true)

      try {
        const data = await searchPromotions({
          connectionName,
          locationId,
          filters,
        }).unwrap()
        const mapped = mapPromotionSearchResults(data)
        setPromotions(filterPromotions(mapped, filters))
      } catch {
        setPromotions([])
      }
    },
    [connectionName, locationId, enabled, searchPromotions]
  )

  const clear = useCallback(() => {
    setPromotions([])
    setHasSearched(false)
    reset()
  }, [reset])

  const errorMessage =
    !enabled || !connectionName || !locationId
      ? hasSearched
        ? "Location is required before searching promotions."
        : null
      : error
        ? getClubmanErrorMessage(error)
        : null

  return {
    promotions,
    loading: isLoading,
    error: errorMessage,
    hasSearched,
    search,
    clear,
  }
}
