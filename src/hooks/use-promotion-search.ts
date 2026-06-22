import { useCallback, useState } from "react"

import { searchPromotions } from "@/lib/api/promotions"
import { filterPromotions } from "@/lib/filter-promotions"
import { mapPromotionSearchResults } from "@/lib/map-promotion-search"
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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)

  const search = useCallback(
    async (filters: PromotionFilters) => {
      if (!enabled || !connectionName || !locationId) {
        setPromotions([])
        setError("Location is required before searching promotions.")
        setHasSearched(true)
        return
      }

      setLoading(true)
      setError(null)
      setHasSearched(true)

      try {
        const data = await searchPromotions({
          connectionName,
          locationId,
          filters,
        })
        const mapped = mapPromotionSearchResults(data)
        setPromotions(filterPromotions(mapped, filters))
      } catch (requestError) {
        setPromotions([])
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Failed to search promotions"
        )
      } finally {
        setLoading(false)
      }
    },
    [connectionName, locationId, enabled]
  )

  const clear = useCallback(() => {
    setPromotions([])
    setError(null)
    setHasSearched(false)
    setLoading(false)
  }, [])

  return { promotions, loading, error, hasSearched, search, clear }
}
