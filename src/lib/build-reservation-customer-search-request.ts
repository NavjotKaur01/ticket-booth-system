import type { ReservationCustomerSearchCriteria } from '@/lib/reservation-customer-search-criteria'
import type { ReservationCustomerSearchRequest } from '@/types/api/reservation-customer-search'

type BuildReservationCustomerSearchRequestParams = {
  connectionName: string
  searchType: 'customer' | 'business'
  criteria: ReservationCustomerSearchCriteria
}

export function buildReservationCustomerSearchRequest({
  connectionName,
  searchType,
  criteria
}: BuildReservationCustomerSearchRequestParams): ReservationCustomerSearchRequest {
  return {
    ConnectioString: connectionName,
    CustLastName: criteria.lastName.trim(),
    CustFirstName: criteria.firstName.trim(),
    CustEmail: searchType === 'customer' ? criteria.email.trim() : '',
    BusinessName:
      searchType === 'business' ? criteria.businessName.trim() : '',
    AreaCode: criteria.areaCode.trim(),
    Phone1: criteria.phone1.trim(),
    Phone2: criteria.phone2.trim()
  }
}
