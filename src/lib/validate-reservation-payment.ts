import { getPaymentDetailLayout } from '@/data/reservation-payment-options'
import type { ReservationPaymentType } from '@/data/reservation-payment-options'
import { parseReservationMoney } from '@/lib/calculate-reservation-totals'
import type { ReservationPaymentFields } from '@/types/reservation-payment'

export function validateReservationPayment ({
  paymentType,
  fields,
  paymentAmount,
  paymentRequired
}: {
  paymentType: ReservationPaymentType
  fields: ReservationPaymentFields
  paymentAmount: string
  paymentRequired: boolean
}) {
  if (!paymentRequired) {
    return null
  }

  if (parseReservationMoney(paymentAmount) <= 0) {
    return 'Payment amount must be greater than zero.'
  }

  const layout = getPaymentDetailLayout(paymentType)

  if (layout === 'gift-account' && !fields.accountNumber.trim()) {
    return 'Account number is required.'
  }

  if (layout === 'full-credit-card' || layout === 'compact-credit-card') {
    if (!fields.cardNumber.trim()) {
      return 'Credit card number is required.'
    }
    if (!fields.cvv.trim()) {
      return 'CVV is required.'
    }
    if (!fields.billingAddress.trim()) {
      return 'Billing address is required.'
    }
    if (layout === 'full-credit-card' && !fields.zipCode.trim()) {
      return 'Billing zip code is required.'
    }
  }

  return null
}
