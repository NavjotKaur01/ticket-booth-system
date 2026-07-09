import { EMPTY_PHONE_PARTS } from '@/components/forms/phone-input-group'
import type { ReservationCustomerSearchCriteria } from '@/lib/reservation-customer-search-criteria'
import {
  EMPTY_CUSTOMER_FORM,
  type CustomerFormValues
} from '@/types/customer-form'

export function mapReservationSearchCriteriaToCustomerForm (
  criteria: ReservationCustomerSearchCriteria
): CustomerFormValues {
  return {
    ...EMPTY_CUSTOMER_FORM,
    lastName: criteria.lastName.trim(),
    firstName: criteria.firstName.trim(),
    email: criteria.email.trim(),
    phone: {
      ...EMPTY_PHONE_PARTS,
      area: criteria.areaCode.trim(),
      prefix: criteria.phone1.trim(),
      line: criteria.phone2.trim()
    }
  }
}
