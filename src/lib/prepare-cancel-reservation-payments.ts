import type { ReservationDetailPaymentItem } from '@/types/api/reservation-detail'
import type { CancelReservationPaymentRow } from '@/types/cancel-reservation-payment'

const RESTRICTED_USER_RIGHTS = new Set(['SEC02', 'SEC03'])

function normalizeText(value: string | null | undefined) {
  return value?.trim() ?? ''
}

function canSelectPayments(userRight: string) {
  return !RESTRICTED_USER_RIGHTS.has(userRight.trim().toUpperCase())
}

export function prepareCancelReservationPayments(
  payments: ReservationDetailPaymentItem[] | undefined,
  userRight: string
): CancelReservationPaymentRow[] {
  const allowSelection = canSelectPayments(userRight)

  return (payments ?? [])
    .filter((payment) => (payment.Amount ?? 0) !== 0)
    .map((payment) => ({
      paymentId: payment.PaymentID,
      reservationId: normalizeText(payment.ReservationID),
      isSelected: allowSelection ? true : Boolean(payment.IsSelected),
      pymtStatus: normalizeText(payment.PymtStatus),
      lastName: normalizeText(payment.LastName),
      firstName: normalizeText(payment.FirstName),
      pymtType: normalizeText(payment.PymtType),
      ccType: normalizeText(payment.CCType),
      cardNum: normalizeText(payment.CardNum),
      amount: payment.Amount ?? 0,
      auth: normalizeText(payment.Auth),
      pnref: normalizeText(payment.PNREF),
      // API Split flag: "X" → Y; null/empty → N
      split: payment.Split?.trim().toUpperCase() === 'X' ? 'Y' : 'N',
      paymentStatusCode: normalizeText(payment.PaymentStatusCode),
      canSelect: allowSelection
    }))
}
