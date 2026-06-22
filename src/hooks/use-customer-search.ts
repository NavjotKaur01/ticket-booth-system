import { useCallback, useState } from "react"

import { getClubmanErrorMessage } from "@/store/api/baseQuery"
import { useSearchCustomersMutation } from "@/store/api/clubmanApi"
import { mapCustomerSearchResults } from "@/lib/map-customer-search"
import type { Customer, CustomerSearchFilters } from "@/types/customer"

type UseCustomerSearchParams = {
  connectionName: string
  locationId: string
  enabled?: boolean
}

type UseCustomerSearchResult = {
  customers: Customer[]
  loading: boolean
  error: string | null
  hasSearched: boolean
  search: (filters: CustomerSearchFilters) => Promise<void>
  clear: () => void
}

export function useCustomerSearch({
  connectionName,
  locationId,
  enabled = true,
}: UseCustomerSearchParams): UseCustomerSearchResult {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [searchCustomers, { isLoading, error, reset }] =
    useSearchCustomersMutation()

  const search = useCallback(
    async (filters: CustomerSearchFilters) => {
      if (!enabled || !connectionName || !locationId) {
        setCustomers([])
        setHasSearched(true)
        return
      }

      setHasSearched(true)

      try {
        const data = await searchCustomers({
          connectionName,
          locationId,
          filters,
        }).unwrap()
        setCustomers(mapCustomerSearchResults(data))
      } catch {
        setCustomers([])
      }
    },
    [connectionName, locationId, enabled, searchCustomers]
  )

  const clear = useCallback(() => {
    setCustomers([])
    setHasSearched(false)
    reset()
  }, [reset])

  const errorMessage =
    !enabled || !connectionName || !locationId
      ? hasSearched
        ? "Location is required before searching customers."
        : null
      : error
        ? getClubmanErrorMessage(error)
        : null

  return {
    customers,
    loading: isLoading,
    error: errorMessage,
    hasSearched,
    search,
    clear,
  }
}
