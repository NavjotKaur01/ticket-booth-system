import type { ReservationCustomerSearchResult } from "@/data/reservation-search-results"
import type { ReservationPromo } from "@/types/reservation-promo"
import type { ReservationSectionOption } from "@/types/reservation"

/** Booking snapshot carried from Express Walkup into Payment Method branches. */
export type ExpressWalkupBookingPayload = {
  showTimeId: string
  section: ReservationSectionOption
  party: number
  passes: number
  promo: ReservationPromo | null
  dinner: boolean
  paymentDue: number
}

/** Seed for Add Reservation / Reservation Payment after Other or Express. */
export type ExpressWalkupPaymentSeed = {
  showTimeId: string
  sectionId: string
  party: number
  passes: number
  promoId: string
  dinner: boolean
  customer: {
    id: string
    lastName: string
    firstName: string
    email?: string
    phoneNo?: string
  }
  /** Desktop IsExpressRequest — auto check-in when fully paid. */
  isExpressRequest?: boolean
  lockOrigin?: boolean
}

export function buildExpressWalkupPaymentSeed({
  booking,
  customer,
  isExpressRequest = false,
}: {
  booking: ExpressWalkupBookingPayload
  customer: Pick<
    ReservationCustomerSearchResult,
    "id" | "lastName" | "firstName" | "email" | "phoneNo"
  >
  isExpressRequest?: boolean
}): ExpressWalkupPaymentSeed {
  return {
    showTimeId: booking.showTimeId,
    sectionId: booking.section.id,
    party: booking.party,
    passes: booking.passes,
    promoId: booking.promo?.id ?? "none",
    dinner: booking.dinner,
    customer: {
      id: customer.id,
      lastName: customer.lastName,
      firstName: customer.firstName,
      email: customer.email,
      phoneNo: customer.phoneNo,
    },
    isExpressRequest,
    lockOrigin: true,
  }
}
