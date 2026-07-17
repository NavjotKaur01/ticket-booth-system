import { formatDesktopDateTime } from "@/lib/format-us-datetime"
import type { PrivateShowLinkRequestModel } from "@/types/api/private-show-link"
import type { PreSaleFormValues } from "@/types/pre-sale"

function parseTimeParts(value: string) {
  const twelveHour = value
    .trim()
    .match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/i)
  if (twelveHour) {
    const rawHour = Number(twelveHour[1])
    const minute = Number(twelveHour[2] ?? 0)
    if (rawHour < 1 || rawHour > 12 || minute < 0 || minute > 59) {
      return null
    }

    let hour = rawHour % 12
    if (twelveHour[3].toLowerCase() === "pm") hour += 12
    return { hour, minute }
  }

  const twentyFourHour = value.trim().match(/^(\d{1,2}):(\d{2})$/)
  if (!twentyFourHour) return null

  const hour = Number(twentyFourHour[1])
  const minute = Number(twentyFourHour[2])
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null
  return { hour, minute }
}

export function combinePrivateShowDateAndTime(
  dateYmd: string,
  timeValue: string
): Date | null {
  const dateMatch = dateYmd.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  const time = parseTimeParts(timeValue)
  if (!dateMatch || !time) return null

  const year = Number(dateMatch[1])
  const month = Number(dateMatch[2])
  const day = Number(dateMatch[3])
  const date = new Date(year, month - 1, day, time.hour, time.minute, 0, 0)
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null
  }
  return date
}

export function buildGetPrivateShowLinksRequest(params: {
  connectionName: string
  locationId: string
}): PrivateShowLinkRequestModel {
  return {
    ConnectionString: params.connectionName,
    LocationId: params.locationId,
  }
}

export function buildDeletePrivateShowLinkRequest(params: {
  connectionName: string
  locationId: string
  privateKeyId: string
}): PrivateShowLinkRequestModel {
  return {
    ConnectionString: params.connectionName,
    LocationId: params.locationId,
    PrivateKeyID: params.privateKeyId,
  }
}

/** ClubMan ShowTimesVM.SavePrePrivateSetupLink request body. */
export function buildSavePrePrivateSetupLinkRequest(params: {
  connectionName: string
  locationId: string
  lastUpdateId: string
  form: PreSaleFormValues
}): PrivateShowLinkRequestModel {
  const { connectionName, locationId, lastUpdateId, form } = params
  const startDate = combinePrivateShowDateAndTime(
    form.startDate,
    form.startTime
  )
  const endDate = combinePrivateShowDateAndTime(form.endDate, form.endTime)
  if (!startDate || !endDate) {
    throw new Error("Enter valid start and end date/time values.")
  }

  return {
    ConnectionString: connectionName,
    LocationId: locationId,
    CalendarShowId: form.showId,
    ComicId: form.comicId,
    PromoCode: form.accessCode.trim(),
    StartDate: formatDesktopDateTime(startDate),
    EndDate: formatDesktopDateTime(endDate),
    LastUpdateDt: formatDesktopDateTime(new Date()),
    LastUpdateID: lastUpdateId,
  }
}
