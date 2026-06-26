import { dispatchEndpoint } from "@/lib/api/dispatch-endpoint"
import { clubmanApi } from "@/store/api/clubmanApi"
import type { ApiCustomerDetail, CustomerRequest } from "@/types/api/customer"
import type { ApiCustomerSearchItem } from "@/types/api/customer-search"
import type { CustomerFormValues } from "@/types/customer-form"
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

type UpdateCustomerParams = SaveCustomerParams & {
  customerId: string
}

export function updateCustomer({
  connectionName,
  locationId,
  lastUpdateId,
  form,
  customerId,
}: UpdateCustomerParams) {
  return dispatchEndpoint<boolean, UpdateCustomerParams>(
    clubmanApi.endpoints.updateCustomer,
    { connectionName, locationId, lastUpdateId, form, customerId }
  )
}

type GetCustomerByIdParams = {
  connectionName: string
  locationId: string
  customerId: string
}

export function getCustomerById({
  connectionName,
  locationId,
  customerId,
}: GetCustomerByIdParams) {
  return dispatchEndpoint<ApiCustomerDetail, GetCustomerByIdParams>(
    clubmanApi.endpoints.getCustomerById,
    { connectionName, locationId, customerId }
  )
}

export function archiveCustomer(body: CustomerRequest) {
  return dispatchEndpoint<boolean, CustomerRequest>(
    clubmanApi.endpoints.archiveCustomer,
    body
  )
}

export function getCustomerDeleteDetail(body: CustomerRequest) {
  return dispatchEndpoint<ApiCustomerDetail, CustomerRequest>(
    clubmanApi.endpoints.getCustomerDeleteDetail,
    body
  )
}
