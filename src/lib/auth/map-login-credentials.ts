import { createEmptyGuid } from "@/lib/auth/credentials-storage"
import type { ApiUserCredentials } from "@/types/api/account-login"
import type { AppLocation } from "@/types/api/locations"
import type { UserCredentials } from "@/types/auth"

type LoginFallback = {
  connectionString: string
  userName: string
  location: AppLocation
}

function normalizeText(value: string | null | undefined) {
  if (!value) {
    return ""
  }

  return value.replace(/\s+/g, " ").trim()
}

function isLoginDataObject(value: unknown): value is ApiUserCredentials {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false
  }

  const record = value as ApiUserCredentials
  return Boolean(normalizeText(record.UserID) || normalizeText(record.UserName))
}

export function assertLoginResponseData(data: unknown): ApiUserCredentials {
  if (!isLoginDataObject(data)) {
    throw new Error(
      "Login failed. The server did not return user credentials."
    )
  }

  return data
}

export function mapLoginResponseToCredentials(
  data: ApiUserCredentials,
  fallback: LoginFallback
): UserCredentials {
  const { connectionString, userName, location } = fallback
  const locationId = normalizeText(data.LocationID) || location.id

  return {
    UserID: normalizeText(data.UserID) || createEmptyGuid(),
    UserLocationId: locationId,
    UserSavedLocationId: locationId,
    LocationID: locationId,
    UserName: normalizeText(data.UserName) || userName,
    FirstName: normalizeText(data.FirstName),
    LastName: normalizeText(data.LastName),
    UserRights: normalizeText(data.UserRights),
    Email: normalizeText(data.Email),
    LocationName: location.shortName || location.label,
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
