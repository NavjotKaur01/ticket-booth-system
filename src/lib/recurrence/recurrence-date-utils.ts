const WEEKDAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const

export type DayOfWeekName = (typeof WEEKDAY_NAMES)[number]

export function changeTime(date: Date, hours: number, minutes: number) {
  const value = new Date(date)
  value.setHours(hours, minutes, 0, 0)
  return value
}

export function getWeeksInMonth(
  month: Date,
  dayOfWeek: number,
  weekOfMonth: number
) {
  let firstOfMonth = new Date(month.getFullYear(), month.getMonth(), 1)

  if (firstOfMonth.getDay() === dayOfWeek) {
    if (weekOfMonth === 1) {
      return firstOfMonth
    }

    return new Date(firstOfMonth.getTime() + 7 * (weekOfMonth - 1) * 86400000)
  }

  while (firstOfMonth.getDay() !== dayOfWeek) {
    firstOfMonth = new Date(firstOfMonth.getTime() + 86400000)
  }

  if (weekOfMonth === 1) {
    return firstOfMonth
  }

  return new Date(firstOfMonth.getTime() + 7 * (weekOfMonth - 1) * 86400000)
}

export function getNextMonthDay(start: Date, day: number, monthRecurrence: number) {
  const afterMonthDate = new Date(start)
  afterMonthDate.setMonth(afterMonthDate.getMonth() + monthRecurrence)
  const result = new Date(afterMonthDate.getFullYear(), afterMonthDate.getMonth(), day)
  return changeTime(result, start.getHours(), start.getMinutes())
}

export function getNextMonthDayFromWeekDay(
  start: Date,
  weekNumOfMonth: number,
  dayOfWeek: number,
  occurrence: number
) {
  const monthOffset = occurrence === 0 ? 1 : occurrence
  const nextMonth = new Date(start)
  nextMonth.setMonth(nextMonth.getMonth() + monthOffset)
  return getWeeksInMonth(nextMonth, dayOfWeek, weekNumOfMonth)
}

export function getNextYearDay(start: Date, month: number, day: number, isFirst = false) {
  const afterYearDate =
    new Date().getMonth() + 1 < month && isFirst
      ? new Date(start.getFullYear(), start.getMonth() + (month - (new Date().getMonth() + 1)), day)
      : new Date(start.getFullYear() + 1, month - 1, day)

  return afterYearDate
}

export function getNextYearDayFromWeekDay(
  start: Date,
  weekNumOfMonth: number,
  dayOfWeek: number,
  month: number,
  isFirst = false
) {
  const nextYear =
    new Date().getMonth() + 1 < month && isFirst
      ? new Date(start.getFullYear(), start.getMonth() + (month - (new Date().getMonth() + 1)), 1)
      : new Date(start.getFullYear() + 1, month - 1, 1)

  return getWeeksInMonth(nextYear, dayOfWeek, weekNumOfMonth)
}

export function getNextWeekday(start: Date, dayOfWeek: number) {
  const daysToAdd = (dayOfWeek - start.getDay() + 7) % 7
  let result = new Date(start.getTime() + daysToAdd * 86400000)

  if (result.getTime() === start.getTime()) {
    result = new Date(result.getTime() + 7 * 86400000)
  }

  return result
}

export function ordinalToWeekNumber(value: string) {
  switch (value) {
    case "First":
      return 1
    case "Second":
      return 2
    case "Third":
      return 3
    case "Fourth":
      return 4
    default:
      return 5
  }
}

export function monthNameToNumber(value: string) {
  const index = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ].indexOf(value)

  return index >= 0 ? index + 1 : 1
}

export function weekdayNameToIndex(name: string) {
  const index = WEEKDAY_NAMES.findIndex(
    (day) => day.toLowerCase() === name.trim().toLowerCase()
  )
  return index >= 0 ? index : 0
}

export function weekdayIndexToName(index: number): DayOfWeekName {
  return WEEKDAY_NAMES[index] ?? "Sunday"
}

export function getStartOfDay(date: Date) {
  const value = new Date(date)
  value.setHours(0, 0, 0, 0)
  return value
}

export function getEndOfDay(date: Date) {
  const value = new Date(date)
  value.setHours(23, 59, 59, 999)
  return value
}

import { formatUsDateTime } from "@/lib/format-us-datetime"

export function toApiDateTime(date: Date) {
  return formatUsDateTime(date)
}
