import { dispatchEndpoint } from "@/lib/api/dispatch-endpoint"
import { clubmanApi } from "@/store/api/clubmanApi"
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
  return dispatchEndpoint<ApiCustomerSearchItem[], SearchCustomersParams>(
    clubmanApi.endpoints.searchCustomers,
    { connectionName, locationId, filters, pageNumber }
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
  return dispatchEndpoint<string[], SaveCustomerParams>(
    clubmanApi.endpoints.saveCustomer,
    { connectionName, locationId, lastUpdateId, form }
  )
}
