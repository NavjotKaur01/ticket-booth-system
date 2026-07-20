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
  getReservationPaymentLookupCode,
  PAYMENT_STATUS_PAYMENT
} from '@/lib/reservation-lookup-codes'
import type { ReservationDetail } from '@/types/api/reservation-detail'
import type {
  MultiplePromoModel,
  SaveReservationPaymentRequest,
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

  let taxable = Math.max(0, subtotal - discount)
  if (taxWithServiceCharge) {
    taxable = Math.max(0, taxable + serviceCharge)
  }
  const taxes = taxable * (taxRate ?? 0)
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
    TaxRate: taxRate,
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
