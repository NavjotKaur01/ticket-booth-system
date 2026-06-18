import type { Reservation } from "@/types/reservation"

/** Reservation fields included in the page search filter. */
const SEARCHABLE_FIELDS: (keyof Reservation)[] = [
  "firstName",
  "lastName",
  "email",
  "businessName",
  "source",
  "section",
]

/** Case-insensitive match against guest and booking metadata. */
export function filterReservations(
  rows: Reservation[],
  query: string
): Reservation[] {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return rows

  return rows.filter((row) =>
    SEARCHABLE_FIELDS.some((field) =>
      String(row[field]).toLowerCase().includes(normalized)
    )
  )
}
