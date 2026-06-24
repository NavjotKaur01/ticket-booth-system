import type { CalendarEvent } from "@/types/calendar-event"

export type ShowDetailHistoryRow = {
  id: string
  historyAction: string
  historyDate: string
  showSection: string
  showPrice: string
  seats: string
  showPromo: string
  active: string
  showAppearing: string
  assignSeats: string
  web: string
  lastUpdateId: string
  updatedOn: string
}

export type ShowDetailHistoryDialogData = {
  eventId: string
  records: ShowDetailHistoryRow[]
}

function formatHistoryDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
  }).format(date)
}

const UPDATED_ON = "6/24/2026 10:15:32 AM"

export async function getShowDetailHistoryDialogData(
  event: CalendarEvent
): Promise<ShowDetailHistoryDialogData> {
  await new Promise((resolve) => window.setTimeout(resolve, 150))

  const historyDate = formatHistoryDate(event.start)

  return {
    eventId: event.id,
    records: [
      {
        id: "inserted",
        historyAction: "INSERTED",
        historyDate,
        showSection: "Regular",
        showPrice: "10.00",
        seats: "0",
        showPromo: "",
        active: "Yes",
        showAppearing: "No",
        assignSeats: "No",
        web: "Yes",
        lastUpdateId: "admin",
        updatedOn: UPDATED_ON,
      },
      {
        id: "before-update",
        historyAction: "BEFORE UPDATE",
        historyDate,
        showSection: "Regular",
        showPrice: "10.00",
        seats: "0",
        showPromo: "",
        active: "Yes",
        showAppearing: "Yes",
        assignSeats: "No",
        web: "Yes",
        lastUpdateId: "admin",
        updatedOn: UPDATED_ON,
      },
      {
        id: "after-update",
        historyAction: "AFTER UPDATE",
        historyDate,
        showSection: "Regular",
        showPrice: "10.00",
        seats: "0",
        showPromo: "",
        active: "Yes",
        showAppearing: "No",
        assignSeats: "No",
        web: "No",
        lastUpdateId: "admin",
        updatedOn: UPDATED_ON,
      },
    ],
  }
}
