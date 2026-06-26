import type { CustomerSearchRequest } from "@/types/api/customer-search"
import type { CustomerSearchFilters } from "@/types/customer"

type BuildCustomerSearchRequestParams = {
  connectionName: string
  locationId: string
  filters: CustomerSearchFilters
  pageNumber?: number
}

export function buildCustomerSearchRequest({
  connectionName,
  locationId,
  filters,
  pageNumber = 1,
}: BuildCustomerSearchRequestParams): CustomerSearchRequest {
  return {
    ConnectionName: connectionName,
    LocationId: locationId,
    CustLastName: filters.lastName.trim(),
    CustFirstName: filters.firstName.trim(),
    AreaCode: filters.areaCode.trim(),
    Phone1: filters.phone1.trim(),
    Phone2: filters.phone2.trim(),
    Email1: filters.email.trim(),
    PageNumber: pageNumber,
  }
}

export function hasCustomerSearchCriteria(filters: CustomerSearchFilters) {
  return Boolean(
    filters.lastName.trim() ||
      filters.firstName.trim() ||
      filters.email.trim() ||
      filters.areaCode.trim() ||
      filters.phone1.trim() ||
      filters.phone2.trim()
  )
}
