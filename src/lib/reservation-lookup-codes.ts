import type { ReservationPaymentType } from '@/data/reservation-payment-options'

export const RESERVATION_STATUS_ACTIVE = 'RSTATE01'
export const RESERVATION_STATUS_CANCELLED = 'RSTATE11'

export function isCancelledReservationStatus(resStatus: string | null | undefined) {
  return resStatus?.trim().toUpperCase() === RESERVATION_STATUS_CANCELLED
}
export const PAYMENT_STATUS_PAYMENT = 'PSTAT01'
export const PAYMENT_STATUS_REFUND = 'PSTAT21'
export const PAYMENT_STATUS_PROMO = 'PSTAT31'
export const ACTION_FORM_RESERVATION = 'fromReservation'
export const ACTION_FORM_MOVE_RESERVATION = 'fromMoveReservation'
export const ACTION_SAVE_RESERVATION = 'cmdSaveReservationWithPayment'
export const ACTION_MOVE_RESERVATION = 'CMDMoveReservation'
export const EMPTY_GUID = '00000000-0000-0000-0000-000000000000'

const ORIGIN_LOOKUP_CODES = {
  phone: 'SRC01',
  walkup: 'SRC02',
  web: 'SRC03'
} as const

const PAYMENT_TYPE_LOOKUP_CODES: Record<ReservationPaymentType, string> = {
  'hold-cc': 'PYMT01',
  'credit-card': 'PYMT02',
  'gift-card': 'PYMT03',
  'gift-cert': 'PYMT04',
  cash: 'PYMT05',
  'web-gift-cert': 'PYMT07',
  pos: 'PYMT08'
}

export function getReservationOriginLookupCode (
  origin: 'phone' | 'walkup' | 'web'
) {
  return ORIGIN_LOOKUP_CODES[origin]
}

export function getReservationPaymentLookupCode (
  paymentType: ReservationPaymentType
) {
  return PAYMENT_TYPE_LOOKUP_CODES[paymentType]
}
