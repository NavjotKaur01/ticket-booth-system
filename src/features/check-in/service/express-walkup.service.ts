import {
  calculateExpressPanelTotalsFromSection,
  estimateExpressTicketUnitPrice,
  type ExpressPanelTotals,
} from "@/features/check-in/service/express-panel.service"
import type { ReservationPromo } from "@/types/reservation-promo"
import type {
  ReservationSectionOption,
  ShowOption,
} from "@/types/reservation"

export type ExpressWalkupFormValues = {
  showTimeId: string
  sectionId: string
  dinner: boolean
  party: string
  passes: string
  promoId: string
}

export type ExpressWalkupTotals = ExpressPanelTotals

export const EXPRESS_WALKUP_TICKET_COUNTS = Array.from(
  { length: 25 },
  (_, index) => index + 1
)

export function formatExpressWalkupShowDate(showDate: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${showDate}T00:00:00`))
}

export function buildExpressWalkupTitle(
  show: ShowOption | undefined,
  showDate: string
) {
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${showDate}T00:00:00`))

  const showLabel =
    show?.label ?? show?.headliner ?? "Express Walkup"

  return `Express Walkup :- ${showLabel} ${formattedDate}`
}

export function createExpressWalkupFormValues({
  showTimeId,
  sections,
}: {
  showTimeId: string
  sections: ReservationSectionOption[]
}): ExpressWalkupFormValues {
  return {
    showTimeId,
    sectionId: sections[0]?.id ?? "",
    dinner: false,
    party: "1",
    passes: "1",
    promoId: "none",
  }
}

/** Desktop walk-up totals: section price + WalkupCharge×party (+ day-of-show) + promo. */
export function calculateExpressWalkupTotals({
  formValues,
  sections,
  promo,
  showDate,
  taxRatePercent = 0,
  taxWithServiceCharge,
}: {
  formValues: ExpressWalkupFormValues
  sections: ReservationSectionOption[]
  promo: ReservationPromo | null
  showDate?: string
  taxRatePercent?: number
  taxWithServiceCharge?: string
}): ExpressWalkupTotals {
  const party = Math.max(0, Number(formValues.party) || 0)
  const passes = Math.max(0, Number(formValues.passes) || 0)
  const section =
    sections.find((item) => item.id === formValues.sectionId) ?? sections[0]

  return calculateExpressPanelTotalsFromSection({
    sectionPrice: section?.showPrice ?? 0,
    walkUpFee: section?.walkUpFee ?? 0,
    dayOfShowFee: section?.dayOfShowFee ?? 0,
    showDate,
    quantity: party,
    passes: passes || party,
    promo,
    taxRatePercent,
    taxWithServiceCharge,
  })
}

export function estimateExpressWalkupTicketUnitPrice({
  section,
  showDate,
  taxRatePercent = 0,
}: {
  section: ReservationSectionOption | null | undefined
  showDate?: string
  taxRatePercent?: number
}): number {
  if (!section) {
    return 0
  }

  return estimateExpressTicketUnitPrice({
    sectionPrice: section.showPrice ?? 0,
    walkUpFee: section.walkUpFee ?? 0,
    dayOfShowFee: section.dayOfShowFee ?? 0,
    showDate,
    taxRatePercent,
  })
}

/** Desktop: show date must not be prior to today. */
export function isExpressWalkupShowDateAllowed(showDate: string) {
  const show = new Date(`${showDate}T00:00:00`)
  if (Number.isNaN(show.getTime())) {
    return false
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return show.getTime() >= today.getTime()
}
