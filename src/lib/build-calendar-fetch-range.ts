import { formatUsDateTime } from "@/lib/format-us-datetime"

/**
 * Mirrors desktop `BuildCalander` + `GetCalenderRecords`:
 * month boundaries with one month padding on each side.
 */
export function buildCalendarFetchRange(calendarDate: Date) {
  const year = calendarDate.getFullYear()
  const month = calendarDate.getMonth()

  const showFromDate = new Date(year, month, 1, 0, 0, 0, 0)
  const lastDay = new Date(year, month + 1, 0).getDate()
  const showToDate = new Date(year, month, lastDay, 0, 0, 0, 0)

  const fetchStart = new Date(showFromDate)
  fetchStart.setMonth(fetchStart.getMonth() - 1)

  const fetchEnd = new Date(showToDate)
  fetchEnd.setMonth(fetchEnd.getMonth() + 1)

  return {
    startDate: formatUsDateTime(fetchStart),
    endDate: formatUsDateTime(fetchEnd),
  }
}
