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
