import type { UserCredentials } from "@/types/auth"
import type { AppLocation } from "@/types/api/locations"

export function applyLocationToCredentials(
  credentials: UserCredentials,
  location: AppLocation
): UserCredentials {
  return {
    ...credentials,
    UserLocationId: location.id,
    UserSavedLocationId: location.id,
    LocationID: location.id,
    LocationName: location.shortName || location.label,
    DBName: location.dbName || credentials.DBName,
    ClubCityName: location.city,
  }
}
