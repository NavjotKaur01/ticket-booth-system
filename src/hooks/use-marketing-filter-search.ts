import { useCallback, useState } from "react"

import {
  hasMarketingFilterSearchCriteria,
} from "@/lib/build-marketing-filter-search-request"
import { mapMarketingFilterResults } from "@/lib/map-marketing-filter-results"
import { getClubmanErrorMessage } from "@/store/api/baseQuery"
import { useMarketingFilterSearchMutation } from "@/store/api/clubmanApi"
import type { MarketingFilterForm, MarketingFilterRecord } from "@/types/marketing-filter"

type UseMarketingFilterSearchParams = {
  connectionName: string
  locationId: string
  enabled?: boolean
}

type UseMarketingFilterSearchResult = {
  records: MarketingFilterRecord[]
  loading: boolean
  error: string | null
  hasSearched: boolean
  search: (filters: MarketingFilterForm) => Promise<void>
  clearResults: () => void
}

export function useMarketingFilterSearch({
  connectionName,
  locationId,
  enabled = true,
}: UseMarketingFilterSearchParams): UseMarketingFilterSearchResult {
  const [records, setRecords] = useState<MarketingFilterRecord[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [searchMarketingFilter, { reset }] = useMarketingFilterSearchMutation()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const search = useCallback(
    async (filters: MarketingFilterForm) => {
      if (!enabled || !connectionName || !locationId) {
        setRecords([])
        setHasSearched(true)
        setError("Location is required before searching customers.")
        return
      }

      if (!hasMarketingFilterSearchCriteria(filters)) {
        const proceed = window.confirm(
          "No search criteria entered. Search may take a long time to load customers. Do you wish to continue?"
        )
        if (!proceed) {
          return
        }
      }

      setHasSearched(true)
      setLoading(true)
      setError(null)

      try {
        const aggregated: MarketingFilterRecord[] = []
        let pageNo = 1

        while (true) {
          const data = await searchMarketingFilter({
            connectionName,
            locationId,
            filters,
            pageNo,
          }).unwrap()

          if (!data || data.length === 0) {
            break
          }

          aggregated.push(...mapMarketingFilterResults(data))
          pageNo += 1
        }

        setRecords(aggregated)
      } catch (requestError) {
        setRecords([])
        setError(getClubmanErrorMessage(requestError))
      } finally {
        setLoading(false)
      }
    },
    [connectionName, enabled, locationId, searchMarketingFilter]
  )

  const clearResults = useCallback(() => {
    setRecords([])
    setHasSearched(false)
    setError(null)
    reset()
  }, [reset])

  return {
    records,
    loading,
    error,
    hasSearched,
    search,
    clearResults,
  }
}
