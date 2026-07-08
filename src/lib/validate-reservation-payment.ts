import {
  EXPIRATION_MONTHS,
  getPaymentDetailLayout
} from '@/data/reservation-payment-options'
import type { ReservationPaymentType } from '@/data/reservation-payment-options'
import { parseReservationMoney } from '@/lib/calculate-reservation-totals'
import {
  detectCardBrand,
  getCardBrandCandidates,
  hasValidCardBrandLength
} from '@/lib/detect-card-brand'
import type { ReservationPaymentFields } from '@/types/reservation-payment'

export type ReservationPaymentValidationErrors = Partial<
  Record<
    | 'paymentType'
    | 'paymentAmount'
    | 'accountNumber'
    | 'cardNumber'
    | 'expiration'
    | 'cvv'
    | 'billingAddress'
    | 'zipCode',
    string
  >
>

function isValidExpirationDate (expMonth: string, expYear: string) {
  const monthIndex = EXPIRATION_MONTHS.indexOf(
    expMonth as (typeof EXPIRATION_MONTHS)[number]
  )
  const year = Number(expYear)

  if (monthIndex === -1 || !Number.isInteger(year)) {
    return false
  }

  const now = new Date()
  const expirationDate = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999)

  return expirationDate > now
}

function getExpectedCvvLength (cardNumber: string) {
  return detectCardBrand(cardNumber)?.brand === 'AMEX' ? 4 : 3
}

function isCvvRequired (cardNumber: string) {
  return detectCardBrand(cardNumber)?.brand !== 'MAESTRO'
}

export function validateReservationPaymentFields ({
  paymentType,
  fields,
  paymentAmount,
  paymentRequired,
  disallowCash = false
}: {
  paymentType: ReservationPaymentType
  fields: ReservationPaymentFields
  paymentAmount: string
  paymentRequired: boolean
  disallowCash?: boolean
}) {
  const errors: ReservationPaymentValidationErrors = {}

  if (!paymentRequired) {
    return errors
  }

  if (disallowCash && paymentType === 'cash') {
    errors.paymentType = 'Cash payment is not allowed for phone reservations.'
  }

  if (parseReservationMoney(paymentAmount) <= 0) {
    errors.paymentAmount = 'Payment amount must be greater than zero.'
  }

  const layout = getPaymentDetailLayout(paymentType)

  if (layout === 'gift-account' && !fields.accountNumber.trim()) {
    errors.accountNumber = 'Account number is required.'
  }

  if (layout === 'full-credit-card' || layout === 'compact-credit-card') {
    if (!fields.cardNumber.trim()) {
      errors.cardNumber = 'Credit card number is required.'
    } else if (getCardBrandCandidates(fields.cardNumber).length === 0) {
      errors.cardNumber =
        'Card provider was not found. Please check the card number.'
    } else if (!hasValidCardBrandLength(fields.cardNumber)) {
      errors.cardNumber = 'Credit card number is not valid.'
    }

    if (!fields.expMonth || !fields.expYear) {
      errors.expiration = 'Expiration date is required.'
    } else if (!isValidExpirationDate(fields.expMonth, fields.expYear)) {
      errors.expiration = 'Expiration date is not valid.'
    }

    const cvvPattern = new RegExp(
      `^\\d{${getExpectedCvvLength(fields.cardNumber)}}$`
    )
    if (isCvvRequired(fields.cardNumber) && !fields.cvv.trim()) {
      errors.cvv = 'CVV is required.'
    } else if (fields.cvv.trim() && !cvvPattern.test(fields.cvv)) {
      errors.cvv = 'CVV is not valid.'
    }

  }

  return errors
}

export function getFirstReservationPaymentError (
  errors: ReservationPaymentValidationErrors
) {
  const order: Array<keyof ReservationPaymentValidationErrors> = [
    'paymentType',
    'paymentAmount',
    'accountNumber',
    'cardNumber',
    'expiration',
    'cvv',
    'billingAddress',
    'zipCode'
  ]

  for (const key of order) {
    if (errors[key]) {
      return errors[key] ?? null
    }
  }

  return null
}

export function validateReservationPayment (params: {
  paymentType: ReservationPaymentType
  fields: ReservationPaymentFields
  paymentAmount: string
  paymentRequired: boolean
  disallowCash?: boolean
}) {
  return getFirstReservationPaymentError(validateReservationPaymentFields(params))
}
