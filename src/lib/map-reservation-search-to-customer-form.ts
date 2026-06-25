import { EMPTY_PHONE_PARTS } from '@/components/forms/phone-input-group'
import { parsePhoneSearchParts } from '@/lib/parse-phone-search-parts'
import type { ReservationCustomerSearchCriteria } from '@/lib/reservation-customer-search-criteria'
import {
  EMPTY_CUSTOMER_FORM,
  type CustomerFormValues
} from '@/types/customer-form'

export function mapReservationSearchCriteriaToCustomerForm (
  criteria: ReservationCustomerSearchCriteria
): CustomerFormValues {
  const phone = parsePhoneSearchParts(criteria.phoneNo)

  return {
    ...EMPTY_CUSTOMER_FORM,
    lastName: criteria.lastName.trim(),
    firstName: criteria.firstName.trim(),
    email: criteria.email.trim(),
    phone: {
      ...EMPTY_PHONE_PARTS,
      area: phone.areaCode,
      prefix: phone.phone1,
      line: phone.phone2
    }
  }
}
