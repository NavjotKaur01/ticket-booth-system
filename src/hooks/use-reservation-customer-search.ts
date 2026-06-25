import { useCallback, useState } from 'react'

import { buildReservationCustomerSearchRequest } from '@/lib/build-reservation-customer-search-request'
import {
  mapReservationBusinessSearchResults,
  mapReservationCustomerSearchResults
} from '@/lib/map-reservation-customer-search'
import {
  hasReservationCustomerSearchCriteria,
  type ReservationCustomerSearchCriteria
} from '@/lib/reservation-customer-search-criteria'
import { getClubmanErrorMessage } from '@/store/api/baseQuery'
import {
  useSearchReservationBusinessCustomersMutation,
  useSearchReservationCustomersMutation
} from '@/store/api/clubmanApi'
import type {
  ReservationBusinessSearchResult,
  ReservationCustomerSearchResult
} from '@/data/reservation-search-results'

type UseReservationCustomerSearchParams = {
  connectionName: string
  enabled?: boolean
}

export function useReservationCustomerSearch ({
  connectionName,
  enabled = true
}: UseReservationCustomerSearchParams) {
  const [customerResults, setCustomerResults] = useState<
    ReservationCustomerSearchResult[]
  >([])
  const [businessResults, setBusinessResults] = useState<
    ReservationBusinessSearchResult[]
  >([])
  const [hasSearched, setHasSearched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchReservationCustomers] = useSearchReservationCustomersMutation()
  const [searchReservationBusinessCustomers] =
    useSearchReservationBusinessCustomersMutation()

  const clear = useCallback(() => {
    setCustomerResults([])
    setBusinessResults([])
    setHasSearched(false)
    setError(null)
  }, [])

  const search = useCallback(
    async (
      searchType: 'customer' | 'business',
      criteria: ReservationCustomerSearchCriteria
    ) => {
      if (!enabled || !connectionName) {
        clear()
        return []
      }

      if (!hasReservationCustomerSearchCriteria(searchType, criteria)) {
        clear()
        return []
      }

      setLoading(true)
      setError(null)
      setHasSearched(true)

      const body = buildReservationCustomerSearchRequest({
        connectionName,
        searchType,
        criteria
      })

      try {
        if (searchType === 'business') {
          const data = await searchReservationBusinessCustomers(body).unwrap()
          const mapped = mapReservationBusinessSearchResults(data ?? [])
          setBusinessResults(mapped)
          setCustomerResults([])
          return mapped
        }

        const data = await searchReservationCustomers(body).unwrap()
        const mapped = mapReservationCustomerSearchResults(data ?? [])
        setCustomerResults(mapped)
        setBusinessResults([])
        return mapped
      } catch (requestError) {
        setCustomerResults([])
        setBusinessResults([])
        setError(getClubmanErrorMessage(requestError))
        return []
      } finally {
        setLoading(false)
      }
    },
    [
      clear,
      connectionName,
      enabled,
      searchReservationBusinessCustomers,
      searchReservationCustomers
    ]
  )

  return {
    customerResults,
    businessResults,
    hasSearched,
    loading,
    error,
    search,
    clear
  }
}
