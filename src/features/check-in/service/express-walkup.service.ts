import {
  calculateExpressPanelTotalsFromSection,
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

/** Desktop walk-up totals: section price + WalkupCharge + promo. */
export function calculateExpressWalkupTotals({
  formValues,
  sections,
  promo,
}: {
  formValues: ExpressWalkupFormValues
  sections: ReservationSectionOption[]
  promo: ReservationPromo | null
}): ExpressWalkupTotals {
  const party = Math.max(0, Number(formValues.party) || 0)
  const section =
    sections.find((item) => item.id === formValues.sectionId) ?? sections[0]

  return calculateExpressPanelTotalsFromSection({
    sectionPrice: section?.showPrice ?? 0,
    walkUpFee: section?.walkUpFee ?? 0,
    quantity: party,
    promo,
  })
}
