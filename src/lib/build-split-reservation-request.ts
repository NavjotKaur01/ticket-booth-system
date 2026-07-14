import {
  EXPIRATION_MONTHS,
  type ReservationPaymentType
} from '@/data/reservation-payment-options'
import { calculatePromoDiscount } from '@/lib/calculate-promo-discount'
import type { ReservationTotals } from '@/lib/calculate-reservation-totals'
import { formatUsDateTime } from '@/lib/format-us-datetime'
import { getReservationPaymentLookupCode, PAYMENT_STATUS_PAYMENT } from '@/lib/reservation-lookup-codes'
import type { SaveReservationPaymentRequest, SaveSplitReservationRequestModel } from '@/types/api/save-reservation'
import type { ReservationPaymentFields } from '@/types/reservation-payment'
import type { ReservationPromo } from '@/types/reservation-promo'
import type { ReservationDetail } from '@/types/api/reservation-detail'

function roundMoney(value: number) {
  return Math.round(value * 100) / 100
}

function getExpirationMonthNumber(monthName: string) {
  const index = EXPIRATION_MONTHS.indexOf(
    monthName as (typeof EXPIRATION_MONTHS)[number]
  )

  if (index === -1) {
    return ''
  }

  return String(index + 1).padStart(2, '0')
}

function detectCreditCardType(cardNumber: string) {
  const digits = cardNumber.replace(/\D/g, '')
  if (/^4/.test(digits)) return 'CCTYPE04'
  if (/^5[1-5]/.test(digits)) return 'CCTYPE03'
  if (/^3[47]/.test(digits)) return 'CCTYPE02'
  if (/^6/.test(digits)) return 'CCTYPE01'
  return 'CCTYPE04'
}

export function calculateSplitReservationTotals({
  sectionPrice,
  splitCount,
  promo,
  serviceChargePerTicket,
  taxRate
}: {
  sectionPrice: string
  splitCount: number
  promo: ReservationPromo | null
  serviceChargePerTicket?: number
  taxRate?: number
}): ReservationTotals {
  const unitPrice = Number(sectionPrice.replace(/[^0-9.-]/g, '')) || 0
  const subtotal = unitPrice * splitCount
  const serviceCharge = subtotal > 0 ? (serviceChargePerTicket ?? 0) * splitCount : 0
  const discount = calculatePromoDiscount({
    promo,
    subtotal,
    ticketCount: splitCount,
    unitPrice
  })
  const taxable = Math.max(0, subtotal + serviceCharge - discount)
  const taxes = taxable * (taxRate ?? 0)
  const total = taxable + taxes

  return {
    subtotal: roundMoney(subtotal),
    serviceCharge: roundMoney(serviceCharge),
    discount: roundMoney(discount),
    taxes: roundMoney(taxes),
    total: roundMoney(total)
  }
}

export function validateReservationSplit({
  splitCount,
  remainingTickets,
  isFullyPaid
}: {
  splitCount: number
  remainingTickets: number
  isFullyPaid: boolean
}): string | null {
  if (isFullyPaid) return 'Entire party already paid. Cannot be split.'
  if (remainingTickets <= 0) return 'No remaining tickets available to split.'
  if (splitCount <= 0) return 'Select at least one ticket to split.'
  if (splitCount > remainingTickets) return 'Cannot split more tickets than remain on this reservation.'
  return null
}

function buildSplitPaymentModel({
  paymentType,
  paymentFields,
  paymentAmount,
  splitTotals
}: {
  paymentType: ReservationPaymentType
  paymentFields: ReservationPaymentFields
  paymentAmount: number
  splitTotals: ReservationTotals
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
    IsSplitPayment: true,
    SplitTaxes: splitTotals.taxes,
    SplitServiceCharge: splitTotals.serviceCharge,
    SplitTotal: splitTotals.total
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
    payment.CreditCardNumber = paymentFields.cardNumber.trim()
    payment.CCExpYear = paymentFields.expYear
    payment.CCExpMonth = getExpirationMonthNumber(paymentFields.expMonth)
    payment.SecurityCode = paymentFields.cvv.trim()
  }
  return payment
}

export function buildSplitReservationRequest({
  connectionName,
  locationId,
  reservationId,
  lastUpdateId,
  splitCount,
  paymentType,
  paymentFields,
  totals,
  isSplitFlag,
  paymentAmount,
  promoId,
  detail
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
  isSplitFlag: boolean
  paymentAmount: number
  promoId?: string
  taxRate: number
  detail?: ReservationDetail | null
}): SaveSplitReservationRequestModel {
  if (!detail) {
    throw new Error('Reservation detail is missing')
  }

  const payload: SaveSplitReservationRequestModel = {
    ConnectionString: connectionName,
    LocationId: locationId,
    ReservationId: reservationId,
    LastUpdateId: lastUpdateId,
    LastUpdateDt: formatUsDateTime(new Date()),
    UserRights: '',
    CustomerId: detail.CustomerID ?? '',
    ShowID: detail.ShowId ?? '',
    ShowDetID: detail.ShowDetID ?? '',
    ShowSec: detail.ResSec ?? '',
    ShowPrice: detail.Price ?? 0,
    DayOfShowFee: detail.DayOfShowFee ?? 0,
    PhoneInFee: detail.PhoneInFee ?? 0,
    WalkUpFee: detail.WalkUpFee ?? 0,
    WebFee: detail.WebFee ?? 0,
    LookUpCode: detail.LookupSDescSource ?? '',
    ReservationSource: detail.ResSource ?? '',
    OrigParty: detail.OrigPartyNo ?? 0,
    Party: detail.PartyNo ?? 0,
    PromotionID: promoId ?? 'none',
    PromotionCode: '',
    Passes: detail.NumPasses ?? 0,
    SubTotal: detail.SubTotal ?? 0,
    ServiceChage: detail.SVC ?? 0,
    Discount: detail.Discount ?? 0,
    Taxes: detail.SalesTax ?? 0,
    Total: detail.Total ?? 0,
    ReservationStatus: detail.ResStatus ?? '',
    IsDinner: detail.Dinner?.toUpperCase() === 'Y',
    IsVIP: false,
    ReservationNote: detail.Memo ?? '',
    Action: 'CMDSaveSplitPayment',
    ActionForm: 'SplitPayment',
    IsReservationCheckedIn: (detail.CheckedIn ?? 0) > 0,
    TixPaid: detail.TixPaid ?? 0,
    TixComp: detail.TixComp ?? 0,
    TixDisc: detail.TixDisc ?? 0,
    TaxRate: taxRate,
    SplitSubTotal: totals.subtotal,
    SplitServiceChage: totals.serviceCharge,
    SplitDiscount: totals.discount,
    SplitTaxes: totals.taxes,
    SplitTotal: totals.total,
    SvcDiffAmount: 0,
    PaymentModel: buildSplitPaymentModel({
      paymentType,
      paymentFields,
      paymentAmount,
      splitTotals: totals
    })
  }

  if (!isSplitFlag) {
    payload.SplitParty = splitCount
    payload.SplitPasses = 0
    payload.TixPaid = (detail.TixPaid ?? 0) + splitCount
  }

  return payload
}
