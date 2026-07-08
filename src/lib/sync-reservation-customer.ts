import { getCustomerById, updateCustomer } from '@/lib/api/customers'
import { mapApiCustomerToForm } from '@/lib/map-api-customer-to-form'
import { mapReservationSearchCriteriaToCustomerForm } from '@/lib/map-reservation-search-to-customer-form'
import type { ReservationCustomerSearchCriteria } from '@/lib/reservation-customer-search-criteria'
import type { Reservation } from '@/types/reservation'

function normalizePhoneDigits (value: string) {
  return value.replace(/\D/g, '')
}

export function hasReservationCustomerChanges (
  reservation: Reservation,
  criteria: ReservationCustomerSearchCriteria
) {
  return (
    criteria.lastName.trim() !== reservation.lastName.trim() ||
    criteria.firstName.trim() !== reservation.firstName.trim() ||
    criteria.email.trim() !== reservation.email.trim() ||
    normalizePhoneDigits(criteria.phoneNo) !==
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

export function hasReservationSearchResultChanges (
  originalResult: import('@/data/reservation-search-results').ReservationCustomerSearchResult,
  criteria: ReservationCustomerSearchCriteria
) {
  return (
    criteria.lastName.trim() !== originalResult.lastName.trim() ||
    criteria.firstName.trim() !== originalResult.firstName.trim() ||
    criteria.email.trim() !== originalResult.email.trim() ||
    normalizePhoneDigits(criteria.phoneNo) !==
      normalizePhoneDigits(originalResult.phoneNo)
  )
}

export type SyncReservationCustomerSearchResultParams = {
  connectionName: string
  locationId: string
  lastUpdateId: string
  customerId: string
  originalResult: import('@/data/reservation-search-results').ReservationCustomerSearchResult
  searchCriteria: ReservationCustomerSearchCriteria
}

export async function syncReservationCustomerSearchResultIfChanged ({
  connectionName,
  locationId,
  lastUpdateId,
  customerId,
  originalResult,
  searchCriteria
}: SyncReservationCustomerSearchResultParams) {
  if (!hasReservationSearchResultChanges(originalResult, searchCriteria)) {
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
