import type {
  ReservationBusinessSearchResult,
  ReservationCustomerSearchResult
} from '@/data/reservation-search-results'
import type { ReservationCustomerSearchItem } from '@/types/api/reservation-customer-search'

function normalizeText (value: string | null | undefined) {
  return value?.trim() ?? ''
}

function formatPhoneNumber (
  areaCode: string,
  phone1: string,
  phone2: string
) {
  if (!areaCode && !phone1 && !phone2) {
    return ''
  }

  if (areaCode && phone1 && phone2) {
    return `(${areaCode}) ${phone1} - ${phone2}`
  }

  return [areaCode, phone1, phone2].filter(Boolean).join(' ')
}

function mapPhone (item: ReservationCustomerSearchItem) {
  return formatPhoneNumber(
    normalizeText(item.AreaCode),
    normalizeText(item.Phone1),
    normalizeText(item.Phone2)
  )
}

export function mapReservationCustomerSearchResults (
  items: ReservationCustomerSearchItem[]
): ReservationCustomerSearchResult[] {
  return (items ?? []).map(item => ({
    id: item.CustomerID,
    lastName: normalizeText(item.LastName),
    firstName: normalizeText(item.FirstName),
    phoneNo: mapPhone(item),
    email: normalizeText(item.Email1)
  }))
}

export function mapReservationBusinessSearchResults (
  items: ReservationCustomerSearchItem[]
): ReservationBusinessSearchResult[] {
  return (items ?? []).map(item => ({
    id: item.CustomerID,
    businessName:
      normalizeText(item.BusinessName) || normalizeText(item.BusName),
    lastName: normalizeText(item.LastName),
    firstName: normalizeText(item.FirstName),
    phoneNo: mapPhone(item)
  }))
}
