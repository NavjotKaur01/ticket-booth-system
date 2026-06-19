import type {
  ReservationSearchFilters,
  ReservationSearchResult,
} from "@/types/search-reservation"

function matches(value: string, query: string) {
  return value.toLowerCase().includes(query.trim().toLowerCase())
}

function hasCustomerFilters(filters: ReservationSearchFilters) {
  return [
    filters.lastName,
    filters.firstName,
    filters.phoneArea,
    filters.phonePrefix,
    filters.phoneLine,
    filters.since,
  ].some((value) => value.trim())
}

export function filterReservationSearchResults(
  rows: ReservationSearchResult[],
  filters: ReservationSearchFilters,
  searched: boolean
): ReservationSearchResult[] {
  if (!searched) return []

  switch (filters.option) {
    case "confirmation-number":
      if (!filters.confirmationNumber.trim()) return []
      return rows.filter((row) =>
        matches(row.id, filters.confirmationNumber)
      )

    case "customer":
      if (!hasCustomerFilters(filters)) return []
      return rows.filter((row) => {
        if (filters.lastName && !matches(row.lastName, filters.lastName)) {
          return false
        }
        if (filters.firstName && !matches(row.firstName, filters.firstName)) {
          return false
        }
        if (filters.phoneArea && !matches(row.phone, filters.phoneArea)) {
          return false
        }
        if (filters.phonePrefix && !matches(row.phone, filters.phonePrefix)) {
          return false
        }
        if (filters.phoneLine && !matches(row.phone, filters.phoneLine)) {
          return false
        }
        return true
      })

    case "comedian":
      if (!filters.comedian.trim()) return []
      return rows.filter((row) => matches(row.comedian, filters.comedian))

    case "date":
      if (!filters.showDate.trim()) return []
      return rows.filter((row) => matches(row.showDate, filters.showDate))

    case "payment":
      if (!filters.paymentReference.trim()) return []
      return rows.filter((row) =>
        matches(row.total, filters.paymentReference)
      )

    default:
      return []
  }
}
