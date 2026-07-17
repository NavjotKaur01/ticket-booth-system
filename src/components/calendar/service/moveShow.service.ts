import { formatShowTime } from "@/lib/format-show-time"
import { formatDesktopDateTime, parseToDate } from "@/lib/format-us-datetime"
import type {
  ApiMoveShowByIdItem,
  MoveShowToUpcomingDateRequest,
} from "@/types/api/move-show"

export type MoveShowFormValues = {
  moveDate: string
  showTime: string
  arrivalTime: string
}

function parseTimeValue(value: string) {
  const match = value.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/i)

  if (!match) {
    return null
  }

  const period = match[3].toLowerCase()
  const rawHour = Number(match[1])
  const minute = Math.min(59, Math.max(0, Number(match[2] ?? 0)))
  let hour = rawHour % 12

  if (period === "pm") {
    hour += 12
  }

  return { hour, minute }
}

/** Normalize API times to CalendarTimeControl format, e.g. "7:35 pm". */
function toCalendarTimeControlValue(value: string | null | undefined) {
  const formatted = formatShowTime(value, { seconds: false })
  if (!formatted) return ""

  const normalized = formatted.replace(/\s+/g, " ").trim()
  const match = normalized.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (!match) return normalized.toLowerCase()

  return `${Number(match[1])}:${match[2]} ${match[3].toLowerCase()}`
}

function parseDateInput(value: string): Date | null {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) return null

  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  return Number.isNaN(date.getTime()) ? null : date
}

function combineDateAndTime(dateValue: string, timeValue: string): Date | null {
  const date = parseDateInput(dateValue)
  const time = parseTimeValue(timeValue)
  if (!date || !time) return null

  date.setHours(time.hour, time.minute, 0, 0)
  return date
}

export function createMoveShowFormValues(
  show: ApiMoveShowByIdItem
): MoveShowFormValues {
  return {
    moveDate: "",
    showTime: toCalendarTimeControlValue(show.ShowTim),
    arrivalTime: toCalendarTimeControlValue(show.ShowArrival),
  }
}

export function isSameCalendarDay(
  moveDate: string,
  originalShowDate: string | Date
) {
  const destination = parseDateInput(moveDate)
  const original = parseToDate(originalShowDate)
  if (!destination || !original) return false

  return (
    destination.getFullYear() === original.getFullYear() &&
    destination.getMonth() === original.getMonth() &&
    destination.getDate() === original.getDate()
  )
}

export function buildMoveShowRequest(params: {
  connectionString: string
  locationId: string
  calendarShowId: string
  username: string
  values: MoveShowFormValues
  now?: Date
}): MoveShowToUpcomingDateRequest {
  const moveDate = parseDateInput(params.values.moveDate)
  const showTime = combineDateAndTime(
    params.values.moveDate,
    params.values.showTime
  )
  const arrivalTime = combineDateAndTime(
    params.values.moveDate,
    params.values.arrivalTime
  )

  if (!moveDate || !showTime || !arrivalTime) {
    throw new Error("Enter a valid move date, show time, and arrival time.")
  }

  return {
    ConnectionString: params.connectionString,
    LocationId: params.locationId,
    CalendarShowId: params.calendarShowId,
    MoveShowDate: formatDesktopDateTime(moveDate),
    MoveShowStartTime: formatDesktopDateTime(showTime),
    MoveShowArrival: formatDesktopDateTime(arrivalTime),
    LastUpdateDt: formatDesktopDateTime(params.now ?? new Date()),
    LastUpdateID: params.username.trim(),
  }
}
