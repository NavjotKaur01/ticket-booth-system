import { calculateReservationTotals } from "@/lib/calculate-reservation-totals"
import type { ReservationPromo } from "@/types/reservation-promo"

export type ExpressPaymentType = "Cash" | "Credit Card"

export type ExpressPanelTotals = {
  subtotal: string
  serviceCharge: string
  discount: string
  tax: string
  total: string
  paymentDue: number
}

function formatMoney(value: number) {
  return `$${value.toFixed(2)}`
}

/** Live express totals from section price + walk-up fee + promo. */
export function calculateExpressPanelTotalsFromSection({
  sectionPrice,
  walkUpFee = 0,
  quantity,
  promo,
}: {
  sectionPrice: number
  walkUpFee?: number
  quantity: number
  promo: ReservationPromo | null
}): ExpressPanelTotals {
  const totals = calculateReservationTotals({
    sectionPrice,
    sectionShowPrice: sectionPrice,
    party: Math.max(0, quantity),
    passes: Math.max(0, quantity),
    promo,
    baseSvcAmount: walkUpFee || undefined,
  })

  return {
    subtotal: formatMoney(totals.subtotal),
    serviceCharge: formatMoney(totals.serviceCharge),
    discount: formatMoney(totals.discount),
    tax: formatMoney(totals.taxes),
    total: formatMoney(totals.total),
    paymentDue: totals.total,
  }
}

export function calculateSalesTransactionChange({
  paymentAmount,
  paymentDue,
}: {
  paymentAmount: number
  paymentDue: number
}) {
  return paymentAmount - paymentDue
}
