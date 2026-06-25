import type { DateLocalizer, stringOrDate } from "react-big-calendar"

function startOfDay(date: Date) {
  const value = new Date(date)
  value.setHours(0, 0, 0, 0)
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

function getWeekStart(date: Date, localizer: DateLocalizer) {
  const firstDayOfWeek = localizer.startOfWeek("")
  return startOfDay(localizer.startOf(date, "week", firstDayOfWeek))
}

export function isCurrentWeek(
  date: Date,
  now: Date,
  localizer: DateLocalizer
) {
  return getWeekStart(date, localizer).getTime() === getWeekStart(now, localizer).getTime()
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

export function getStandardWeekRange(date: Date, localizer: DateLocalizer) {
  const firstDayOfWeek = localizer.startOfWeek("")
  const start = localizer.startOf(date, "week", firstDayOfWeek)
  const end = localizer.endOf(date, "week", firstDayOfWeek)

  return localizer.range(start, end, "day")
}

export function getCurrentWeekShiftedRange(
  now: Date,
  localizer: DateLocalizer
) {
  return buildSequentialDays(now, 7, localizer)
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
  return buildSequentialDays(now, standardVisibleDays.length, localizer)
}


