import type {
  CustomerLogin,
  CustomerLoginSearchFilters,
  CustomerLoginTableFilters,
} from "@/types/customer-login"

function matches(value: string, query: string) {
  if (!query.trim()) return true
  return value.toLowerCase().includes(query.trim().toLowerCase())
}

function matchesYn(filter: string, value: boolean) {
  if (!filter.trim()) return true

  const normalized = filter.trim().toUpperCase()
  const yn = value ? "Y" : "N"

  if (normalized === "Y" || normalized === "YES") return value
  if (normalized === "N" || normalized === "NO") return !value

  return yn.includes(normalized)
}

export function formatCustomerLoginYn(value: boolean) {
  return value ? "Y" : "N"
}

export function filterCustomerLogins(
  rows: CustomerLogin[],
  locationId: string,
  search: CustomerLoginSearchFilters,
  tableFilters: CustomerLoginTableFilters
): CustomerLogin[] {
  return rows.filter((row) => {
    if (locationId && row.locationId !== locationId) return false
    if (!matches(row.email, search.email)) return false
    if (!matches(row.firstName, search.firstName)) return false
    if (!matches(row.lastName, search.lastName)) return false
    if (!matches(row.id, tableFilters.customerId)) return false
    if (!matches(row.firstName, tableFilters.firstName)) return false
    if (!matches(row.lastName, tableFilters.lastName)) return false
    if (!matches(row.email, tableFilters.email)) return false
    if (!matchesYn(tableFilters.banned, row.banned)) return false
    if (!matchesYn(tableFilters.inactive, row.inactive)) return false
    if (!matchesYn(tableFilters.active, row.active)) return false
    return true
  })
}
