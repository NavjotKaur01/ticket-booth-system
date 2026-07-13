import { useCallback, useState } from "react"

import { mapComedianSearchResults } from "@/lib/map-comedian-search"
import { getClubmanErrorMessage } from "@/store/api/baseQuery"
import { useSearchComediansMutation } from "@/store/api/clubmanApi"
import type { Performer, PerformerFilters } from "@/types/performer"

type UseComedianSearchParams = {
  connectionName: string
  locationId: string
  enabled?: boolean
}

type UseComedianSearchResult = {
  performers: Performer[]
  loading: boolean
  error: string | null
  hasSearched: boolean
  search: (filters: PerformerFilters) => Promise<void>
  clear: () => void
  setPerformerActive: (ids: string[], active: boolean) => void
}

/**
 * Administrator Comedians list search.
 * Uses PUT Calendar/ComedianSearch (same live path as EventCalendarVM),
 * because ComedianVM.Serach's DB load is commented out in desktop.
 */
export function useComedianSearch({
  connectionName,
  locationId,
  enabled = true,
}: UseComedianSearchParams): UseComedianSearchResult {
  const [performers, setPerformers] = useState<Performer[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [searchComedians, { isLoading, error, reset }] =
    useSearchComediansMutation()

  const search = useCallback(
    async (filters: PerformerFilters) => {
      if (!enabled || !connectionName || !locationId) {
        setPerformers([])
        setHasSearched(true)
        return
      }

      setHasSearched(true)

      try {
        const data = await searchComedians({
          ConnectionString: connectionName,
          LocationId: locationId,
          LastName: filters.lastName.trim(),
          FirstName: filters.firstName.trim(),
          StageName: filters.stageName.trim(),
          IsActiveComedian: filters.showInactive,
          IsComedianSerach: "",
        }).unwrap()

        setPerformers(mapComedianSearchResults(data ?? [], locationId))
      } catch {
        setPerformers([])
      }
    },
    [connectionName, locationId, enabled, searchComedians]
  )

  const clear = useCallback(() => {
    setPerformers([])
    setHasSearched(false)
    reset()
  }, [reset])

  const setPerformerActive = useCallback((ids: string[], active: boolean) => {
    const idSet = new Set(ids)
    setPerformers((current) =>
      current.map((row) =>
        idSet.has(row.id) ? { ...row, active, hidden: !active } : row
      )
    )
  }, [])

  const errorMessage =
    !enabled || !connectionName || !locationId
      ? hasSearched
        ? "Location is required before searching comedians."
        : null
      : error
        ? getClubmanErrorMessage(error)
        : null

  return {
    performers,
    loading: isLoading,
    error: errorMessage,
    hasSearched,
    search,
    clear,
    setPerformerActive,
  }
}
