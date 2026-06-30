import { readStoredBoothSeatCount } from "@/lib/booth-seat-storage"
import type { ShowSectionItem } from "@/types/api/show-sections"

/** Desktop TotalSeatsCount: session override, system defaults, credentials, sections. */
export function resolveReservationTotalSeats(
  locationId: string,
  defaultSeatCount: number,
  systemDefaultSeatCount: number,
  showSections: ShowSectionItem[]
) {
  const storedSeatCount = readStoredBoothSeatCount(locationId)
  if (storedSeatCount > 0) {
    return storedSeatCount
  }

  if (systemDefaultSeatCount > 0) {
    return systemDefaultSeatCount
  }

  if (defaultSeatCount > 0) {
    return defaultSeatCount
  }

  return showSections.reduce(
    (total, section) => total + (section.ShowSeats ?? 0),
    0
  )
}
