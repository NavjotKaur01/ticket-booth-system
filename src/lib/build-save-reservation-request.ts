import { EXPIRATION_MONTHS } from '@/data/reservation-payment-options'
import type { ReservationPaymentType } from '@/data/reservation-payment-options'
import { parsePhoneSearchParts } from '@/lib/parse-phone-search-parts'
import {
  ACTION_FORM_RESERVATION,
  ACTION_SAVE_RESERVATION,
  EMPTY_GUID,
  getReservationOriginLookupCode,
  getReservationPaymentLookupCode,
  PAYMENT_STATUS_PAYMENT,
  RESERVATION_STATUS_ACTIVE
} from '@/lib/reservation-lookup-codes'
import type { ReservationCustomerSearchCriteria } from '@/lib/reservation-customer-search-criteria'
import { formatApiDateTime } from '@/lib/format-datetime'
import type {
  SaveReservationPaymentRequest,
  SaveReservationRequest
} from '@/types/api/save-reservation'
import type { ReservationTotals } from '@/lib/calculate-reservation-totals'
import type { ReservationPaymentFields } from '@/types/reservation-payment'
import type { ReservationPromo } from '@/types/reservation-promo'
import type { ReservationSectionOption } from '@/types/reservation'

type BuildReservationRequestParams = {
  connectionName: string
  locationId: string
  userRights: string
  lastUpdateId: string
  searchType: 'customer' | 'business'
  customerId: string
  searchCriteria: ReservationCustomerSearchCriteria
  selectedSection: ReservationSectionOption
  origin: 'phone' | 'walkup'
  party: number
  origParty?: number
  passes: number
  promo: ReservationPromo | null
  totals: ReservationTotals
  notes: string
  dinner: boolean
  isReservationCheckedIn?: boolean
  includeCustomerModel?: boolean
}

type BuildUpdateReservationPaymentParams = BuildReservationRequestParams & {
  reservationId: string
  paymentAmount: number
  paymentType: ReservationPaymentType
  paymentFields: ReservationPaymentFields
  isPaymentLoad?: boolean
  resSelectedPromotionId?: string
}

function roundMoney (value: number) {
  return Math.round(value * 100) / 100
}

function getExpirationMonthNumber (monthName: string) {
  const index = EXPIRATION_MONTHS.indexOf(
    monthName as (typeof EXPIRATION_MONTHS)[number]
  )

  if (index === -1) {
    return ''
  }

  return String(index + 1).padStart(2, '0')
}

function detectCreditCardType (cardNumber: string) {
  const digits = cardNumber.replace(/\D/g, '')

  if (/^4/.test(digits)) {
    return 'CCTYPE04'
  }

  if (/^5[1-5]/.test(digits)) {
    return 'CCTYPE03'
  }

  if (/^3[47]/.test(digits)) {
    return 'CCTYPE02'
  }

  if (/^6/.test(digits)) {
    return 'CCTYPE01'
  }

  return 'CCTYPE04'
}

function buildTicketCounts (party: number, promo: ReservationPromo | null) {
  if (!promo) {
    return { tixPaid: party, tixComp: 0, tixDisc: 0 }
  }

  if (
    promo.buyTix != null &&
    promo.buyTixFree != null &&
    promo.buyTix > 0 &&
    promo.buyTixFree > 0
  ) {
    const groupSize = promo.buyTix + promo.buyTixFree
    const freeTickets = Math.floor(party / groupSize) * promo.buyTixFree

    return {
      tixPaid: Math.max(0, party - freeTickets),
      tixComp: freeTickets,
      tixDisc: 0
    }
  }

  return {
    tixPaid: party,
    tixComp: 0,
    tixDisc: 0
  }
}

