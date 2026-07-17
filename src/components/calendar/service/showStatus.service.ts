import dayjs from "dayjs"

import type { MarkShowUnavailableOnWebRequest } from "@/types/api/show-status"

export function buildMarkShowUnavailableOnWebRequest(params: {
  connectionString: string
  calendarShowId: string
  username: string
  now?: Date
}): MarkShowUnavailableOnWebRequest {
  return {
    ConnectionString: params.connectionString,
    CalendarShowId: params.calendarShowId,
    LastUpdateDt: dayjs(params.now ?? new Date()).format("YYYY-MM-DDTHH:mm:ss"),
    LastUpdateID: params.username.trim(),
  }
}
