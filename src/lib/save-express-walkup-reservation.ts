import { createNewReservation } from "@/lib/api/reservations"
import { buildSaveReservationWithPaymentRequest } from "@/lib/build-save-reservation-request"
import {
  calculateReservationTotals,
  parseReservationMoney,
} from "@/lib/calculate-reservation-totals"
import { calculateExpressWalkupServiceCharge } from "@/features/check-in/service/express-panel.service"
import { EXPRESS_WALKUP_CUSTOMER_ID } from "@/lib/express-walkup-customer"
import { EMPTY_RESERVATION_CUSTOMER_SEARCH_CRITERIA } from "@/lib/reservation-customer-search-criteria"
import { createEmptyReservationPaymentFields } from "@/types/reservation-payment"
import type { ReservationPaymentType } from "@/data/reservation-payment-options"
import type { ReservationPromo } from "@/types/reservation-promo"
import type { ReservationSectionOption } from "@/types/reservation"

type SaveExpressWalkupParams = {
  connectionName: string
  locationId: string
  userRights: string
  username: string
  section: ReservationSectionOption
  party: number
  passes: number
  promo: ReservationPromo | null
  paymentType: ReservationPaymentType
  /** Tendered amount — must be >= due; persisted amount is always Total (desktop). */
  paymentAmount: number
  cardType?: string
  dinner?: boolean
  /** Show-level VIP flag (GetShowData.VIP === "Y"). */
  isVip?: boolean
  notes?: string
  checkInAfterSave?: boolean
  showDate?: string
  taxRatePercent?: number
  taxWithServiceCharge?: string
}

/** Create a walk-up reservation with payment (express panel / express walkup). */
export async function saveExpressWalkupReservation({
  connectionName,
  locationId,
  userRights,
  username,
  section,
  party,
  passes,
  promo,
  paymentType,
  paymentAmount,
  cardType,
  dinner = false,
  isVip = false,
  notes = "",
  checkInAfterSave = false,
  showDate,
  taxRatePercent = 0,
  taxWithServiceCharge,
}: SaveExpressWalkupParams) {
  const baseSvcAmount = calculateExpressWalkupServiceCharge({
    walkUpFee: section.walkUpFee ?? 0,
    dayOfShowFee: section.dayOfShowFee ?? 0,
    quantity: party,
    showDate,
  })

  const totals = calculateReservationTotals({
    sectionPrice: section.showPrice || section.price,
    sectionShowPrice: section.showPrice,
    sectionPriceMultiplier: section.priceMultiplier,
    party,
    passes,
    promo,
    baseSvcAmount: party > 0 ? baseSvcAmount : undefined,
    systemTaxRate: taxRatePercent,
    taxWithServiceCharge,
  })

  if (paymentAmount + 0.001 < totals.total) {
    throw new Error(
      "Express Pay requires full payment when reservation is made.Amount of payment is less then the amount due.  Cannot continue."
    )
  }

  const paymentFields = createEmptyReservationPaymentFields()
  if (cardType?.trim()) {
    paymentFields.cardType = cardType.trim()
  }

  const request = buildSaveReservationWithPaymentRequest({
    connectionName,
    locationId,
    userRights,
    lastUpdateId: username,
    searchType: "customer",
    customerId: EXPRESS_WALKUP_CUSTOMER_ID,
    searchCriteria: {
      ...EMPTY_RESERVATION_CUSTOMER_SEARCH_CRITERIA,
      lastName: "ZzzExpress",
      firstName: "ZzzCustomer",
    },
    selectedSection: section,
    origin: "walkup",
    party,
    passes,
    promo,
    totals,
    notes,
    dinner,
    isVip,
    isReservationCheckedIn: checkInAfterSave,
    // Desktop SaveSalesTransaction / SavePOSTypePayment: PaymentAmount = Total.
    paymentAmount: totals.total,
    paymentType,
    paymentFields,
  })

  const ids = await createNewReservation(request)
  return { reservationIds: ids, totals }
}

export function parseExpressMoney(value: string) {
  return parseReservationMoney(value)
}
