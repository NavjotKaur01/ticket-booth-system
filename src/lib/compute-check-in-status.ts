import type { CheckInStatus } from "@/types/check-in"

function roundMoney(value: number) {
  return Math.round(value * 100) / 100
}

type CheckInStatusInput = {
  party: number
  checkedIn: number
  total: number
  paid: number
  promoPayments?: number
}

/**
 * Mirrors desktop CheckInVM.ReservationStatus icon rules:
 * green when fully paid and fully seated; red unpaid; yellow partial pay; else paid-not-seated.
 */
export function computeCheckInStatus({
  party,
  checkedIn,
  total,
  paid,
  promoPayments = 0,
}: CheckInStatusInput): CheckInStatus {
  const totalAmount = roundMoney(total)
  const paidAmount = roundMoney(paid)
  const promoAmount = roundMoney(promoPayments)

  if (party === checkedIn && totalAmount === paidAmount) {
    return "paid-checked-in"
  }

  if (totalAmount === 0) {
    return "paid-not-seated"
  }

  if (paidAmount === 0) {
    return "not-paid"
  }

  if (totalAmount - promoAmount > paidAmount) {
    return "partial-check-in"
  }

  return "paid-not-seated"
}
