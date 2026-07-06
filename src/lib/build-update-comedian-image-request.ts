import type { ComedianImageRequestModel } from "@/types/api/comedian-info"
import { formatDateWithTimeUS } from "@/lib/date-display-format"

type BuildUpdateComedianImageRequestParams = {
  connectionName: string
  locationId: string
  username: string
  comicId?: string
  base64Image: string
}

export function buildUpdateComedianImageRequest({
  connectionName,
  locationId,
  username,
  comicId,
  base64Image,
}: BuildUpdateComedianImageRequestParams): ComedianImageRequestModel {
  return {
    ConnectionString: connectionName,
    LastUpdateID: username,
    LocationId: locationId,
    LastUpdateDt: formatDateWithTimeUS(new Date()),
    Image: base64Image,
    ...(comicId ? { ComicId: comicId } : {}),
  }
}
