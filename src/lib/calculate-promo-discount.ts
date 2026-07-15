import type { ReservationPromo } from '@/types/reservation-promo'

export function calculatePromoDiscount({
  promo,
  subtotal,
  ticketCount,
  unitPrice,
  passes = 1
}: {
  promo: ReservationPromo | null
  subtotal: number
  ticketCount: number
  unitPrice: number
  passes?: number
}) {
  if (!promo || ticketCount <= 0 || unitPrice <= 0) {
    return 0
  }

  const { applicableTickets, freeTickets, iPromoParty } = getPromoApplicableTickets({ promo, ticketCount, passes })
  if (applicableTickets <= 0 && freeTickets <= 0) {
    return 0
  }



  let discount = 0
  const discountType = promo.discountType?.trim().toUpperCase()

  if (discountType === 'PROMO02') {
    // Buy X get Y free
    const buyTix = promo.buyTix ?? 0
    const buyTixFree = promo.buyTixFree ?? 0
    
    if (buyTix === 0) {
      discount = freeTickets * unitPrice
    } else if (buyTix > 0 && buyTixFree > 0) {
      discount = freeTickets * unitPrice
    }
  } else if (discountType === 'PROMO03') {
    // Set ticket to a fixed price
    const fixedPrice = promo.price ?? 0
    if (fixedPrice >= 0 && unitPrice > fixedPrice) {
      discount = iPromoParty * (unitPrice - fixedPrice)
    }
  } else {
    // PROMO01 or default: % off or $ off per ticket
    if (promo.percOff != null && promo.percOff > 0) {
      discount = iPromoParty * (unitPrice * (promo.percOff / 100))
    } else if (promo.dollarOff != null && promo.dollarOff > 0) {
      discount = iPromoParty * promo.dollarOff
    }
  }

  // Guard: DollarMax capping
  if (promo.dollarMax != null && promo.dollarMax > 0) {
    const maxDiscount = promo.dollarMax * Math.max(1, passes)
    if (discount > maxDiscount) {
      discount = maxDiscount
    }
  }

  // Prevent negative discount or discounting more than the subtotal
  return Math.max(0, Math.min(discount, subtotal))
}

export function getPromoApplicableTickets({
  promo,
  ticketCount,
  passes = 1
}: {
  promo: ReservationPromo | null
  ticketCount: number
  passes?: number
}) {
  if (!promo || ticketCount <= 0) {
    return { applicableTickets: 0, freeTickets: 0, iPromoParty: 0 }
  }

  // Guard: MinTix
  if (promo.minTix != null && promo.minTix > 0 && ticketCount < promo.minTix) {
    return { applicableTickets: 0, freeTickets: 0, iPromoParty: 0 }
  }

  const maxFree = (promo.tixMax != null && promo.tixMax > 0)
    ? promo.tixMax * Math.max(1, passes)
    : Infinity

  const discountType = promo.discountType?.trim().toUpperCase()
  let freeTickets = 0
  let iPromoParty = ticketCount
  let applicableTickets = 0

  if (discountType === 'PROMO02') {
    const buyTix = promo.buyTix ?? 0
    const buyTixFree = promo.buyTixFree ?? 0

    if (buyTix === 0) {
      // Admit2/Admit4 path: all tickets are free, capped by TixMax×Passes
      iPromoParty = Math.min(ticketCount, maxFree)
      freeTickets = iPromoParty
    } else if (buyTix > 0 && buyTixFree > 0) {
      // BOGO path: compute free from FULL party, then cap the free count
      const groupSize = buyTix + buyTixFree
      const rawFree = Math.floor(ticketCount / groupSize) * buyTixFree
      freeTickets = Math.min(rawFree, maxFree)
      iPromoParty = ticketCount // party itself is not capped in this path
    }
    applicableTickets = freeTickets // fees apply to the free-ticket count
  } else {
    // For PROMO01/PROMO03: cap the eligible party
    iPromoParty = Math.min(ticketCount, maxFree)
    applicableTickets = iPromoParty
  }

  return { applicableTickets, freeTickets, iPromoParty }
}
