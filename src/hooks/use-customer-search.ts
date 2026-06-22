import { useCallback, useState } from "react"

import { searchCustomers } from "@/lib/api/customers"
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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)

  const search = useCallback(
    async (filters: CustomerSearchFilters) => {
      if (!enabled || !connectionName || !locationId) {
        setCustomers([])
        setError("Location is required before searching customers.")
        setHasSearched(true)
        return
      }

      setLoading(true)
      setError(null)
      setHasSearched(true)

      try {
        const data = await searchCustomers({
          connectionName,
          locationId,
          filters,
        })
        setCustomers(mapCustomerSearchResults(data))
      } catch (requestError) {
        setCustomers([])
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Failed to search customers"
        )
      } finally {
        setLoading(false)
      }
    },
    [connectionName, locationId, enabled]
  )

  const clear = useCallback(() => {
    setCustomers([])
    setError(null)
    setHasSearched(false)
    setLoading(false)
  }, [])

  return { customers, loading, error, hasSearched, search, clear }
}
