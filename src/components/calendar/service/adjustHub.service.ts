import { events, type CalendarEvent } from "@/data/calendarEvents"

export type AdjustHubShowRow = {
  id: number
  showDate: string
  showTime: string
  comic: string
  isHub: boolean
}

export type AdjustHubDialogData = {
  eventId: number
  dateLabel: string
  shows: AdjustHubShowRow[]
}

export type AdjustHubFormValues = {
  hubByShowId: Record<number, boolean>
}

function formatDateLabel(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date)
}

function formatShowDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
  }).format(date)
}

function formatShowTime(time: string) {
  const normalized = time.replace(/\s+/g, "").toUpperCase()
  const match = normalized.match(/^(\d{1,2}):(\d{2})(AM|PM)$/)

  if (!match) {
    return time
  }

  const hour = Number(match[1])
  const minute = match[2]
  const period = match[3]

  return `${hour}:${minute} ${period}`
}

function formatComicName(performer: string) {
  const trimmed = performer.trim()

  if (!trimmed) {
    return ""
  }

  if (trimmed.includes(",")) {
    return trimmed
  }

  const parts = trimmed.split(/\s+/)

  if (parts.length < 2) {
    return trimmed
  }

  const lastName = parts.at(-1) ?? ""
  const firstName = parts.slice(0, -1).join(" ")

  return `${lastName}, ${firstName}`
}

function isSameCalendarDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  )
}

function getShowsForDate(event: CalendarEvent): AdjustHubShowRow[] {
  return events
    .filter(
      (calendarEvent) =>
        calendarEvent.location === event.location &&
        !calendarEvent.cancelled &&
        isSameCalendarDay(calendarEvent.start, event.start)
    )
    .sort((left, right) => left.start.getTime() - right.start.getTime())
    .map((calendarEvent) => ({
      id: calendarEvent.id,
      showDate: formatShowDate(calendarEvent.start),
      showTime: formatShowTime(calendarEvent.time),
      comic: formatComicName(calendarEvent.performer),
      isHub: calendarEvent.seats.capacity >= 200,
    }))
}

export function createAdjustHubFormValues(data: AdjustHubDialogData): AdjustHubFormValues {
  return {
    hubByShowId: Object.fromEntries(data.shows.map((show) => [show.id, show.isHub])),
  }
}

export function applyHubToggle(
  current: AdjustHubFormValues,
  showId: number,
  isHub: boolean
): AdjustHubFormValues {
  return {
    hubByShowId: {
      ...current.hubByShowId,
      [showId]: isHub,
    },
  }
}

export async function getAdjustHubDialogData(event: CalendarEvent): Promise<AdjustHubDialogData> {
  await new Promise((resolve) => window.setTimeout(resolve, 200))

  return {
    eventId: event.id,
    dateLabel: formatDateLabel(event.start),
    shows: getShowsForDate(event),
  }
}

export async function saveAdjustHubFormValues(
  eventId: number,
  values: AdjustHubFormValues
): Promise<void> {
  await new Promise((resolve) => window.setTimeout(resolve, 150))

  void eventId
  void values
}
