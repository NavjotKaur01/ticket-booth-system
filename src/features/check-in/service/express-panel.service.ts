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

function isSameCalendarDay(dateStr: string, compareTo: Date) {
  const d = new Date(`${dateStr}T00:00:00`)
  if (Number.isNaN(d.getTime())) {
    return false
  }

  return (
    d.getFullYear() === compareTo.getFullYear() &&
    d.getMonth() === compareTo.getMonth() &&
    d.getDate() === compareTo.getDate()
  )
}

/**
 * Desktop CheckInVM.CalculateServiceCharge for walk-up (SRC02):
 * (WalkUpFee + DayOfShowFee when show is today) * party
 */
export function calculateExpressWalkupServiceCharge({
  walkUpFee = 0,
  dayOfShowFee = 0,
  quantity,
  showDate,
}: {
  walkUpFee?: number
  dayOfShowFee?: number
  quantity: number
  showDate?: string
}): number {
  const party = Math.max(0, quantity)
  if (party <= 0) {
    return 0
  }

  const includeDayOfShow =
    Boolean(showDate) && isSameCalendarDay(showDate!, new Date())
  const perTicket = walkUpFee + (includeDayOfShow ? dayOfShowFee : 0)
  return perTicket * party
}

/** Estimated all-in price for one ticket (desktop ExpressDefault button labels). */
export function estimateExpressTicketUnitPrice({
  sectionPrice,
  walkUpFee = 0,
  dayOfShowFee = 0,
  showDate,
  taxRatePercent = 0,
}: {
  sectionPrice: number
  walkUpFee?: number
  dayOfShowFee?: number
  showDate?: string
  /** Percent, e.g. 8 for 8% (matches system default lblTaxes). */
  taxRatePercent?: number
}): number {
  const svcPerTicket = calculateExpressWalkupServiceCharge({
    walkUpFee,
    dayOfShowFee,
    quantity: 1,
    showDate,
  })
  const taxPerTicket = sectionPrice * (taxRatePercent / 100)
  return sectionPrice + taxPerTicket + svcPerTicket
}

/** Live express totals from section price + walk-up fee + promo. */
export function calculateExpressPanelTotalsFromSection({
  sectionPrice,
  walkUpFee = 0,
  dayOfShowFee = 0,
  showDate,
  quantity,
  passes,
  promo,
  taxRatePercent = 0,
  taxWithServiceCharge,
}: {
  sectionPrice: number
  walkUpFee?: number
  dayOfShowFee?: number
  showDate?: string
  quantity: number
  passes?: number
  promo: ReservationPromo | null
  taxRatePercent?: number
  taxWithServiceCharge?: string
}): ExpressPanelTotals {
  const party = Math.max(0, quantity)
  const passCount = Math.max(0, passes ?? quantity)
  const baseSvcAmount = calculateExpressWalkupServiceCharge({
    walkUpFee,
    dayOfShowFee,
    quantity: party,
    showDate,
  })

  const totals = calculateReservationTotals({
    sectionPrice,
    sectionShowPrice: sectionPrice,
    party,
    passes: passCount,
    promo,
    baseSvcAmount: party > 0 ? baseSvcAmount : 0,
    systemTaxRate: taxRatePercent,
    taxWithServiceCharge,
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
