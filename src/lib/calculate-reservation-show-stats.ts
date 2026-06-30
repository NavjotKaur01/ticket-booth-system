import type { ShowSectionItem } from "@/types/api/show-sections"
import type { Reservation, ReservationCounts } from "@/types/reservation"

function sumSectionField(
  sections: ShowSectionItem[],
  field: keyof Pick<
    ShowSectionItem,
    "ShowSeats" | "ShowSectionAvialiableSeats" | "ShowSectionReservedSeats"
  >
) {
  return sections.reduce((total, section) => total + (section[field] ?? 0), 0)
}

function sumReservationField(
  reservations: Pick<Reservation, "qty" | "seated" | "scanner">[],
  field: "qty" | "seated" | "scanner"
) {
  return reservations.reduce((total, reservation) => total + reservation[field], 0)
}

/** Desktop booth counts: section totals from API, seated/scanned from reservation rows. */
export function calculateReservationShowStats(
  sections: ShowSectionItem[],
  reservations: Pick<Reservation, "qty" | "seated" | "scanner">[]
): ReservationCounts {
  const seats = sumSectionField(sections, "ShowSeats")
  const available = sumSectionField(sections, "ShowSectionAvialiableSeats")
  const reservedFromSections = sumSectionField(
    sections,
    "ShowSectionReservedSeats"
  )
  const reserved =
    sections.length > 0
      ? reservedFromSections
      : sumReservationField(reservations, "qty")

  return {
    seats,
    reservation: reserved,
    available:
      sections.length > 0 ? available : Math.max(0, seats - reserved),
    seated: sumReservationField(reservations, "seated"),
    scanned: sumReservationField(reservations, "scanner"),
  }
}
