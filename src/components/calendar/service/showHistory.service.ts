import type { CalendarEvent } from "@/types/calendar-event"

export type ShowHistoryRow = {
  id: string
  historyAction: string
  showDate: string
  showTime: string
  historyDate: string
  headliner: string
  headliner2: string
  feature: string
  feature2: string
  opener: string
  promoCode: string
  showDinner: string
  noPasses: string
  vip: string
  updatedOn: string
}

export type ShowHistoryDialogData = {
  eventId: string
  records: ShowHistoryRow[]
}

export async function getShowHistoryDialogData(
  event: CalendarEvent
): Promise<ShowHistoryDialogData> {
  await new Promise((resolve) => window.setTimeout(resolve, 150))

  return {
    eventId: event.id,
    records: [],
  }
}
