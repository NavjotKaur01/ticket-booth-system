export type ReservationCustomerSearchCriteria = {
  lastName: string
  firstName: string
  areaCode: string
  phone1: string
  phone2: string
  email: string
  businessName: string
}

export const EMPTY_RESERVATION_CUSTOMER_SEARCH_CRITERIA: ReservationCustomerSearchCriteria = {
  lastName: '',
  firstName: '',
  areaCode: '',
  phone1: '',
  phone2: '',
  email: '',
  businessName: ''
}

// Rules for complete customer validation
const CUSTOMER_CRITERIA_RULES: Partial<Record<keyof ReservationCustomerSearchCriteria, number>> = {
  lastName: 1,
  firstName: 1,
  email: 1,
  areaCode: 3,
  phone1: 3,
  phone2: 4
};

export function hasReservationCustomerSearchCriteria(
  searchType: 'customer' | 'business',
  criteria: ReservationCustomerSearchCriteria
): boolean {
  return Object.entries(criteria).some(([key, value]) => {
    if (searchType === 'business' && key === 'email') return false;
    if (searchType === 'customer' && key === 'businessName') return false;
    return (value as string).trim().length > 0;
  });
}

export function hasCompleteNewCustomerCriteria(
  criteria: ReservationCustomerSearchCriteria
): boolean {
  return Object.entries(CUSTOMER_CRITERIA_RULES).every(([key, minLength]) => {
    const value = criteria[key as keyof ReservationCustomerSearchCriteria];
    return value.trim().length >= (minLength || 1);
  });
}   