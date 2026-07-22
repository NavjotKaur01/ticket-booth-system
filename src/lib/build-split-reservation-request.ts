import {
  EXPIRATION_MONTHS,
  type ReservationPaymentType
} from '@/data/reservation-payment-options'
import {
  calculatePromoDiscount,
  getPromoApplicableTickets
} from '@/lib/calculate-promo-discount'
import type { ReservationTotals } from '@/lib/calculate-reservation-totals'
import { formatUsDateTime } from '@/lib/format-us-datetime'
import { multiplePromosDiscCalculation } from '@/lib/multiple-promo-calculation'
import {
  getReservationOriginLookupCode,
  getReservationPaymentLookupCode,
  PAYMENT_STATUS_PAYMENT
} from '@/lib/reservation-lookup-codes'
import type { ReservationDetail } from '@/types/api/reservation-detail'
import type {
  MultiplePromoModel,
  SaveReservationPaymentRequest,
  SaveReservationRequest,
  SaveSplitReservationRequestModel
} from '@/types/api/save-reservation'
import type { ReservationPaymentFields } from '@/types/reservation-payment'
import type { ReservationPromo } from '@/types/reservation-promo'

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

function getSinglePromoTicketCounts({
  promo,
  splitCount,
  passes = 1
}: {
  promo?: ReservationPromo | null
  splitCount: number
  passes?: number
}) {
  if (!promo || splitCount <= 0) {
    return { tixPaid: splitCount, tixComp: 0, tixDisc: 0 }
  }

  const { applicableTickets, freeTickets } = getPromoApplicableTickets({
    promo,
    ticketCount: splitCount,
    passes
  })
  const discountType = promo.discountType?.trim().toUpperCase()

  if (discountType === 'PROMO02') {
    const tixComp = freeTickets
    return {
      tixPaid: Math.max(0, splitCount - tixComp),
      tixComp,
      tixDisc: 0
    }
  }

  const tixDisc = applicableTickets
  return {
    tixPaid: Math.max(0, splitCount - tixDisc),
    tixComp: 0,
    tixDisc
  }
}

export type SplitReservationTotals = ReservationTotals & {
  tixPaid?: number
  tixComp?: number
  tixDisc?: number
  svcDiffAmount?: number
  isMultiplePromo?: boolean
  multiplePromoList?: MultiplePromoModel[]
}

export function calculateSplitReservationTotals({
  sectionPrice,
  splitCount,
  promo,
  multiplePromos,
  serviceChargePerTicket,
  taxRate,
  originCode = 'SRC01',
  baseClubFee = 0,
  baseDayOfShowFee = 0,
  passes = 1,
  taxWithServiceCharge = false,
  isDayOfShow = false
}: {
  sectionPrice: string
  splitCount: number
  promo?: ReservationPromo | null
  multiplePromos?: {
    promoId: string
    passes: number
    discount: number
    promo: ReservationPromo | null
  }[]
  serviceChargePerTicket?: number
  /**
   * Desktop TaxRate from Payment defaults `lblTaxes` — a PERCENT (e.g. 8.875),
   * not a fraction. CalculateTax does `((amount) * taxRate) / 100`.
   */
  taxRate?: number
  originCode?: string
  baseClubFee?: number
  baseDayOfShowFee?: number
  passes?: number
  taxWithServiceCharge?: boolean
  isDayOfShow?: boolean
}): SplitReservationTotals {
  const unitPrice = Number(sectionPrice.replace(/[^0-9.-]/g, '')) || 0
  const subtotal = unitPrice * splitCount
  let serviceCharge = subtotal > 0 ? (serviceChargePerTicket ?? 0) * splitCount : 0

  let discount = 0
  let tixPaid = splitCount
  let tixComp = 0
  let tixDisc = 0
  let svcDiffAmount = 0
  const multiplePromoList: MultiplePromoModel[] = []

  const useMultiPromo = multiplePromos != null && multiplePromos.length > 0
  const effectivePasses = Math.max(1, passes)

  if (useMultiPromo) {
    let remainingParty = splitCount
    serviceCharge = 0 // Multiple promos REPLACE base service charge entirely

    for (const mp of multiplePromos) {
      if (!mp.promo || mp.passes === 0 || remainingParty === 0) continue

      const result = multiplePromosDiscCalculation({
        promo: mp.promo,
        party: remainingParty,
        pass: mp.passes,
        showPrice: unitPrice,
        originCode,
        baseClubFee,
        baseDayOfShowFee,
        isDayOfShow
      })

      remainingParty -= result.promoParty
      serviceCharge += result.promoServiceChargeDiff
      discount += result.discount
      tixComp += result.tixComp
      tixDisc += result.tixDisc

      multiplePromoList.push({
        PromotionCode: mp.promo.promotionCode,
        Passes: mp.passes,
        Discount: roundMoney(result.discount),
        PromoTix: result.promoTix
      })
    }

    tixPaid = Math.max(0, splitCount - tixComp - tixDisc)
    const baseSvc = subtotal > 0 ? (serviceChargePerTicket ?? 0) * splitCount : 0
    svcDiffAmount = serviceCharge - baseSvc
  } else {
    discount = calculatePromoDiscount({
      promo: promo || null,
      subtotal,
      ticketCount: splitCount,
      unitPrice,
      passes: effectivePasses
    })
    const ticketCounts = getSinglePromoTicketCounts({
      promo,
      splitCount,
      passes: effectivePasses
    })
    tixPaid = ticketCounts.tixPaid
    tixComp = ticketCounts.tixComp
    tixDisc = ticketCounts.tixDisc
  }

  // Desktop TicketCalculationHelper.CalculateTax: TaxRate is a PERCENT
  // (lblTaxes), then ((amount [+ svc]) * taxRate) / 100.
  let taxable = Math.max(0, subtotal - discount)
  if (taxWithServiceCharge) {
    taxable = Math.max(0, taxable + serviceCharge)
  }
  const percentRate = normalizeTaxPercent(taxRate)
  let taxes = (taxable * percentRate) / 100
  // Guardrail: a corrupt rate must never recreate the $1.18M-style inflation.
  if (taxes > taxable && taxable > 0) {
    taxes = 0
  }
  const total = subtotal - discount + serviceCharge + taxes

  return {
    subtotal: roundMoney(subtotal),
    serviceCharge: roundMoney(serviceCharge),
    discount: roundMoney(discount),
    taxes: roundMoney(taxes),
    total: roundMoney(total),
    tixPaid,
    tixComp,
    tixDisc,
    svcDiffAmount: roundMoney(svcDiffAmount),
    isMultiplePromo: useMultiPromo,
    multiplePromoList
  }
}

