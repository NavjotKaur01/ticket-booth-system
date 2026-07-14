import { formatDesktopDateTime } from "@/lib/format-us-datetime"
import type { SystemDefaultRequestModel } from "@/types/api/system-defaults"

export function buildUpdateSystemDefaultRequest(params: {
  connectionName: string
  locationId: string
  lastUpdateId: string
  defaultId: string
  defaultValue: string
  description?: string
}): SystemDefaultRequestModel {
  return {
    Connection: params.connectionName,
    LocationId: params.locationId,
    DefaultID: params.defaultId,
    DefaultValue: params.defaultValue,
    Decription: params.description ?? "",
    LastUpdateID: params.lastUpdateId,
    LastUpdateDt: formatDesktopDateTime(new Date()),
  }
}
