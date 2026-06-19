import type { Customer, CustomerSearchFilters } from "@/types/customer"

function matches(value: string, query: string) {
  return value.toLowerCase().includes(query.trim().toLowerCase())
}

export function filterCustomers(
  rows: Customer[],
  filters: CustomerSearchFilters
): Customer[] {
  const hasFilters = Object.values(filters).some((value) => value.trim())
  if (!hasFilters) return rows

  return rows.filter((row) => {
    if (filters.lastName && !matches(row.lastName, filters.lastName)) return false
    if (filters.firstName && !matches(row.firstName, filters.firstName)) {
      return false
    }
    if (filters.email && !matches(row.email, filters.email)) return false
    if (filters.areaCode && !matches(row.phoneNo, filters.areaCode)) return false
    if (filters.phone1 && !matches(row.phoneNo, filters.phone1)) return false
    if (filters.phone2 && !matches(row.phoneNo, filters.phone2)) return false
    return true
  })
}
