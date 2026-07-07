import {
  EXPIRATION_MONTHS,
  type ReservationPaymentType,
} from '@/data/reservation-payment-options'
import { formatUsDateTime } from '@/lib/format-us-datetime'
import {
  ACTION_FORM_MOVE_RESERVATION,
  ACTION_MOVE_RESERVATION,
  getReservationOriginLookupCode,
  getReservationPaymentLookupCode,
  PAYMENT_STATUS_PAYMENT,
} from '@/lib/reservation-lookup-codes'
import type { MoveReservationRequest } from '@/types/api/move-reservation'
import type { SaveReservationPaymentRequest } from '@/types/api/save-reservation'
import type { ReservationPaymentFields } from '@/types/reservation-payment'
import type { ReservationSectionOption } from '@/types/reservation'

const TABLE_SECTION_CODES = new Set([
  'SECT12',
  'SECT16',
  'SECT13',
  'SECT17',
  'SECT10',
  'SECT15',
  'SECT05',
])

function normalizeSectionCode(value: string | null | undefined) {
  return value?.trim().toUpperCase() ?? ''
}

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

function buildMovePaymentModel({
  paymentType,
  paymentFields,
  paymentAmount,
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
    IsSplitPayment: false,
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

export function calculateMoveReservationDifference(
  originalTotal: number,
  newTotal: number
) {
  const difference = roundMoney(newTotal - originalTotal)
  return {
    difference,
    isPayable: difference > 0,
    chargeAmount: difference > 0 ? difference : 0,
  }
}

export function validateMoveReservationSection({
  reservationSectionCode,
  destinationSectionCode,
}: {
  reservationSectionCode: string | null | undefined
  destinationSectionCode: string | null | undefined
}) {
  const reservationSection = normalizeSectionCode(reservationSectionCode)
  const destinationSection = normalizeSectionCode(destinationSectionCode)

  if (TABLE_SECTION_CODES.has(reservationSection)) {
    if (destinationSection !== reservationSection) {
      return "Invalid show selection. Table's reservation move only to that show that have table section"
    }

    return null
  }

  if (TABLE_SECTION_CODES.has(destinationSection)) {
    return "Invalid show selection. Party can't be move into table section"
  }

  return null
}

function withMovedNoChangesNote(noteStr: string) {
  if (noteStr.includes('Moved No Change')) {
    return noteStr
  }

  if (!noteStr.trim()) {
    return 'Moved No Changes Permitted.'
  }

  return `${noteStr.trim()}\nMoved No Changes Permitted.`
}

type BuildMoveReservationRequestParams = {
  connectionName: string
  locationId: string
  reservationId: string
  lastUpdateId: string
  selectedSection: ReservationSectionOption
  origin: 'phone' | 'walkup' | 'web'
  party: number
  origParty: number
  passes: number
  promotionCode?: string
  reservationNotes: string
  dinner: boolean
  isVip: boolean
  extraAmount: number
  isExtraAmountPayable: boolean
  isPaymentWindowRequest?: boolean
  appendMovedNoChangesNote?: boolean
  paymentType?: ReservationPaymentType
  paymentFields?: ReservationPaymentFields
}

export function buildMoveReservationRequest({
  connectionName,
  locationId,
  reservationId,
  lastUpdateId,
  selectedSection,
  origin,
  party,
  origParty,
  passes,
  promotionCode,
  reservationNotes,
  dinner,
  isVip,
  extraAmount,
  isExtraAmountPayable,
  isPaymentWindowRequest = false,
  appendMovedNoChangesNote = false,
  paymentType,
  paymentFields,
}: BuildMoveReservationRequestParams): MoveReservationRequest {
  let noteStr = reservationNotes.trim()

  if (appendMovedNoChangesNote) {
    noteStr = withMovedNoChangesNote(noteStr)
  } else if (promotionCode?.trim()) {
    noteStr = withMovedNoChangesNote(noteStr)
  }

  const request: MoveReservationRequest = {
    ConnectionString: connectionName,
    LocationId: locationId,
    ReservationId: reservationId,
    ShowId: selectedSection.showId,
    ShowDetID: selectedSection.showDetId,
    ShowSec: selectedSection.showSec,
    ShowPrice: selectedSection.showPrice,
    DayOfShowFee: selectedSection.dayOfShowFee,
    PhoneInFee: selectedSection.phoneInFee,
    WalkUpFee: selectedSection.walkUpFee,
    WebFee: selectedSection.webFee,
    SourceLookUpCode: getReservationOriginLookupCode(origin),
    Party: party,
    OrigParty: origParty,
    ExtraAmount: roundMoney(extraAmount),
    IsExtraAmountPayable: isExtraAmountPayable,
    IsPaymentWindowRequest: isPaymentWindowRequest,
    Passes: passes,
    ResNotes: noteStr,
    IsDinner: dinner,
    IsVIP: isVip,
    LastUpdateID: lastUpdateId,
    LastUpdateDt: formatUsDateTime(new Date()),
    ActionForm: ACTION_FORM_MOVE_RESERVATION,
    Action: ACTION_MOVE_RESERVATION,
  }

  if (promotionCode?.trim()) {
    request.PromotionCode = promotionCode.trim()
  }

  if (isExtraAmountPayable && paymentType && paymentFields) {
    request.PaymentModel = buildMovePaymentModel({
      paymentType,
      paymentFields,
      paymentAmount: extraAmount,
    })
  }

  return request
}

export function calculateMoveReservationTotals({
  sectionPrice,
  party,
  origDiscount,
}: {
  sectionPrice: string
  party: number
  origDiscount: number
}) {
  const unitPrice = Number(sectionPrice.replace(/[^0-9.-]/g, '')) || 0
  const subtotal = unitPrice * party
  const serviceCharge = subtotal > 0 ? 2 * party : 0
  const discount = origDiscount
  const taxable = Math.max(0, subtotal + serviceCharge - discount)
  const taxes = taxable * 0.08
  const total = taxable + taxes

  return {
    subtotal: roundMoney(subtotal),
    serviceCharge: roundMoney(serviceCharge),
    discount: roundMoney(discount),
    taxes: roundMoney(taxes),
    total: roundMoney(total),
  }
}

export function isPastShowDate(showDateIso: string) {
  const showDate = new Date(`${showDateIso}T00:00:00`)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return showDate.getTime() < today.getTime()
}
