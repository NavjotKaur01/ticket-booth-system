import { useCallback, useState } from "react"

import { hasBusinessContactSearchCriteria } from "@/lib/build-business-contact-search-request"
import { mapBusinessContactSearchResults } from "@/lib/map-business-contact-search"
import { getClubmanErrorMessage } from "@/store/api/baseQuery"
import { useSearchBusinessContactsMutation } from "@/store/api/clubmanApi"
import type {
  BusinessContact,
  BusinessContactSearchFilters,
} from "@/types/business-contact"

type UseBusinessContactSearchParams = {
  connectionName: string
  locationId: string
  enabled?: boolean
}

type UseBusinessContactSearchResult = {
  contacts: BusinessContact[]
  loading: boolean
  error: string | null
  hasSearched: boolean
  search: (filters: BusinessContactSearchFilters) => Promise<void>
  clear: () => void
}

export function useBusinessContactSearch({
  connectionName,
  locationId,
  enabled = true,
}: UseBusinessContactSearchParams): UseBusinessContactSearchResult {
  const [contacts, setContacts] = useState<BusinessContact[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [searchBusinessContacts, { isLoading, error, reset }] =
    useSearchBusinessContactsMutation()

  const search = useCallback(
    async (filters: BusinessContactSearchFilters) => {
      if (!enabled || !connectionName || !locationId) {
        setContacts([])
        setHasSearched(true)
        return
      }

      if (!hasBusinessContactSearchCriteria(filters)) {
        const proceed = window.confirm(
          "No search criteria entered. Search may take a long time to load business contacts. Continue?"
        )
        if (!proceed) {
          return
        }
      }

      setHasSearched(true)

      try {
        const data = await searchBusinessContacts({
          connectionName,
          locationId,
          filters,
        }).unwrap()
        setContacts(mapBusinessContactSearchResults(data))
      } catch {
        setContacts([])
      }
    },
    [connectionName, locationId, enabled, searchBusinessContacts]
  )

  const clear = useCallback(() => {
    setContacts([])
    setHasSearched(false)
    reset()
  }, [reset])

  const errorMessage =
    !enabled || !connectionName || !locationId
      ? hasSearched
        ? "Location is required before searching business contacts."
        : null
      : error
        ? getClubmanErrorMessage(error)
        : null

  return {
    contacts,
    loading: isLoading,
    error: errorMessage,
    hasSearched,
    search,
    clear,
  }
}
