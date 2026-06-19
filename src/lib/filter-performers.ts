import type { Performer, PerformerFilters } from "@/types/performer"

function matches(value: string, query: string) {
  if (!query.trim()) return true
  return value.toLowerCase().includes(query.trim().toLowerCase())
}

export function filterPerformers(
  rows: Performer[],
  filters: PerformerFilters
): Performer[] {
  return rows.filter((row) => {
    if (!filters.showInactive && !row.active) return false
    if (filters.locationId && row.locationId !== filters.locationId) return false
    if (!matches(row.firstName, filters.firstName)) return false
    if (!matches(row.lastName, filters.lastName)) return false
    if (!matches(row.stageName, filters.stageName)) return false
    return true
  })
}
