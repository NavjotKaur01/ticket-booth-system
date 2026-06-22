import { getStoredLocations } from "@/lib/auth/locations-storage"
import type { UserCredentials } from "@/types/auth"

/** Sync LocationID / LocSName from the locations cookie into session credentials. */
export function enrichCredentialsWithLocationCookie(
  credentials: UserCredentials
): UserCredentials {
  const clubSlug = credentials.ConnectionName.toLowerCase()
  const locations = getStoredLocations(clubSlug)
  const activeLocation = locations.find(
    (location) =>
      location.id.toLowerCase() ===
      (credentials.LocationID ?? "").toLowerCase()
  )

  if (!activeLocation) {
    return credentials
  }

  const locSName = activeLocation.shortName || activeLocation.label

  return {
    ...credentials,
    LocationID: activeLocation.id,
    UserLocationId: activeLocation.id,
    UserSavedLocationId: activeLocation.id,
    LocationName: locSName,
    DBName: activeLocation.dbName || credentials.DBName,
    ClubCityName: activeLocation.city || credentials.ClubCityName,
  }
}

export function findLocationByIdFromCookie(
  locationId: string,
  clubSlug: string
) {
  return getStoredLocations(clubSlug).find(
    (location) => location.id.toLowerCase() === locationId.toLowerCase()
  )
}
