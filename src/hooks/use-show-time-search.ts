import { useCallback, useState } from "react"

import { searchDefShow } from "@/lib/api/show-times"
import { buildSearchDefShowRequest } from "@/lib/build-show-def-request"
import { filterShowTimes } from "@/lib/filter-show-times"
import { mapSearchDefShowResults } from "@/lib/map-search-def-show"
import { mapSystemLookupsToSectionItems } from "@/lib/section-lookup"
import { getClubmanErrorMessage } from "@/store/api/baseQuery"
import { useGetSystemLookupQuery } from "@/store/api/clubmanApi"
import type { ShowTimeFilters, ShowTimeRow } from "@/types/show-time"

type UseShowTimeSearchParams = {
  connectionName: string
  locationId: string
  enabled?: boolean
}

type UseShowTimeSearchResult = {
  rows: ShowTimeRow[]
  loading: boolean
  error: string | null
  hasSearched: boolean
  search: (filters: ShowTimeFilters) => Promise<void>
  clear: () => void
}

/**
 * Administrator Show Times list search.
 * Mirrors ClubMan ShowTimesVM.Search → PUT Adminstrator/SearchDefShow.
 */
export function useShowTimeSearch({
  connectionName,
  locationId,
  enabled = true,
}: UseShowTimeSearchParams): UseShowTimeSearchResult {
  const [rows, setRows] = useState<ShowTimeRow[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { data: systemLookups = [] } = useGetSystemLookupQuery(connectionName, {
    skip: !enabled || !connectionName,
  })

  const search = useCallback(
    async (filters: ShowTimeFilters) => {
      if (!enabled || !connectionName || !locationId) {
        setRows([])
        setHasSearched(true)
        setError("Location is required before searching show times.")
        return
      }

      const request = buildSearchDefShowRequest({
        connectionName,
        locationId,
        dayOfWeekId: filters.dayOfWeek,
      })

      // Desktop ShowDefDay == "Select" returns without calling the API.
      if (!request) {
        setRows([])
        setHasSearched(true)
        setError(null)
        return
      }

      setHasSearched(true)
      setLoading(true)
      setError(null)

      try {
        const data = await searchDefShow(request)
        const sectionLookups = mapSystemLookupsToSectionItems(systemLookups)
        const mapped = mapSearchDefShowResults(data ?? [], sectionLookups)
        setRows(filterShowTimes(mapped, filters))
      } catch (searchError) {
        setRows([])
        setError(
          searchError instanceof Error
            ? searchError.message
            : getClubmanErrorMessage(searchError)
        )
      } finally {
        setLoading(false)
      }
    },
    [connectionName, locationId, enabled, systemLookups]
  )

  const clear = useCallback(() => {
    setRows([])
    setHasSearched(false)
    setError(null)
    setLoading(false)
  }, [])

  return {
    rows,
    loading,
    error,
    hasSearched,
    search,
    clear,
  }
}
