import type { ShowTimeFilters, ShowTimeRow } from "@/types/show-time"
import { formatShowTime } from "@/lib/format-show-time"

function matchesTime(value: string, query: string) {
  if (!query.trim()) return true
  return formatShowTime(value) === formatShowTime(query)
}

export function filterShowTimes(
  rows: ShowTimeRow[],
  filters: ShowTimeFilters
): ShowTimeRow[] {
  return rows.filter((row) => {
    if (filters.dayOfWeek !== "all" && row.dayOfWeek !== filters.dayOfWeek) {
      return false
    }
    if (!matchesTime(row.startTime, filters.showTime)) return false
    if (!matchesTime(row.arrivalTime, filters.arrivalTime)) return false
    return true
  })
}
