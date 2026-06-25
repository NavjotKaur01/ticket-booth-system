import { parsePhoneSearchParts } from '@/lib/parse-phone-search-parts'
import type { ReservationCustomerSearchCriteria } from '@/lib/reservation-customer-search-criteria'
import type { ReservationCustomerSearchRequest } from '@/types/api/reservation-customer-search'

type BuildReservationCustomerSearchRequestParams = {
  connectionName: string
  searchType: 'customer' | 'business'
  criteria: ReservationCustomerSearchCriteria
}

export function buildReservationCustomerSearchRequest ({
  connectionName,
  searchType,
  criteria
}: BuildReservationCustomerSearchRequestParams): ReservationCustomerSearchRequest {
  const phone = parsePhoneSearchParts(criteria.phoneNo)

  return {
    ConnectioString: connectionName,
    CustLastName: criteria.lastName.trim(),
    CustFirstName: criteria.firstName.trim(),
    CustEmail: searchType === 'customer' ? criteria.email.trim() : '',
    BusinessName:
      searchType === 'business' ? criteria.businessName.trim() : '',
    AreaCode: phone.areaCode,
    Phone1: phone.phone1,
    Phone2: phone.phone2
  }
}
