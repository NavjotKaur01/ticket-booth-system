import {
  PAYMENT_STATUS_PAYMENT,
  PAYMENT_STATUS_PROMO,
  PAYMENT_STATUS_REFUND,
} from '@/lib/reservation-lookup-codes'
import type {
  ReservationDetail,
  ReservationDetailPaymentItem,
} from '@/types/api/reservation-detail'

const ELIGIBLE_PAYMENT_STATUSES = new Set([
  PAYMENT_STATUS_PAYMENT,
  PAYMENT_STATUS_REFUND,
  PAYMENT_STATUS_PROMO,
])

function roundMoney(value: number) {
  return Math.round(value * 100) / 100
}

function normalizeStatus(value: string | null | undefined) {
  return value?.trim().toUpperCase() ?? ''
}

function sumEligiblePayments(
  payments: ReservationDetailPaymentItem[],
  reservationId: string
) {
  return payments
    .filter(payment => {
      const paymentReservationId = payment.ReservationID?.trim() ?? ''
      return (
        paymentReservationId === reservationId &&
        ELIGIBLE_PAYMENT_STATUSES.has(normalizeStatus(payment.PaymentStatusCode))
      )
    })
    .reduce((sum, payment) => sum + (payment.Amount ?? 0), 0)
}

export function needsPromoValidation(detail: ReservationDetail) {
  return Boolean(detail.Promo?.trim())
}

/** Mirrors desktop ReservationVM.CheckIn payment and party validation. */
export function validateReservationCheckIn(detail: ReservationDetail) {
  const party = detail.PartyNo ?? 0
  const checkedIn = detail.CheckedIn ?? 0

  if (party > 0 && party === checkedIn) {
    return { canCheckIn: false, error: 'Entire party already checked-in' }
  }

  const subTotal = detail.SubTotal ?? 0
  const discount = detail.Discount ?? 0
  const total = detail.Total ?? 0
  const reservationId = detail.ReservationID?.trim() ?? ''

  if (subTotal === discount) {
    if (needsPromoValidation(detail)) {
      return { canCheckIn: true, error: null }
    }

    return {
      canCheckIn: false,
      error: 'Amount due is greater than zero. Cannot Check-in.',
    }
  }

  const paymentTotal = sumEligiblePayments(detail.PaymentList ?? [], reservationId)

  if (
    roundMoney(total) === roundMoney(paymentTotal) ||
    roundMoney(paymentTotal) >= roundMoney(total)
  ) {
    return { canCheckIn: true, error: null }
  }

  return {
    canCheckIn: false,
    error: 'Amount due is greater than zero. Cannot Check-in.',
  }
}
