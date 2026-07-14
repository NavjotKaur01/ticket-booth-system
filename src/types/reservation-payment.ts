import type { ReservationPaymentType } from '@/data/reservation-payment-options'

export type ReservationPaymentFields = {
  cardNumber: string
  cvv: string
  expMonth: string
  expYear: string
  billingAddress: string
  zipCode: string
  accountNumber: string
  /** Authorization code returned by the payment gateway/terminal. */
  authorization: string
  /** Payment gateway reference number (PNREF). */
  pnref: string

  cardType?: string
}

export type ReservationPaymentState = {
  paymentType: ReservationPaymentType
  fields: ReservationPaymentFields
}

export function createEmptyReservationPaymentFields(): ReservationPaymentFields {
  return {
    cardNumber: '',
    cvv: '',
    expMonth: '',
    expYear: '',
    billingAddress: '',
    zipCode: '',
    accountNumber: '',
    authorization: '',
    pnref: ''
  }
}

export function createEmptyReservationPaymentState(): ReservationPaymentState {
  return {
    paymentType: 'credit-card',
    fields: createEmptyReservationPaymentFields()
  }
}
