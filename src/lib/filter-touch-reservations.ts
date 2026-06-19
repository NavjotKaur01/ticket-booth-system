import type { TouchFilters, TouchReservation } from "@/types/touch"

function matchesSearch(record: TouchReservation, query: string) {
  if (!query) return true
  const haystack = [
    record.lastName,
    record.firstName,
    record.source,
    record.tables,
    record.seatNo,
    record.createdBy,
  ]
    .join(" ")
    .toLowerCase()

  return haystack.includes(query.toLowerCase())
}

export function filterTouchReservations(
  records: TouchReservation[],
  showId: string,
  filters: TouchFilters
) {
  return records.filter((record) => {
    if (record.showId !== showId) return false
    if (record.cancelled && !filters.displayCancelled) return false
    if (record.checkedIn && !filters.displayCheckedIn) return false
    if (!matchesSearch(record, filters.searchQuery)) return false
    return true
  })
}
