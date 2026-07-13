import {
  EXPIRATION_MONTHS,
  type ReservationPaymentType
} from '@/data/reservation-payment-options'
import { calculatePromoDiscount } from '@/lib/calculate-promo-discount'
import type { ReservationTotals } from '@/lib/calculate-reservation-totals'
import { formatUsDateTime } from '@/lib/format-us-datetime'
import { getReservationPaymentLookupCode, PAYMENT_STATUS_PAYMENT } from '@/lib/reservation-lookup-codes'
import type { SaveReservationPaymentRequest } from '@/types/api/save-reservation'
import type { ReservationPaymentFields } from '@/types/reservation-payment'
import type { ReservationPromo } from '@/types/reservation-promo'

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

/** Split-off ticket totals for the selected split count, same math as the main reservation totals. */
export function calculateSplitReservationTotals ({
  sectionPrice,
  splitCount,
  promo
}: {
  sectionPrice: string
  splitCount: number
  promo: ReservationPromo | null
}): ReservationTotals {
  const unitPrice = Number(sectionPrice.replace(/[^0-9.-]/g, '')) || 0
  const subtotal = unitPrice * splitCount
  const serviceCharge = subtotal > 0 ? 2 * splitCount : 0
  const discount = calculatePromoDiscount({
    promo,
    subtotal,
    ticketCount: splitCount,
    unitPrice
  })
  const taxable = Math.max(0, subtotal + serviceCharge - discount)
  const taxes = taxable * 0.08
  const total = taxable + taxes

  return {
    subtotal: roundMoney(subtotal),
    serviceCharge: roundMoney(serviceCharge),
    discount: roundMoney(discount),
    taxes: roundMoney(taxes),
    total: roundMoney(total)
  }
}

/** Guards against splitting a fully paid reservation or an invalid ticket count. */
export function validateReservationSplit ({
  splitCount,
  remainingTickets,
  isFullyPaid
}: {
  splitCount: number
  remainingTickets: number
  isFullyPaid: boolean
}): string | null {
  if (isFullyPaid) {
    return 'Entire party already paid. Cannot be split.'
  }

  if (remainingTickets <= 0) {
    return 'No remaining tickets available to split.'
  }

  if (splitCount <= 0) {
    return 'Select at least one ticket to split.'
  }

  if (splitCount > remainingTickets) {
    return 'Cannot split more tickets than remain on this reservation.'
  }

  return null
}

function buildSplitPaymentModel ({
  paymentType,
  paymentFields,
  paymentAmount
}: {
  paymentType: ReservationPaymentType
  paymentFields: ReservationPaymentFields
  paymentAmount: number
}): SaveReservationPaymentRequest {
  const lookupCode = getReservationPaymentLookupCode(paymentType)
  const payment: SaveReservationPaymentRequest = {
    PaymentType: lookupCode,
    PaymentStatus: PAYMENT_STATUS_PAYMENT,
    BillingAddress: paymentFields.billingAddress.trim(),
    BillingZip: paymentFields.zipCode.trim(),
    PaymentAmount: roundMoney(paymentAmount),
    Taxes: 0,
    ServiceCharge: 0,
    IsCustomerSearch: true,
    IsSwipeCard: false,
    IsSplitPayment: true
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
    payment.CCType = detectCreditCardType(paymentFields.cardNumber)
    payment.CreditCardNubmer = paymentFields.cardNumber.trim()
    payment.CCExpYear = paymentFields.expYear
    payment.CCExpMonth = getExpirationMonthNumber(paymentFields.expMonth)
    payment.SecurityCode = paymentFields.cvv.trim()
  }

  return payment
}

export type SplitReservationRequest = {
  ConnectionString: string
  LocationId: string
  ReservationId: string
  LastUpdateID: string
  LastUpdateDt: string
  SplitParty: number
  RemainingParty: number
  SubTotal: number
  ServiceCharge: number
  Discount: number
  Taxes: number
  Total: number
  PaymentModel: SaveReservationPaymentRequest
}

/**
 * Builds the Split Reservation request payload. The exact contract is
 * unconfirmed (no backend endpoint exists yet), so this mirrors the shape of
 * SaveReservationRequest/PaymentModel as closely as possible — adjust once a
 * real endpoint is available.
 */
export function buildSplitReservationRequest ({
  connectionName,
  locationId,
  reservationId,
  lastUpdateId,
  splitCount,
  remainingTickets,
  paymentType,
  paymentFields,
  totals
}: {
  connectionName: string
  locationId: string
  reservationId: string
  lastUpdateId: string
  splitCount: number
  remainingTickets: number
  paymentType: ReservationPaymentType
  paymentFields: ReservationPaymentFields
  totals: ReservationTotals
}): SplitReservationRequest {
  return {
    ConnectionString: connectionName,
    LocationId: locationId,
    ReservationId: reservationId,
    LastUpdateID: lastUpdateId,
    LastUpdateDt: formatUsDateTime(new Date()),
    SplitParty: splitCount,
    RemainingParty: Math.max(0, remainingTickets - splitCount),
    SubTotal: totals.subtotal,
    ServiceCharge: totals.serviceCharge,
    Discount: totals.discount,
    Taxes: totals.taxes,
    Total: totals.total,
    PaymentModel: buildSplitPaymentModel({
      paymentType,
      paymentFields,
      paymentAmount: totals.total
    })
  }
}
