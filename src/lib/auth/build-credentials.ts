import { createEmptyGuid } from "@/lib/auth/credentials-storage"
import type { UserCredentials } from "@/types/auth"
import type { AppLocation } from "@/types/api/locations"

type BuildCredentialsParams = {
  connectionString: string
  userName: string
  location: AppLocation
}

export function buildCredentialsFromLogin({
  connectionString,
  userName,
  location,
}: BuildCredentialsParams): UserCredentials {
  return {
    UserID: createEmptyGuid(),
    UserLocationId: location.id,
    UserSavedLocationId: location.id,
    LocationID: location.id,
    UserName: userName,
    FirstName: "",
    LastName: "",
    UserRights: "",
    Email: "",
    LocationName: location.label,
    DBName: location.dbName || connectionString,
    TempID: crypto.randomUUID(),
    ConnectionType: 0,
    ConnectionName: connectionString,
    ShowDate: new Date().toISOString(),
    DefaultSeatCount: 0,
    ShowId: createEmptyGuid(),
    IsInActiveShow: false,
    IsNeedToOpenTouchWindow: false,
    ClubCityName: location.city,
    IsStripeEnabled: false,
  }
}
