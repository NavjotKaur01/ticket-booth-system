import type { CalendarEvent } from "@/types/calendar-event"

export const ADJUST_PROMO_ACCESS_DENIED_MESSAGE =
  "This user does not have access to this area. Please have club manager change access if appropriate."

export type AdjustPromoDialogData = {
  eventId: string
  hasAccess: boolean
  message: string
}

export async function getAdjustPromoDialogData(
  event: CalendarEvent,
  username = ""
): Promise<AdjustPromoDialogData> {
  await new Promise((resolve) => window.setTimeout(resolve, 100))

  void username

  return {
    eventId: event.id,
    hasAccess: false,
    message: ADJUST_PROMO_ACCESS_DENIED_MESSAGE,
  }
}
