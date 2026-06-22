import { apiRequest, clubApiPath } from "@/lib/api/client"
import type { ApiLocation, AppLocation } from "@/types/api/locations"

function normalizeText(value: string | null | undefined) {
  if (!value) {
    return ""
  }

  return value.replace(/\s+/g, " ").trim()
}

export function getLocationDisplayName(location: Pick<ApiLocation, "LocSName" | "LocName" | "LocationID">) {
  return (
    normalizeText(location.LocSName) ||
    normalizeText(location.LocName) ||
    location.LocationID
  )
}

export function mapLocation(location: ApiLocation): AppLocation {
  const shortName = normalizeText(location.LocSName)
  const name = normalizeText(location.LocName)
  const label = shortName || name || location.LocationID

  return {
    id: location.LocationID,
    label,
    name,
    shortName,
    dbName: normalizeText(location.DBName),
    city: normalizeText(location.LocCity),
  }
}

export function fetchLocations(clubSlug: string) {
  return apiRequest<ApiLocation[]>(clubApiPath(clubSlug, "locations")).then(
    (locations) => locations.map(mapLocation)
  )
}

export function getLocationLabel(locationId: string, locations: AppLocation[]) {
  const normalizedId = locationId.toLowerCase()
  return (
    locations.find((location) => location.id.toLowerCase() === normalizedId)
      ?.label ?? locationId
  )
}

export function findLocationById(locationId: string, locations: AppLocation[]) {
  const normalizedId = locationId.toLowerCase()
  return locations.find((location) => location.id.toLowerCase() === normalizedId)
}
