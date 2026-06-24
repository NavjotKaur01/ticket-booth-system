import dayjs from "dayjs"

import type { CalendarEvent } from "@/types/calendar-event"

export type MoveShowDialogData = {
  eventId: string
  showId: string
  moveDate: string
  showTime: string
  arrivalTime: string
}

export type MoveShowFormValues = {
  moveDate: string
  showTime: string
  arrivalTime: string
}

function formatCalendarTime(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
    .format(date)
    .toLowerCase()
}

function parseEventTime(time: string) {
  const normalized = time.replace(/\s+/g, "").toUpperCase()
  const match = normalized.match(/^(\d{1,2}):(\d{2})(AM|PM)$/)

  if (!match) {
    return time.toLowerCase()
  }

  const hour = Number(match[1])
  const minute = match[2]
  const period = match[3].toLowerCase()

  return `${hour}:${minute} ${period}`
}

function parseTimeValue(value: string) {
  const match = value.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/i)

  if (!match) {
    return { hour: 19, minute: 0 }
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

function formatTimeValue(hour: number, minute: number) {
  const normalizedHour = ((hour % 24) + 24) % 24
  const period = normalizedHour >= 12 ? "pm" : "am"
  const displayHour = normalizedHour % 12 || 12

  return `${displayHour}:${minute.toString().padStart(2, "0")} ${period}`
}

function getArrivalTime(showTime: string) {
  const { hour, minute } = parseTimeValue(showTime)
  return formatTimeValue(hour - 1, minute)
}

export function createMoveShowFormValues(data: MoveShowDialogData): MoveShowFormValues {
  return {
    moveDate: data.moveDate,
    showTime: data.showTime,
    arrivalTime: data.arrivalTime,
  }
}

export async function getMoveShowDialogData(
  event: CalendarEvent
): Promise<MoveShowDialogData> {
  await new Promise((resolve) => window.setTimeout(resolve, 150))

  const showTime = event.time ? parseEventTime(event.time) : formatCalendarTime(event.start)

  return {
    eventId: event.id,
    showId: event.showId,
    moveDate: "",
    showTime,
    arrivalTime: getArrivalTime(showTime),
  }
}

export async function moveShow(
  eventId: string,
  values: MoveShowFormValues
): Promise<void> {
  await new Promise((resolve) => window.setTimeout(resolve, 200))

  void eventId
  void dayjs(values.moveDate).format("YYYY-MM-DD")
  void values.showTime
  void values.arrivalTime
}
