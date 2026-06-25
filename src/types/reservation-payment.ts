import { EXPIRATION_MONTHS } from '@/data/reservation-payment-options'
import type { ReservationPaymentType } from '@/data/reservation-payment-options'

export type ReservationPaymentFields = {
  cardNumber: string
  cvv: string
  expMonth: string
  expYear: string
  billingAddress: string
  zipCode: string
  accountNumber: string
}

export type ReservationPaymentState = {
  paymentType: ReservationPaymentType
  fields: ReservationPaymentFields
}

export function createEmptyReservationPaymentFields (): ReservationPaymentFields {
  return {
    cardNumber: '',
    cvv: '',
    expMonth: EXPIRATION_MONTHS[0],
    expYear: String(new Date().getFullYear()),
    billingAddress: '',
    zipCode: '',
    accountNumber: ''
  }
}

export function createEmptyReservationPaymentState (): ReservationPaymentState {
  return {
    paymentType: 'credit-card',
    fields: createEmptyReservationPaymentFields()
  }
}
