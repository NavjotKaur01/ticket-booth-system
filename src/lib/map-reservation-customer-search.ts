import type {
  ReservationBusinessSearchResult,
  ReservationCustomerSearchResult
} from '@/data/reservation-search-results'
import { isBannedFlag } from '@/lib/map-customer-search'
import { normalizePhoneSearchParts } from '@/lib/parse-phone-search-parts'
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
  return normalizePhoneSearchParts({
    areaCode: item.AreaCode,
    phone1: item.Phone1,
    phone2: item.Phone2
  })
}

export function mapReservationCustomerSearchResults (
  items: ReservationCustomerSearchItem[]
): ReservationCustomerSearchResult[] {
  return (items ?? []).map(item => {
    const phone = mapPhone(item)

    return {
      id: item.CustomerID,
      lastName: normalizeText(item.LastName),
      firstName: normalizeText(item.FirstName),
      phoneNo: formatPhoneNumber(phone.areaCode, phone.phone1, phone.phone2),
      areaCode: phone.areaCode,
      phone1: phone.phone1,
      phone2: phone.phone2,
      email: normalizeText(item.Email1),
      banned: isBannedFlag(item.Banned)
    }
  })
}

export function mapReservationBusinessSearchResults (
  items: ReservationCustomerSearchItem[]
): ReservationBusinessSearchResult[] {
  return (items ?? []).map(item => {
    const phone = mapPhone(item)

    return {
      id: item.CustomerID,
      businessName:
        normalizeText(item.BusinessName) || normalizeText(item.BusName),
      lastName: normalizeText(item.LastName),
      firstName: normalizeText(item.FirstName),
      phoneNo: formatPhoneNumber(phone.areaCode, phone.phone1, phone.phone2),
      areaCode: phone.areaCode,
      phone1: phone.phone1,
      phone2: phone.phone2
    }
  })
}
