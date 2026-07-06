import type { BusinessCustomerRequest } from "@/types/api/business-contact"
import type { BusinessContactSearchFilters } from "@/types/business-contact"

type BuildBusinessContactSearchRequestParams = {
  connectionName: string
  locationId: string
  filters: BusinessContactSearchFilters
}

export function buildBusinessContactSearchRequest({
  connectionName,
  locationId,
  filters,
}: BuildBusinessContactSearchRequestParams): BusinessCustomerRequest {
  return {
    ConnectioString: connectionName,
    LocationId: locationId,
    BusinessName: filters.businessName.trim(),
    BusLastName: filters.lastName.trim(),
    BusFirstName: filters.firstName.trim(),
    Email1: filters.email.trim(),
  }
}

export function hasBusinessContactSearchCriteria(
  filters: BusinessContactSearchFilters
) {
  return Boolean(
    filters.businessName.trim() ||
    filters.lastName.trim() ||
    filters.firstName.trim() ||
    filters.email.trim()
  )
}
