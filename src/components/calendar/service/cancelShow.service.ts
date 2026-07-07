import type { CalendarEvent } from "@/data/calendarEvents"
import { formatDateForDisplay } from "@/lib/date-display-format"

export type CancelShowDialogData = {
  eventId: string
  showDate: string
  showTime: string
  comic: string
  reservationCount: number
}

function formatCancelShowDate(date: Date) {
  return `${formatDateForDisplay(date)} 00:00:00`
}

function formatCancelShowTime(time: string) {
  const normalized = time.replace(/\s+/g, "").toUpperCase()
  const match = normalized.match(/^(\d{1,2}):(\d{2})(AM|PM)$/)

  if (!match) {
    return time
  }

  return `${match[1]}:${match[2]}${match[3]}`
}

function getReservationCount(event: CalendarEvent) {
  return event.seats.sold + event.seats.comp
}

export async function getCancelShowDialogData(
  event: CalendarEvent
): Promise<CancelShowDialogData> {
  await new Promise((resolve) => window.setTimeout(resolve, 150))

  return {
    eventId: event.id,
    showDate: formatCancelShowDate(event.start),
    showTime: formatCancelShowTime(event.time),
    comic: event.performer,
    reservationCount: getReservationCount(event),
  }
}

export async function cancelShow(eventId: string): Promise<void> {
  await new Promise((resolve) => window.setTimeout(resolve, 200))

  void eventId
}

