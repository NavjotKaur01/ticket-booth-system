import type { ReservationPaymentType } from '@/data/reservation-payment-options'
import type { ReservationCustomerSearchResult } from '@/data/reservation-search-results'
import { parsePhoneSearchParts } from '@/lib/parse-phone-search-parts'
import { EMPTY_GUID } from '@/lib/reservation-lookup-codes'
import type { ReservationDetail } from '@/types/api/reservation-detail'
import type { Reservation } from '@/types/reservation'
import type { ReservationSectionOption } from '@/types/reservation'
import type { ReservationPromoOption } from '@/types/reservation-promo'

const GATEWAY_TEST_ERROR_PATTERN =
  /test gateways are working|activate production gateways/i

export function formatReservationPaymentError (message: string) {
  if (!GATEWAY_TEST_ERROR_PATTERN.test(message)) {
    return message
  }

  return `${message} Credit card charges require production payment gateways to be enabled for this location. On the test API, use Cash to complete reservation updates with a balance due.`
}

type ReservationChangeSnapshot = {
  showId: string
  origShowId: string
  sectionId: string
  origSectionId: string
  party: number
  origParty: number
  promoId: string
  origPromoId: string
  origin: 'phone' | 'walkup'
  origOrigin: 'phone' | 'walkup'
  passes: number
  origPasses: number
  dinner: boolean
  origDinner: boolean
  paymentAmount: number
  paymentType: ReservationPaymentType
  sectionShowPrice: number
}

/** Mirrors desktop ReservationVM.IsReservationChange(). */
export function isReservationChanged ({
  showId,
  origShowId,
  sectionId,
  origSectionId,
  party,
  origParty,
  promoId,
  origPromoId,
  origin,
  origOrigin,
  passes,
  origPasses,
  dinner,
  origDinner,
  paymentAmount,
  paymentType,
  sectionShowPrice
}: ReservationChangeSnapshot) {
  if (!showId || !sectionId) {
    return false
  }

  const normalizedPromoId = promoId === 'none' ? EMPTY_GUID : promoId
  const normalizedOrigPromoId = origPromoId === 'none' ? EMPTY_GUID : origPromoId
  const promoUnchanged =
    normalizedPromoId === EMPTY_GUID || normalizedPromoId === normalizedOrigPromoId

  const coreUnchanged =
    showId === origShowId &&
    sectionId === origSectionId &&
    party === origParty &&
    promoUnchanged &&
    origin === origOrigin &&
    passes === origPasses &&
    dinner === origDinner

  if (!coreUnchanged) {
    return true
  }

  if (paymentAmount > 0) {
    return paymentType !== 'hold-cc'
  }

  if (sectionShowPrice === 0) {
    return true
  }

  return false
}

export function mapReservationSourceToOrigin (
  source: Reservation['source']
): 'phone' | 'walkup' {
  if (source === 'Walkup') {
    return 'walkup'
  }

  return 'phone'
}

export function findReservationSection (
  sections: ReservationSectionOption[],
  sectionLabel: string
) {
  const normalized = sectionLabel.trim().toLowerCase()

  if (!normalized) {
    return undefined
  }

  return sections.find(section => {
    const name = section.name.trim().toLowerCase()
    const label = section.label.trim().toLowerCase()

    return (
      name === normalized ||
      label === normalized ||
      label.includes(normalized) ||
      normalized.includes(name)
    )
  })
}

export function findReservationPromoId (
  promoOptions: ReservationPromoOption[],
  promoLabel: string
) {
  const normalized = promoLabel.trim().toLowerCase()

  if (!normalized) {
    return 'none'
  }

  const match = promoOptions.find(
    option =>
      option.id !== 'none' &&
      option.label.trim().toLowerCase() === normalized
  )

  return match?.id ?? 'none'
}

export function buildReservationEditSearchCriteria (reservation: Reservation) {
  const phone = parsePhoneSearchParts(reservation.phoneNo)

  if (reservation.businessName.trim()) {
    return {
      searchType: 'business' as const,
      criteria: {
        lastName: reservation.lastName,
        firstName: reservation.firstName,
        areaCode: phone.areaCode,
        phone1: phone.phone1,
        phone2: phone.phone2,
        email: '',
        businessName: reservation.businessName
      }
    }
  }

  return {
    searchType: 'customer' as const,
    criteria: {
      lastName: reservation.lastName,
      firstName: reservation.firstName,
      areaCode: phone.areaCode,
      phone1: phone.phone1,
      phone2: phone.phone2,
      email: reservation.email,
      businessName: ''
    }
  }
}

export function resolveReservationEditCustomerId (
  detail: ReservationDetail | undefined,
  results: ReservationCustomerSearchResult[]
) {
  const paymentCustomerId =
    detail?.PaymentList?.find(payment => payment.CustomerID?.trim())?.CustomerID?.trim() ??
    ''

  if (paymentCustomerId) {
    return paymentCustomerId
  }

  if (detail?.CustomerID?.trim()) {
    return detail.CustomerID.trim()
  }

  const firstResult = results[0]
  return firstResult?.id?.trim() ?? ''
}
