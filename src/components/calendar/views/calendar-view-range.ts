import type { DateLocalizer, stringOrDate } from "react-big-calendar"

function startOfDay(date: Date) {
  const value = new Date(date)
  value.setHours(0, 0, 0, 0)
  return value
}

function startOfWeek(date: Date, localizer: DateLocalizer) {
  const value = startOfDay(date)
  const weekStartsOn = localizer.startOfWeek("")
  const dayOffset = (value.getDay() - weekStartsOn + 7) % 7
  value.setDate(value.getDate() - dayOffset)
  return value
}

export function toDate(value: stringOrDate) {
  return value instanceof Date ? value : new Date(value)
}

export function resolveNow(getNow?: () => stringOrDate | undefined) {
  const value = getNow?.()
  return startOfDay(value instanceof Date ? value : value ? new Date(value) : new Date())
}

export function isCurrentMonth(date: Date, now: Date) {
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth()
  )
}

export function buildSequentialDays(
  start: Date,
  count: number,
  localizer: DateLocalizer
) {
  const first = startOfDay(start)

  return Array.from({ length: count }, (_, index) =>
    localizer.startOf(localizer.add(first, index, "day"), "day")
  )
}

export function getStandardMonthVisibleDays(
  date: Date,
  localizer: DateLocalizer
) {
  return localizer.visibleDays(date, localizer)
}

export function getCurrentMonthShiftedVisibleDays(
  date: Date,
  localizer: DateLocalizer,
  now: Date
) {
  const standardVisibleDays = getStandardMonthVisibleDays(date, localizer)
  const weekStart = startOfWeek(now, localizer)
  return buildSequentialDays(weekStart, standardVisibleDays.length, localizer)
}



