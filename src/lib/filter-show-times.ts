import type { ShowTimeFilters, ShowTimeRow } from "@/types/show-time"
import { formatShowTime } from "@/lib/format-show-time"

function matches(value: string, query: string) {
  if (!query.trim()) return true
  return value.toLowerCase().includes(query.trim().toLowerCase())
}

export function filterShowTimes(
  rows: ShowTimeRow[],
  filters: ShowTimeFilters
): ShowTimeRow[] {
  return rows.filter((row) => {
    if (filters.dayOfWeek !== "all" && row.dayOfWeek !== filters.dayOfWeek) {
      return false
    }
    if (!matches(formatShowTime(row.startTime), filters.showTime)) return false
    if (!matches(formatShowTime(row.arrivalTime), filters.arrivalTime)) {
      return false
    }
    return true
  })
}
