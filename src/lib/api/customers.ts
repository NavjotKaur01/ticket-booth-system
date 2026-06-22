import { administratorApiPath, apiRequest } from "@/lib/api/client"
import { buildCustomerSearchRequest } from "@/lib/build-customer-search-request"
import type { ApiCustomerSearchItem } from "@/types/api/customer-search"
import type { CustomerSearchFilters } from "@/types/customer"

type SearchCustomersParams = {
  connectionName: string
  locationId: string
  filters: CustomerSearchFilters
  pageNumber?: number
}

export function searchCustomers({
  connectionName,
  locationId,
  filters,
  pageNumber,
}: SearchCustomersParams) {
  return apiRequest<ApiCustomerSearchItem[]>(
    administratorApiPath("CustomerSearch"),
    {
      method: "PUT",
      body: JSON.stringify(
        buildCustomerSearchRequest({
          connectionName,
          locationId,
          filters,
          pageNumber,
        })
      ),
    }
  )
}
