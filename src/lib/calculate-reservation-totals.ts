import { calculatePromoDiscount } from '@/lib/calculate-promo-discount'
import type { ReservationPromo } from '@/types/reservation-promo'

export type ReservationTotals = {
  subtotal: number
  serviceCharge: number
  discount: number
  taxes: number
  total: number
}

export function parseReservationMoney (value: string) {
  const parsed = Number(value.replace(/[^0-9.-]/g, ''))
  return Number.isFinite(parsed) ? parsed : 0
}

export function formatReservationMoney (value: number) {
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD'
  })
}

function parseSectionUnitPrice (price: string) {
  return parseReservationMoney(price)
}

function getPromoDiscount (
  promo: ReservationPromo | null,
  subtotal: number,
  ticketCount: number,
  unitPrice: number
) {
  return calculatePromoDiscount({ promo, subtotal, ticketCount, unitPrice })
}

export function calculateReservationTotals ({
  sectionPrice,
  party,
  passes,
  promo
}: {
  sectionPrice: string
  party: number
  passes: number
  promo: ReservationPromo | null
}): ReservationTotals {
  const unitPrice = parseSectionUnitPrice(sectionPrice)
  const ticketCount =
    party > 0 ? Math.max(party, passes) : 0
  const subtotal = unitPrice * ticketCount
  const serviceCharge = subtotal > 0 ? 2 * ticketCount : 0
  const discount = getPromoDiscount(promo, subtotal, ticketCount, unitPrice)
  const taxable = Math.max(0, subtotal + serviceCharge - discount)
  const taxes = taxable * 0.08
  const total = taxable + taxes

  return {
    subtotal,
    serviceCharge,
    discount,
    taxes,
    total
  }
}

export function getReservationAmountDue (
  total: number,
  paymentAmount: number
) {
  return Math.max(0, total - paymentAmount)
}