function buildPaymentModel ({
  paymentType,
  paymentFields,
  paymentAmount,
  totals,
  searchType
}: {
  paymentType: ReservationPaymentType
  paymentFields: ReservationPaymentFields
  paymentAmount: number
  totals: ReservationTotals
  searchType: 'customer' | 'business'
}): SaveReservationPaymentRequest {
  const lookupCode = getReservationPaymentLookupCode(paymentType)
  const payment: SaveReservationPaymentRequest = {
    PaymentType: lookupCode,
    PaymentStatus: PAYMENT_STATUS_PAYMENT,
    BillingAddress: paymentFields.billingAddress.trim(),
    BillingZip: paymentFields.zipCode.trim(),
    PaymentAmount: roundMoney(paymentAmount),
    Taxes: roundMoney(totals.taxes),
    ServiceCharge: roundMoney(totals.serviceCharge),
    IsCustomerSearch: searchType === 'customer',
    IsSwipeCard: false,
    IsSplitPayment: false
  }

  if (paymentType === 'gift-card' || paymentType === 'gift-cert') {
    payment.GiftCardNumber = paymentFields.accountNumber.trim()
    payment.CCExpYear = paymentFields.expYear
    payment.CCExpMonth = getExpirationMonthNumber(paymentFields.expMonth)
    return payment
  }

  if (paymentType === 'web-gift-cert') {
    payment.WebGiftCertificateNumber = paymentFields.accountNumber.trim()
    return payment
  }

  if (paymentType !== 'cash') {
    const cardNumber = paymentFields.cardNumber.replace(/\D/g, '')

    payment.CCType = detectCreditCardType(paymentFields.cardNumber)
    payment.CreditCardNubmer = cardNumber
    payment.CCExpYear = paymentFields.expYear
    payment.CCExpMonth = getExpirationMonthNumber(paymentFields.expMonth)
    payment.SecurityCode = paymentFields.cvv.trim()
  }

  return payment
}

function buildReservationCore ({
  connectionName,
  locationId,
  userRights,
  lastUpdateId,
  searchType,
  customerId,
  searchCriteria,
  selectedSection,
  origin,
  party,
  origParty,
  passes,
  promo,
  totals,
  notes,
  dinner,
  isReservationCheckedIn,
  includeCustomerModel = true
}: BuildReservationRequestParams): SaveReservationRequest {
  const originCode = getReservationOriginLookupCode(origin)
  const phone = parsePhoneSearchParts(searchCriteria.phoneNo)
  const ticketCounts = buildTicketCounts(party, promo)

  const request: SaveReservationRequest = {
    ConnectionString: connectionName,
    LocationId: locationId,
    UserRights: userRights,
    CustomerId: customerId,
    ShowID: selectedSection.showId,
    ShowDetID: selectedSection.showDetId,
    ShowSec: selectedSection.showSec,
    ShowPrice: selectedSection.showPrice,
    DayOfShowFee: selectedSection.dayOfShowFee,
    PhoneInFee: selectedSection.phoneInFee,
    WalkUpFee: selectedSection.walkUpFee,
    WebFee: selectedSection.webFee,
    LookUpCode: originCode,
    ReservationSource: originCode,
    OrigParty: origParty ?? party,
    Party: party,
    PromotionID: promo?.id ?? EMPTY_GUID,
    PromotionCode: promo?.promotionCode ?? '',
    Passes: promo ? passes : 0,
    SubTotal: roundMoney(totals.subtotal),
    ServiceChage: roundMoney(totals.serviceCharge),
    Discount: roundMoney(totals.discount),
    Taxes: roundMoney(totals.taxes),
    Total: roundMoney(totals.total),
    ReservationStatus: RESERVATION_STATUS_ACTIVE,
    IsDinner: dinner,
    IsVIP: selectedSection.tone === 'vip',
    LastUpdateDt: formatApiDateTime(new Date().toISOString()),
    LastUpdateId: lastUpdateId,
    ReservationNote: notes.trim(),
    Action: ACTION_SAVE_RESERVATION,
    ActionForm: ACTION_FORM_RESERVATION,
    IsReservationCheckedIn: isReservationCheckedIn ?? false,
    TixPaid: ticketCounts.tixPaid,
    TixComp: ticketCounts.tixComp,
    TixDisc: ticketCounts.tixDisc
  }

  if (includeCustomerModel) {
    if (searchType === 'customer') {
      request.CustomerModel = {
        CustomerId: customerId,
        CustLastName: searchCriteria.lastName.trim(),
        CustFirstName: searchCriteria.firstName.trim(),
        Email1: searchCriteria.email.trim(),
        AreaCode: phone.areaCode,
        Phone1: phone.phone1,
        Phone2: phone.phone2
      }
    } else {
      request.BusinessCustomerModel = {
        BusinessId: customerId,
        BusinessName: searchCriteria.businessName.trim(),
        BusLastName: searchCriteria.lastName.trim(),
        BusFirstName: searchCriteria.firstName.trim(),
        AreaCode: phone.areaCode,
        Phone1: phone.phone1,
        Phone2: phone.phone2
      }
    }
  }

  return request
}

