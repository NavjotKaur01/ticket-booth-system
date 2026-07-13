import type { Performer, PerformerFilters } from "@/types/performer"

export function getComicName(performer: Performer) {
  return (
    performer.comicName ||
    performer.stageName ||
    `${performer.lastName}${performer.firstName ? `, ${performer.firstName}` : ""}`.trim()
  )
}

/**
 * Desktop relies on ComedianSearch API filtering.
 * Keep a light client pass-through for name fields only as a safety net.
 */
export function filterPerformers(
  rows: Performer[],
  filters: PerformerFilters
): Performer[] {
  const first = filters.firstName.trim().toLowerCase()
  const last = filters.lastName.trim().toLowerCase()
  const stage = filters.stageName.trim().toLowerCase()

  return rows.filter((row) => {
    if (!filters.showInactive && !row.active) return false
    if (first && !row.firstName.toLowerCase().includes(first)) return false
    if (last && !row.lastName.toLowerCase().includes(last)) return false
    if (stage && !row.stageName.toLowerCase().includes(stage)) return false
    return true
  })
}
