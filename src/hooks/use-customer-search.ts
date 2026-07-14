import { useCallback, useState } from "react"

import { getClubmanErrorMessage } from "@/store/api/baseQuery"
import { useSearchCustomersMutation } from "@/store/api/clubmanApi"
import { hasCustomerSearchCriteria } from "@/lib/build-customer-search-request"
import {
  mapCustomerExportRows,
  type CustomerExportRow,
} from "@/lib/export-customers"
import { mapCustomerSearchResults } from "@/lib/map-customer-search"
import type { Customer, CustomerSearchFilters } from "@/types/customer"

type UseCustomerSearchParams = {
  connectionName: string
  locationId: string
  enabled?: boolean
}

type UseCustomerSearchResult = {
  customers: Customer[]
  /** Active customers only — mirrors ClubMan CustomerExportList. */
  exportRows: CustomerExportRow[]
  loading: boolean
  error: string | null
  hasSearched: boolean
  search: (filters: CustomerSearchFilters) => Promise<void>
  removeCustomer: (customerId: string) => void
  clear: () => void
}

export function useCustomerSearch({
  connectionName,
  locationId,
  enabled = true,
}: UseCustomerSearchParams): UseCustomerSearchResult {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [exportRows, setExportRows] = useState<CustomerExportRow[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [searchCustomers, { isLoading, error, reset }] =
    useSearchCustomersMutation()

  const search = useCallback(
    async (filters: CustomerSearchFilters) => {
      if (!enabled || !connectionName || !locationId) {
        setCustomers([])
        setExportRows([])
        setHasSearched(true)
        return
      }

      if (!hasCustomerSearchCriteria(filters)) {
        const proceed = window.confirm(
          "No search criteria entered. Search may take a long time to load customers. Continue?"
        )
        if (!proceed) {
          return
        }
      }

      setHasSearched(true)

      try {
        const data = await searchCustomers({
          connectionName,
          locationId,
          filters,
        }).unwrap()
        setCustomers(mapCustomerSearchResults(data))
        setExportRows(mapCustomerExportRows(data))
      } catch {
        setCustomers([])
        setExportRows([])
      }
    },
    [connectionName, locationId, enabled, searchCustomers]
  )

  const removeCustomer = useCallback((customerId: string) => {
    setCustomers((current) =>
      current.filter((customer) => customer.id !== customerId)
    )
    setExportRows((current) =>
      current.filter((row) => row.custId !== customerId)
    )
  }, [])

  const clear = useCallback(() => {
    setCustomers([])
    setExportRows([])
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
    exportRows,
    loading: isLoading,
    error: errorMessage,
    hasSearched,
    search,
    removeCustomer,
    clear,
  }
}
