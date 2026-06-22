import { dispatchEndpoint } from "@/lib/api/dispatch-endpoint"
import { clubmanApi } from "@/store/api/clubmanApi"
import type { AppLocation } from "@/types/api/locations"

export {
  findLocationById,
  getLocationDisplayName,
  getLocationLabel,
  mapLocation,
} from "@/lib/map-location"

export function fetchLocations(clubSlug: string) {
  return dispatchEndpoint<AppLocation[], string>(
    clubmanApi.endpoints.getLocations,
    clubSlug
  )
}