/** Desktop lblTaxes — percent (e.g. 8.875). Reject dollar amounts masquerading as rates. */
export function normalizeTaxPercent(taxRate: number | null | undefined) {
  const rate = typeof taxRate === 'number' && Number.isFinite(taxRate) ? taxRate : 0
  if (rate <= 0) {
    return 0
  }
  // Fractions like 0.08875 were previously derived from SalesTax/taxable — convert.
  if (rate > 0 && rate < 1) {
    return rate * 100
  }
  // Anything above a plausible sales-tax percent is corrupt (e.g. 10880).
  if (rate > 100) {
    return 0
  }
  return rate
}

/**
 * Guards the "Reservation Details" summary against records that were persisted
 * with a corrupt SalesTax/Total (e.g. from the earlier tax-rate-unit bug that
 * stored a raw amount/fraction as the rate and inflated tax to values like
 * $1,183,744). A legitimate percentage-based sales tax can never exceed the
 * taxable base, so when it does we recompute tax/total from the system tax
 * percent. This is DISPLAY-only sanitization; it does not change what is sent
 * to the API (split payloads already use the normalized system percent).
 */
export function sanitizeStoredTotalsForDisplay(
  totals: {
    subtotal: number
    serviceCharge: number
    discount: number
    taxes: number
    total: number
  },
  taxRatePercent: number,
  taxWithServiceCharge = false
) {
  const { subtotal, serviceCharge, discount } = totals
  const taxable = Math.max(
    0,
    subtotal - discount + (taxWithServiceCharge ? serviceCharge : 0)
  )
  const isCorrupt = subtotal > 0 && totals.taxes > taxable
  if (!isCorrupt) {
    return totals
  }
  const percent = normalizeTaxPercent(taxRatePercent)
  const fixedTaxes = (taxable * percent) / 100
  return {
    subtotal,
    serviceCharge,
    discount,
    taxes: fixedTaxes,
    total: subtotal - discount + serviceCharge + fixedTaxes
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
  if (splitCount > remainingTickets) {
    return 'Cannot split more tickets than remain on this reservation.'
  }
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
    // Desktop SaveSplitPaymentDetails leaves IsSplitPayment unset/false.
    IsSplitPayment: false,
    SplitTaxes: splitTotals.taxes,
    // Desktop PaymentRequestModel uses the typo SplitServiceChage.
    SplitServiceChage: splitTotals.serviceCharge,
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
    payment.CreditCardNubmer = paymentFields.cardNumber.trim()
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
  taxRate,
  detail,
  reservationNote
}: {
  connectionName: string
  locationId: string
  reservationId: string
  lastUpdateId: string
  splitCount: number
  remainingTickets: number
  paymentType: ReservationPaymentType
  paymentFields: ReservationPaymentFields
  totals: SplitReservationTotals
  isSplitFlag: boolean
  paymentAmount: number
  promoId?: string
  taxRate: number
  detail?: ReservationDetail | null
  /** Optional override; defaults to detail.Memo. */
  reservationNote?: string
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
    ReservationNote: reservationNote ?? detail.Memo ?? '',
    Action: 'CMDSaveSplitPayment',
    ActionForm: 'fromReservation',
    IsReservationCheckedIn: (detail.CheckedIn ?? 0) > 0,
    // Desktop sends lblTaxes percent on TaxRate (not SalesTax/taxable fraction).
    TaxRate: normalizeTaxPercent(taxRate),
    SplitSubTotal: totals.subtotal,
    SplitServiceChage: totals.serviceCharge,
    SplitDiscount: totals.discount,
    SplitTaxes: totals.taxes,
    SplitTotal: totals.total,
    SvcDiffAmount: totals.svcDiffAmount ?? 0,
    IsMultiplePromo: totals.isMultiplePromo ?? false,
    PaymentModel: buildSplitPaymentModel({
      paymentType,
      paymentFields,
      paymentAmount,
      splitTotals: totals
    })
  }

  if (totals.isMultiplePromo) {
    payload.MultiplePromoList = totals.multiplePromoList || []
  }

  // Desktop omits ticket/party fields on partial split payment saves.
  if (!isSplitFlag) {
    payload.SplitParty = splitCount
    payload.SplitPasses = 0
    payload.TixPaid = totals.tixPaid ?? splitCount
    payload.TixComp = totals.tixComp ?? 0
    payload.TixDisc = totals.tixDisc ?? 0
  }

  return payload
}

