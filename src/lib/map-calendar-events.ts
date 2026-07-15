import type { ApiCalendarModel } from "@/types/api/calendar-data"
import type { CalendarEvent } from "@/types/calendar-event"
import { parseApiDate } from "@/lib/parse-api-date"

function formatHeadlinerName(value: string | null) {
  if (!value?.trim()) {
    return ""
  }

  const trimmed = value.trim()
  if (!trimmed.includes(",")) {
    return trimmed
  }

  const [lastName, firstName] = trimmed.split(",").map((part) => part.trim())
  if (!firstName) {
    return lastName
  }

  return `${lastName}, ${firstName}`
}

function formatShowTime(date: Date) {
  return date.toLocaleString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}

function isCancelledShow(item: ApiCalendarModel) {
  const active = item.IsActive

  if (typeof active === "boolean") {
    return !active
  }

  if (typeof active === "string") {
    return active.trim().toUpperCase() !== "Y"
  }

  return false
}

function resolveShowStart(item: ApiCalendarModel) {
  return (
    parseApiDate(item.ShowTim) ??
    parseApiDate(item.ShowTime ?? null) ??
    parseApiDate(item.ShowDate) ??
    new Date()
  )
}

export function mapCalendarModelToEvent(
  item: ApiCalendarModel,
  locationLabel: string
): CalendarEvent {
  const start = resolveShowStart(item)
  const end = new Date(start.getTime() + 90 * 60 * 1000)

  return {
    id: item.ShowId,
    showId: item.ShowId,
    comicId: item.ComicId ?? "",
    title: item.Headliner?.trim() ?? "Show",
    performer: formatHeadlinerName(item.Headliner),
    start,
    end,
    seats: {
      sold: item.BookedCount ?? 0,
      comp: item.DinnerCount ?? 0,
      capacity: item.SeatsCount ?? 0,
    },
    time: formatShowTime(start),
    status: item.ShowDinner === 'Y' ? 'd' : '',
    cancelled: isCancelledShow(item),
    location: locationLabel,
    rowColor: item.RowColor,
    buttonColor: item.ButtionForColor,
  }
}

export function mapCalendarModelsToEvents(
  items: ApiCalendarModel[],
  locationLabel: string
): CalendarEvent[] {
  return items
    .map((item) => mapCalendarModelToEvent(item, locationLabel))
    .sort((left, right) => left.start.getTime() - right.start.getTime())
}
