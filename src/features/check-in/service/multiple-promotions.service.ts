import {
  calculatePromoDiscount,
  getPromoApplicableTickets,
} from "@/lib/calculate-promo-discount"
import { calculateReservationTotals } from "@/lib/calculate-reservation-totals"
import { calculateExpressWalkupServiceCharge } from "@/features/check-in/service/express-panel.service"
import type { ReservationPromo } from "@/types/reservation-promo"

export type MultiplePromotionRowState = {
  promoId: string
  passes: number
}

export type MultiplePromotionRowSummary = {
  paid: number
  comp: number
  disc: number
  discountAmount: number
}

export type MultiplePromotionsTotals = {
  subtotal: number
  serviceCharge: number
  discount: number
  taxes: number
  total: number
  partyNumber: number
  pricePerTicket: number
  unDiscount: number
  rows: MultiplePromotionRowSummary[]
}

function formatMoney(value: number) {
  return `$${value.toFixed(2)}`
}

export function formatMultiplePromotionsMoney(value: number) {
  return formatMoney(value)
}

/** Desktop-style multi-promo totals for Express Multiple Promotions dialog. */
export function calculateMultiplePromotionsTotals({
  sectionPrice,
  walkUpFee = 0,
  dayOfShowFee = 0,
  showDate,
  taxRatePercent = 0,
  taxWithServiceCharge,
  partyNumber,
  rows,
  promosById,
}: {
  sectionPrice: number
  walkUpFee?: number
  dayOfShowFee?: number
  showDate?: string
  taxRatePercent?: number
  taxWithServiceCharge?: string
  partyNumber: number
  rows: MultiplePromotionRowState[]
  promosById: Map<string, ReservationPromo>
}): MultiplePromotionsTotals {
  const party = Math.max(0, partyNumber)
  const unitPrice = Math.max(0, sectionPrice)

  const rowSummaries: MultiplePromotionRowSummary[] = rows.map((row) => {
    const passes = Math.max(0, Math.min(15, Math.floor(row.passes) || 0))
    const promo =
      row.promoId && row.promoId !== "select"
        ? (promosById.get(row.promoId) ?? null)
        : null

    if (!promo || passes <= 0 || unitPrice <= 0) {
      return { paid: 0, comp: 0, disc: 0, discountAmount: 0 }
    }

    const rowSubtotal = unitPrice * passes
    const discountAmount = calculatePromoDiscount({
      promo,
      subtotal: rowSubtotal,
      ticketCount: passes,
      unitPrice,
      passes,
    })
    const { freeTickets, iPromoParty } = getPromoApplicableTickets({
      promo,
      ticketCount: passes,
      passes,
    })

    const discountType = promo.discountType?.trim().toUpperCase() ?? ""
    const isCompStyle =
      discountType === "PROMO02" ||
      (discountAmount > 0 && Math.abs(discountAmount - rowSubtotal) < 0.01)

    const disc = Math.max(0, iPromoParty - freeTickets)
    const comp = Math.max(0, freeTickets)
    const paid = Math.max(0, passes - disc - comp)

    return {
      paid: isCompStyle && freeTickets === 0 && discountAmount >= rowSubtotal - 0.01
        ? 0
        : paid,
      comp: isCompStyle && freeTickets === 0 && discountAmount >= rowSubtotal - 0.01
        ? passes
        : comp,
      disc: isCompStyle && freeTickets === 0 && discountAmount >= rowSubtotal - 0.01
        ? 0
        : disc,
      discountAmount,
    }
  })

  const assignedPasses = rows.reduce(
    (sum, row) => sum + Math.max(0, Math.floor(row.passes) || 0),
    0
  )
  const totalDiscount = rowSummaries.reduce(
    (sum, row) => sum + row.discountAmount,
    0
  )

  // Prefer one combined totals calc when a single primary promo covers party.
  const primaryRow = [...rows]
    .map((row, index) => ({ row, index, passes: Math.max(0, row.passes) }))
    .filter((entry) => entry.row.promoId !== "select" && entry.passes > 0)
    .sort((a, b) => b.passes - a.passes)[0]

  const primaryPromo = primaryRow
    ? (promosById.get(primaryRow.row.promoId) ?? null)
    : null

  const baseSvcAmount = calculateExpressWalkupServiceCharge({
    walkUpFee,
    dayOfShowFee,
    quantity: party,
    showDate,
  })

  const baseTotals = calculateReservationTotals({
    sectionPrice: unitPrice,
    sectionShowPrice: unitPrice,
    party,
    passes: party,
    promo: primaryPromo,
    baseSvcAmount: party > 0 ? baseSvcAmount : undefined,
    existingDiscount: totalDiscount > 0 ? totalDiscount : undefined,
    systemTaxRate: taxRatePercent,
    taxWithServiceCharge,
  })

  return {
    subtotal: baseTotals.subtotal,
    serviceCharge: baseTotals.serviceCharge,
    discount: totalDiscount > 0 ? totalDiscount : baseTotals.discount,
    taxes: baseTotals.taxes,
    total: (() => {
      const discount = totalDiscount > 0 ? totalDiscount : baseTotals.discount
      return Math.max(
        0,
        baseTotals.subtotal + baseTotals.serviceCharge + baseTotals.taxes - discount
      )
    })(),
    partyNumber: party,
    pricePerTicket: unitPrice,
    unDiscount: Math.max(0, party - assignedPasses),
    rows: rowSummaries,
  }
}

/** Pick primary promo for Express panel after multi-promo OK. */
export function resolvePrimaryPromoFromRows(
  rows: MultiplePromotionRowState[],
  promosById: Map<string, ReservationPromo>
): ReservationPromo | null {
  const ranked = [...rows]
    .map((row) => ({
      promoId: row.promoId,
      passes: Math.max(0, Math.floor(row.passes) || 0),
    }))
    .filter((row) => row.promoId !== "select" && row.passes > 0)
    .sort((a, b) => b.passes - a.passes)

  const top = ranked[0]
  if (!top) {
    return null
  }

  return promosById.get(top.promoId) ?? null
}