/**
 * Desktop Split Party (existing reservation): SavePaymenInfo(isSplit=true) →
 * UpdateReservation with IsSplitReservation + SpltParty (not SaveSplitReservation).
 */
export function buildSplitPartyUpdateReservationRequest({
  connectionName,
  locationId,
  reservationId,
  lastUpdateId,
  splitCount,
  paymentType,
  paymentFields,
  totals,
  paymentAmount,
  promoId,
  promoCode,
  taxRate,
  detail,
  splitFirstName,
  splitLastName,
  splitPasses = 0,
}: {
  connectionName: string
  locationId: string
  reservationId: string
  lastUpdateId: string
  splitCount: number
  paymentType: ReservationPaymentType
  paymentFields: ReservationPaymentFields
  totals: SplitReservationTotals
  paymentAmount: number
  promoId?: string
  promoCode?: string
  taxRate: number
  detail: ReservationDetail
  splitFirstName?: string
  splitLastName?: string
  splitPasses?: number
}): SaveReservationRequest {
  const paymentModel = buildSplitPaymentModel({
    paymentType,
    paymentFields,
    paymentAmount,
    splitTotals: totals,
  })
  // Desktop sets IsSplitPayment only for non-cash payment types on Split Party.
  paymentModel.IsSplitPayment = paymentType !== 'cash'
  paymentModel.Taxes = detail.SalesTax ?? 0
  paymentModel.ServiceCharge = detail.SVC ?? 0

  const sourceRaw = (
    detail.Sources ||
    detail.ResSource ||
    detail.LookupSDescSource ||
    ''
  ).trim()
  const sourceLower = sourceRaw.toLowerCase()
  const lookUpCode = /^SRC\d+/i.test(sourceRaw)
    ? sourceRaw.toUpperCase()
    : sourceLower.includes('web')
      ? getReservationOriginLookupCode('web')
      : sourceLower.includes('walk')
        ? getReservationOriginLookupCode('walkup')
        : getReservationOriginLookupCode('phone')

  const request: SaveReservationRequest = {
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
    LookUpCode: lookUpCode,
    ReservationSource: detail.ResSource ?? '',
    OrigParty: detail.OrigPartyNo ?? detail.PartyNo ?? 0,
    Party: detail.PartyNo ?? 0,
    PromotionID: promoId && promoId !== 'none' ? promoId : '',
    PromotionCode: promoCode?.trim() || '',
    Passes: splitPasses,
    SubTotal: detail.SubTotal ?? 0,
    ServiceChage: detail.SVC ?? 0,
    Discount: detail.Discount ?? 0,
    Taxes: detail.SalesTax ?? 0,
    Total: detail.Total ?? 0,
    ReservationStatus: detail.ResStatus ?? '',
    IsDinner: detail.Dinner?.toUpperCase() === 'Y',
    IsVIP: false,
    ReservationNote: detail.Memo ?? detail.ReservationNotes ?? detail.Note ?? '',
    Action: 'CMDSaveReservation',
    ActionForm: 'fromReservation',
    IsReservationCheckedIn: (detail.CheckedIn ?? 0) > 0,
    TixPaid: totals.tixPaid ?? splitCount,
    TixComp: totals.tixComp ?? 0,
    TixDisc: totals.tixDisc ?? 0,
    IsSplitReservation: true,
    SpltParty: splitCount,
    SplitSubTotal: totals.subtotal,
    SplitTaxes: totals.taxes,
    TaxRate: normalizeTaxPercent(taxRate),
    SVCDiffAmount: totals.svcDiffAmount ?? 0,
    SplitCustomerFirstName: splitFirstName?.trim() || undefined,
    SplitCustomerLastName: splitLastName?.trim() || undefined,
    PaymentAmount: roundMoney(paymentAmount),
    PaymentTypeLookupCode: getReservationPaymentLookupCode(paymentType),
    IsPaymentLoad: true,
    PaymentModel: paymentModel,
  }

  return request
}
