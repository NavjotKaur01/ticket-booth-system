import { calculatePromoDiscount } from '@/lib/calculate-promo-discount'
import type { ReservationPromo } from '@/types/reservation-promo'

export type ReservationTotals = {
  subtotal: number
  serviceCharge: number
  discount: number
  taxes: number
  total: number
}

export function parseReservationMoney(value: string) {
  const parsed = Number(value.replace(/[^0-9.-]/g, ''))
  return Number.isFinite(parsed) ? parsed : 0
}

export function formatReservationMoney(value: number) {
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD'
  })
}

function parseSectionUnitPrice(price: string) {
  return parseReservationMoney(price)
}

function getPromoDiscount(
  promo: ReservationPromo | null,
  subtotal: number,
  ticketCount: number,
  unitPrice: number
) {
  return calculatePromoDiscount({ promo, subtotal, ticketCount, unitPrice })
}

export function calculateReservationTotals({
  sectionPrice,
  party,
  passes,
  promo,
  existingServiceCharge,
  existingDiscount,
  existingSalesTax,
  systemTaxRate,
  taxWithServiceCharge,
  baseSvcAmount,
  ccFeePercent
}: {
  sectionPrice: string
  party: number
  passes: number
  promo: ReservationPromo | null
  existingServiceCharge?: number
  existingDiscount?: number
  existingSalesTax?: number
  systemTaxRate?: number
  taxWithServiceCharge?: string
  baseSvcAmount?: number
  ccFeePercent?: number
}): ReservationTotals {





  // Step A — SubTotal
  const unitPrice = parseSectionUnitPrice(sectionPrice)
  const ticketCount = party > 0 ? Math.max(party, passes) : 0
  const subtotal = unitPrice * ticketCount

  // Step B — Base service charge
  const serviceChargeBase = typeof existingServiceCharge === 'number'
    ? existingServiceCharge
    : (typeof baseSvcAmount === 'number' ? baseSvcAmount : (subtotal > 0 ? 2 * ticketCount : 0))
    
  // Step C — Discount
  const discount = typeof existingDiscount === 'number'
    ? existingDiscount
    : getPromoDiscount(promo, subtotal, ticketCount, unitPrice)

  // Step D — Taxes
  const taxable = Math.max(0, subtotal - discount)
  const taxRate = typeof systemTaxRate === 'number' ? (systemTaxRate / 100) : 0.08
  
  let taxes = 0
  if (typeof existingSalesTax === 'number') {
    taxes = existingSalesTax
  } else {
    if (taxWithServiceCharge === 'Y') {
      taxes = Math.max(0, taxable + serviceChargeBase) * taxRate
    } else {
      taxes = taxable * taxRate
    }
  }

  // Step E — Total (before CC fee)
  let total = subtotal + serviceChargeBase + taxes - discount

  // Step F — CC fee (added into SVC + Total)
  // Only calculate extra CC fee if we are generating a new service charge (not using an existing overridden one which already has it baked in).
  const ccRate = typeof ccFeePercent === 'number' ? (ccFeePercent / 100) : 0
  let finalServiceCharge = serviceChargeBase
  let finalTotal = total

  if (typeof existingServiceCharge !== 'number' && ccRate > 0) {
    const extra = (subtotal - discount + serviceChargeBase) * ccRate
    finalServiceCharge += extra
    finalTotal += extra
  }

  return {
    subtotal,
    serviceCharge: finalServiceCharge,
    discount,
    taxes,
    total: finalTotal
  }
}

export function getReservationAmountDue(
  total: number,
  paymentAmount: number
) {
  return Math.max(0, total - paymentAmount)
}
