import type { ReservationPromo } from '@/types/reservation-promo'

export function calculatePromoDiscount ({
  promo,
  subtotal,
  ticketCount,
  unitPrice
}: {
  promo: ReservationPromo | null
  subtotal: number
  ticketCount: number
  unitPrice: number
}) {
  if (!promo) {
    return 0
  }

  if (promo.percOff != null && promo.percOff > 0) {
    return subtotal * (promo.percOff / 100)
  }

  if (promo.dollarOff != null && promo.dollarOff > 0) {
    return promo.dollarOff
  }

  if (
    promo.buyTix != null &&
    promo.buyTixFree != null &&
    promo.buyTix > 0 &&
    promo.buyTixFree > 0
  ) {
    const groupSize = promo.buyTix + promo.buyTixFree
    const freeTickets =
      Math.floor(ticketCount / groupSize) * promo.buyTixFree

    return freeTickets * unitPrice
  }

  if (promo.price != null && promo.price >= 0) {
    return Math.max(0, subtotal - promo.price * ticketCount)
  }

  return 0
}
