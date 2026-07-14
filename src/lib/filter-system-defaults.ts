import type { SystemDefault, SystemDefaultFilters } from "@/types/system-default"

export function filterSystemDefaults(
  records: SystemDefault[],
  filters: SystemDefaultFilters
) {
  const filtered = !filters.screen
    ? records
    : records.filter((record) => record.screen === filters.screen)

  return [...filtered].sort((a, b) => {
    const screenCompare = a.screen.localeCompare(b.screen)
    if (screenCompare !== 0) return screenCompare
    return a.field.localeCompare(b.field)
  })
}
