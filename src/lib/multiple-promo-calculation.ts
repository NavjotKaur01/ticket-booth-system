import type { ReservationPromo } from '@/types/reservation-promo'

export type MultiplePromoResult = {
  discount: number
  promoParty: number
  tixPaid: number
  tixComp: number
  tixDisc: number
  promoTix: number
  promoServiceChargeDiff: number
}

/**
 * Desktop-parity port of ReservationVMHelper.MultiplePromosDiscCalculation.
 * All logic branches (PROMO01/02/03), tixPaid base, SVC multiplier,
 * and origin-aware SVC differential match the C# desktop implementation exactly.
 */
export function multiplePromosDiscCalculation({
  promo,
  party,
  pass,
  showPrice,
  originCode,
  baseClubFee,
  baseDayOfShowFee,
  isDayOfShow = false
}: {
  promo: ReservationPromo
  party: number
  pass: number
  showPrice: number
  originCode: string
  baseClubFee: number
  baseDayOfShowFee: number
  isDayOfShow?: boolean
}): MultiplePromoResult {
  const zero: MultiplePromoResult = {
    discount: 0, promoParty: 0, tixPaid: 0, tixComp: 0,
    tixDisc: 0, promoTix: 0, promoServiceChargeDiff: 0
  }

  const minTix = promo.minTix ?? 0
  const tixMax = promo.tixMax ?? 0

  // Desktop: early exit if party < minTix
  if (minTix > 0 && party < minTix) {
    return zero
  }

  // Desktop: cap iPromoParty by TixMax * pass
  let iPromoParty = party
  if (tixMax > 0 && party > tixMax * pass) {
    iPromoParty = tixMax * pass
  }

  let discount = 0
  let tixComp = 0
  let tixDisc = 0
  let promoTix = 0
  // promoParty (iTix + iDiv in desktop) — computed per branch
  let promoParty = 0

  const type = promo.discountType?.trim().toUpperCase()

  if (type === 'PROMO01') {
    // ── % off or $ off per ticket ──────────────────────────────────────────
    const percOff = promo.percOff ?? 0
    if (percOff > 0) {
      discount = iPromoParty * showPrice * (percOff / 100)
    } else {
      discount = iPromoParty * (promo.dollarOff ?? 0)
    }
    promoTix = iPromoParty
    tixDisc = iPromoParty
    promoParty = iPromoParty

  } else if (type === 'PROMO02') {
    // ── Buy X get Y free (includes AdmitX where buyTix=0) ─────────────────
    const buyTix = promo.buyTix ?? 0
    const buyTixFree = promo.buyTixFree ?? 0

    // Desktop zeros everything when BuyTixFree is 0
    if (buyTixFree === 0) {
      return zero
    }

    let iDiv = 0 // free tickets

    if (buyTix === 0) {
      // AdmitX / all-free path: entire (capped) party is free
      iDiv = iPromoParty
    } else {
      // BOGO path: compute free from full party, then cap
      const groupSize = buyTix + buyTixFree
      iDiv = Math.floor(party / groupSize) * buyTixFree
    }

    // Apply TixMax cap on free tickets
    if (tixMax > 0 && iDiv > tixMax * pass) {
      iDiv = tixMax * pass
    }

    // Desktop: iTix = (iDiv / BuyTixFree) * BuyTix  (paid seats paired to free seats)
    const iTix = buyTix === 0 ? 0 : Math.floor(iDiv / buyTixFree) * buyTix

    promoParty = iTix + iDiv   // matches desktop PromoParty = iTix + iDiv
    discount = iDiv * showPrice
    tixComp = iDiv
    promoTix = iDiv

  } else if (type === 'PROMO03') {
    // ── Set-price discount ─────────────────────────────────────────────────
    // Desktop can produce negative discount if price > showPrice (no clamp)
    discount = iPromoParty * (showPrice - (promo.price ?? 0))
    promoTix = iPromoParty
    tixDisc = iPromoParty
    promoParty = iPromoParty
  }

  // Desktop multi-promo: DollarMax starts at 0 in the loop → cap is dead code.
  // We intentionally replicate that (no cap applied).

  // ── Service Charge Differential ────────────────────────────────────────
  // Desktop: SVC is computed on iPromoParty (the full capped party).
  // DayOfShowFee is ONLY included in the differential when the show is TODAY.
  // On any other day only the base fee differential (phone/walkup/web) applies.
  let promoServiceChargeDiff = 0
  const useShowFees = promo.useShowFees?.trim().toUpperCase()

  if (useShowFees === 'N') {
    const promoDayOfShowFee = promo.dayOfShowFee ?? 0
    const norm = originCode?.trim().toLowerCase()

    let dSVCDiff = 0

    if (norm === 'src01' || norm === 'phone') {
      const promoPhoneFee = promo.phoneInFee ?? 0
      if (isDayOfShow) {
        // Phone + show day: include DOS differential
        dSVCDiff = (promoPhoneFee - baseClubFee) + (promoDayOfShowFee - baseDayOfShowFee)
      } else {
        // Phone + other day: base fee differential only (no DOS)
        dSVCDiff = promoPhoneFee - baseClubFee
      }

    } else if (norm === 'src02' || norm === 'walkup') {
      const promoWalkupFee = promo.walkUpFee ?? 0
      if (isDayOfShow) {
        // Walkup + show day: promoDOS added, clubDOS NOT subtracted (desktop behavior)
        dSVCDiff = (promoWalkupFee - baseClubFee) + promoDayOfShowFee
      } else {
        // Walkup + other day: base fee differential only
        dSVCDiff = promoWalkupFee - baseClubFee
      }

    } else {
      // Web: promoWeb − clubWalkupFee (desktop uses walk-up base, no day-of-show distinction)
      const promoWebFee = promo.webFee ?? 0
      dSVCDiff = promoWebFee - baseClubFee
    }

    promoServiceChargeDiff = iPromoParty * dSVCDiff
  }

  // Desktop: tixPaid = iPromoParty - tixComp - tixDisc  (not promoParty)
  let tixPaid = iPromoParty - tixComp - tixDisc
  if (tixPaid < 0) tixPaid = 0

  return {
    discount,
    promoParty,
    tixPaid,
    tixComp,
    tixDisc,
    promoTix,
    promoServiceChargeDiff
  }
}