/** Create reservation without payment (e.g. comp / zero-total). */
export function buildSaveReservationOnlyRequest (
  params: BuildReservationRequestParams
): SaveReservationRequest {
  return {
    ...buildReservationCore(params),
    IsSaveReservationOnly: true
  }
}

type BuildReservationWithPaymentParams = BuildReservationRequestParams & {
  paymentAmount: number
  paymentType: ReservationPaymentType
  paymentFields: ReservationPaymentFields
  reservationId?: string
  isPaymentLoad?: boolean
  resSelectedPromotionId?: string
}

function buildReservationWithPaymentRequest (
  params: BuildReservationWithPaymentParams
): SaveReservationRequest {
  const {
    reservationId,
    paymentAmount,
    paymentType,
    paymentFields,
    searchType,
    totals,
    isPaymentLoad,
    resSelectedPromotionId
  } = params
  const roundedPaymentAmount = roundMoney(paymentAmount)
  const effectivePaymentType =
    roundedPaymentAmount <= 0 ? 'cash' : paymentType
  const paymentLookupCode = getReservationPaymentLookupCode(effectivePaymentType)

  return {
    ...buildReservationCore(params),
    ...(reservationId ? { ReservationId: reservationId } : {}),
    PaymentTypeLookupCode: paymentLookupCode,
    PaymentAmount: roundedPaymentAmount,
    IsTicketPartyUpdate:
      effectivePaymentType !== 'hold-cc' ||
      totals.total === 0 ||
      roundedPaymentAmount <= 0,
    ...(isPaymentLoad ? { IsPaymentLoad: true } : {}),
    ...(resSelectedPromotionId
      ? { ResSelectedPromotionID: resSelectedPromotionId }
      : {}),
    PaymentModel: buildPaymentModel({
      paymentType: effectivePaymentType,
      paymentFields,
      paymentAmount: roundedPaymentAmount,
      totals,
      searchType
    })
  }
}

/** New reservation with payment — single SaveReservation call (matches desktop). */
export function buildSaveReservationWithPaymentRequest (
  params: Omit<
    BuildUpdateReservationPaymentParams,
    'reservationId' | 'isPaymentLoad' | 'resSelectedPromotionId'
  >
): SaveReservationRequest {
  return buildReservationWithPaymentRequest(params)
}

/** Desktop payment screen — always sends payment payload (amount may be 0). */
export function buildUpdateReservationPaymentRequest (
  params: BuildUpdateReservationPaymentParams
): SaveReservationRequest {
  return buildReservationWithPaymentRequest(params)
}

/** Update an existing reservation (desktop payment screen save). */
export function buildUpdateReservationRequest (
  params: BuildUpdateReservationPaymentParams
): SaveReservationRequest {
  return buildUpdateReservationPaymentRequest(params)
}
