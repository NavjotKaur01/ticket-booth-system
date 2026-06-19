import type { SystemDefault, SystemDefaultFilters } from "@/types/system-default"

export function filterSystemDefaults(
  records: SystemDefault[],
  filters: SystemDefaultFilters
) {
  if (!filters.screen) return records
  return records.filter((record) => record.screen === filters.screen)
}
