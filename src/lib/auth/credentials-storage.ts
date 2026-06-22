import { authConfig } from "@/config/auth-config"
import { mapLoginResponseToCredentials } from "@/lib/auth/map-login-credentials"
import type {
  ApiUserCredentials,
  StoredLoginCookie,
} from "@/types/api/account-login"
import type { AppLocation } from "@/types/api/locations"
import type { UserCredentials } from "@/types/auth"

const EMPTY_GUID = "00000000-0000-0000-0000-000000000000"

function isStoredLoginCookie(value: unknown): value is StoredLoginCookie {
  if (!value || typeof value !== "object") {
    return false
  }

  const record = value as StoredLoginCookie
  return (
    typeof record.login === "object" &&
    record.login !== null &&
    typeof record.connectionName === "string"
  )
}

function isLegacyUserCredentials(value: unknown): value is UserCredentials {
  if (!value || typeof value !== "object") {
    return false
  }

  const record = value as Record<string, unknown>
  return (
    typeof record.UserName === "string" &&
    typeof record.ConnectionName === "string"
  )
}

function setCookie(name: string, value: string) {
  const maxAgeSeconds = authConfig.credentialsCookieMaxAgeDays * 24 * 60 * 60
  const encoded = encodeURIComponent(value)

  document.cookie = `${name}=${encoded}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`
}

function getCookie(name: string): string | null {
  const prefix = `${name}=`
  const cookies = document.cookie.split(";")

  for (const cookie of cookies) {
    const trimmed = cookie.trim()
    if (trimmed.startsWith(prefix)) {
      return decodeURIComponent(trimmed.slice(prefix.length))
    }
  }

  return null
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`
}

function clearLegacyLocalStorage() {
  localStorage.removeItem(authConfig.legacyCredentialsStorageKey)
}

function cookiePayloadToCredentials(payload: StoredLoginCookie): UserCredentials {
  const location: AppLocation = {
    id: payload.login.LocationID ?? "",
    label: payload.locationName,
    name: payload.locationName,
    shortName: payload.locationName,
    dbName: payload.locationDbName,
    city: payload.locationCity,
  }

  return mapLoginResponseToCredentials(payload.login, {
    connectionString: payload.connectionName,
    userName: payload.login.UserName ?? "",
    location,
  })
}

function readLegacyLocalStorage(): UserCredentials | null {
  const raw = localStorage.getItem(authConfig.legacyCredentialsStorageKey)
  if (!raw) {
    return null
  }

  try {
    const parsed: unknown = JSON.parse(raw)
    return isLegacyUserCredentials(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function getStoredLoginCookie(): StoredLoginCookie | null {
  const raw = getCookie(authConfig.credentialsCookieName)
  if (!raw) {
    return null
  }

  try {
    const parsed: unknown = JSON.parse(raw)
    return isStoredLoginCookie(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function getStoredCredentials(): UserCredentials | null {
  const stored = getStoredLoginCookie()
  if (stored) {
    return cookiePayloadToCredentials(stored)
  }

  const fromLegacy = readLegacyLocalStorage()
  if (!fromLegacy) {
    return null
  }

  saveLoginSession(
    {
      UserID: fromLegacy.UserID,
      LocationID: fromLegacy.LocationID ?? undefined,
      UserName: fromLegacy.UserName,
      FirstName: fromLegacy.FirstName,
      LastName: fromLegacy.LastName,
      UserRights: fromLegacy.UserRights,
      Email: fromLegacy.Email,
    },
    {
      connectionString: fromLegacy.ConnectionName,
      location: {
        id: fromLegacy.LocationID ?? "",
        label: fromLegacy.LocationName,
        name: fromLegacy.LocationName,
        shortName: fromLegacy.LocationName,
        dbName: fromLegacy.DBName,
        city: fromLegacy.ClubCityName,
      },
    }
  )

  return fromLegacy
}

export function saveLoginSession(
  login: ApiUserCredentials,
  context: {
    connectionString: string
    location: AppLocation
  }
): UserCredentials {
  const credentials = mapLoginResponseToCredentials(login, {
    connectionString: context.connectionString,
    userName: login.UserName ?? "",
    location: context.location,
  })

  const payload: StoredLoginCookie = {
    login,
    connectionName: context.connectionString,
    locationName: context.location.label,
    locationDbName: context.location.dbName,
    locationCity: context.location.city,
  }

  setCookie(authConfig.credentialsCookieName, JSON.stringify(payload))
  clearLegacyLocalStorage()

  if (!getCookie(authConfig.credentialsCookieName)) {
    throw new Error("Failed to save login session to cookies.")
  }

  return credentials
}

export function clearStoredCredentials() {
  deleteCookie(authConfig.credentialsCookieName)
  clearLegacyLocalStorage()
}

export function createEmptyGuid() {
  return EMPTY_GUID
}
