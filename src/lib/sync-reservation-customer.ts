import { getCustomerById, updateCustomer } from '@/lib/api/customers'
import { mapApiCustomerToForm } from '@/lib/map-api-customer-to-form'
import { mapReservationSearchCriteriaToCustomerForm } from '@/lib/map-reservation-search-to-customer-form'
import type { ReservationCustomerSearchCriteria } from '@/lib/reservation-customer-search-criteria'
import type { Reservation } from '@/types/reservation'

function normalizePhoneDigits (value: string) {
  return value.replace(/\D/g, '')
}

function criteriaPhoneDigits (criteria: ReservationCustomerSearchCriteria) {
  return normalizePhoneDigits(
    [criteria.areaCode, criteria.phone1, criteria.phone2].join('')
  )
}

export function hasReservationCustomerChanges (
  reservation: Reservation,
  criteria: ReservationCustomerSearchCriteria
) {
  return (
    criteria.lastName.trim() !== reservation.lastName.trim() ||
    criteria.firstName.trim() !== reservation.firstName.trim() ||
    criteria.email.trim() !== reservation.email.trim() ||
    criteriaPhoneDigits(criteria) !==
      normalizePhoneDigits(reservation.phoneNo)
  )
}

type SyncReservationCustomerParams = {
  connectionName: string
  locationId: string
  lastUpdateId: string
  customerId: string
  reservation: Reservation
  searchCriteria: ReservationCustomerSearchCriteria
}

/** Desktop payment screen persists customer name changes via the customer record. */
export async function syncReservationCustomerIfChanged ({
  connectionName,
  locationId,
  lastUpdateId,
  customerId,
  reservation,
  searchCriteria
}: SyncReservationCustomerParams) {
  if (!hasReservationCustomerChanges(reservation, searchCriteria)) {
    return
  }

  const apiCustomer = await getCustomerById({
    connectionName,
    locationId,
    customerId
  })
  const existingForm = mapApiCustomerToForm(apiCustomer)
  const editedForm = mapReservationSearchCriteriaToCustomerForm(searchCriteria)

  await updateCustomer({
    connectionName,
    locationId,
    lastUpdateId,
    customerId,
    form: {
      ...existingForm,
      lastName: editedForm.lastName,
      firstName: editedForm.firstName,
      email: editedForm.email,
      phone: editedForm.phone
    }
  })
}
