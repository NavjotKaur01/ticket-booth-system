export type ReservationCustomerSearchCriteria = {
  lastName: string
  firstName: string
  phoneNo: string
  email: string
  businessName: string
}

export const EMPTY_RESERVATION_CUSTOMER_SEARCH_CRITERIA: ReservationCustomerSearchCriteria =
  {
    lastName: '',
    firstName: '',
    phoneNo: '',
    email: '',
    businessName: ''
  }

export function hasReservationCustomerSearchCriteria (
  searchType: 'customer' | 'business',
  criteria: ReservationCustomerSearchCriteria
) {
  if (searchType === 'business') {
    return [
      criteria.businessName,
      criteria.lastName,
      criteria.firstName,
      criteria.phoneNo
    ].some(value => value.trim().length > 0)
  }

  return [
    criteria.lastName,
    criteria.firstName,
    criteria.phoneNo,
    criteria.email
  ].some(value => value.trim().length > 0)
}

export function hasCompleteNewCustomerCriteria (
  criteria: ReservationCustomerSearchCriteria
) {
  const phoneDigits = criteria.phoneNo.replace(/\D/g, '')

  return (
    criteria.lastName.trim().length > 0 &&
    criteria.firstName.trim().length > 0 &&
    criteria.email.trim().length > 0 &&
    phoneDigits.length >= 10
  )
}
