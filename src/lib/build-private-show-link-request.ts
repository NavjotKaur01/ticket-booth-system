import { formatDesktopDateTime } from "@/lib/format-us-datetime"
import type { PrivateShowLinkRequestModel } from "@/types/api/private-show-link"
import type { PreSaleFormValues } from "@/types/pre-sale"

function combineDateAndTime(dateYmd: string, timeHHmm: string): Date {
  const [year, month, day] = dateYmd.split("-").map((part) =>
    Number.parseInt(part, 10)
  )
  const [hours, minutes] = timeHHmm.split(":").map((part) =>
    Number.parseInt(part, 10)
  )
  return new Date(
    year || 1970,
    (month || 1) - 1,
    day || 1,
    Number.isFinite(hours) ? hours : 0,
    Number.isFinite(minutes) ? minutes : 0,
    0
  )
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
  return {
    ConnectionString: connectionName,
    LocationId: locationId,
    CalendarShowId: form.showId,
    ComicId: form.comicId,
    PromoCode: form.accessCode.trim(),
    StartDate: formatDesktopDateTime(
      combineDateAndTime(form.startDate, form.startTime)
    ),
    EndDate: formatDesktopDateTime(
      combineDateAndTime(form.endDate, form.endTime)
    ),
    LastUpdateDt: formatDesktopDateTime(new Date()),
    LastUpdateID: lastUpdateId,
  }
}
