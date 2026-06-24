import type { ComicInfo } from "@/data/comedian-info"
import type { CalendarEvent } from "@/data/calendarEvents"

export type EditComicDialogData = {
  eventId: string
  stageName: string
}

export async function getEditComicDialogData(
  event: CalendarEvent
): Promise<EditComicDialogData> {
  await new Promise((resolve) => window.setTimeout(resolve, 150))

  return {
    eventId: event.id,
    stageName: event.performer,
  }
}

export async function saveEditComicInfo(
  eventId: string,
  values: ComicInfo
): Promise<void> {
  await new Promise((resolve) => window.setTimeout(resolve, 200))

  void eventId
  void values
}

