import { apiRequest, clubApiPath } from "@/lib/api/client"
import type { ApiLocation, AppLocation } from "@/types/api/locations"

function mapLocation(location: ApiLocation): AppLocation {
  const label =
    location.LocSName?.trim() ||
    location.LocName?.trim() ||
    location.LocationID

  return {
    id: location.LocationID,
    label,
  }
}

export function fetchLocations(clubSlug: string) {
  return apiRequest<ApiLocation[]>(clubApiPath(clubSlug, "locations")).then(
    (locations) => locations.map(mapLocation)
  )
}

export function getLocationLabel(
  locationId: string,
  locations: AppLocation[]
) {
  const normalizedId = locationId.toLowerCase()
  return (
    locations.find((location) => location.id.toLowerCase() === normalizedId)
      ?.label ?? locationId
  )
}
