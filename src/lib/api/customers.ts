import { administratorApiPath, apiRequest } from "@/lib/api/client"
import { buildCustomerSearchRequest } from "@/lib/build-customer-search-request"
import { buildSaveCustomerRequest } from "@/lib/build-save-customer-request"
import type { ApiCustomerSearchItem } from "@/types/api/customer-search"
import type { CustomerSearchFilters } from "@/types/customer"
import type { CustomerFormValues } from "@/types/customer-form"

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

type SaveCustomerParams = {
  connectionName: string
  locationId: string
  lastUpdateId: string
  form: CustomerFormValues
}

export function saveCustomer({
  connectionName,
  locationId,
  lastUpdateId,
  form,
}: SaveCustomerParams) {
  return apiRequest<string[]>(
    administratorApiPath("SaveCustomer"),
    {
      method: "POST",
      body: JSON.stringify(
        buildSaveCustomerRequest({
          connectionName,
          locationId,
          lastUpdateId,
          form,
        })
      ),
    }
  )
}
