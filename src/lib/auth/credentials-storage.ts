import { authConfig } from "@/config/auth-config"
import {
  clearLegacyAuthCookies,
  deleteCookie,
  getCookie,
  setCookie,
} from "@/lib/auth/cookie-utils"
import { mapLoginResponseToCredentials } from "@/lib/auth/map-login-credentials"
import { enrichCredentialsWithLocationCookie } from "@/lib/auth/resolve-session-location"
import {
  LOGIN_SESSION_KEYS,
  toSlimLoginCredentials,
  type ApiUserCredentials,
  type StoredLoginCookie,
} from "@/types/api/account-login"
import type { AppLocation } from "@/types/api/locations"
import type { UserCredentials } from "@/types/auth"

export { toSlimLoginCredentials }

const LOGIN_SESSION_KEY_SET = new Set<string>(LOGIN_SESSION_KEYS)

/** True when cookie login object still has keys outside the web session contract. */
function loginHasSensitiveFields(login: ApiUserCredentials) {
  return Object.keys(login as Record<string, unknown>).some(
    (key) => !LOGIN_SESSION_KEY_SET.has(key)
  )
}

function isStoredLoginCookie(value: unknown): value is StoredLoginCookie {
  if (!value || typeof value !== "object") {
    return false
  }

  const record = value as StoredLoginCookie
  return (
    typeof record.login === "object" &&
    record.login !== null &&
    typeof record.connectionName === "string" &&
    typeof (record.login as ApiUserCredentials).UserName === "string"
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

function readCookieByNames(names: string[]): string | null {
  for (const name of names) {
    const value = getCookie(name)
    if (value) {
      return value
    }
  }

  return null
}

function cookiePayloadToCredentials(payload: StoredLoginCookie): UserCredentials {
  const location: AppLocation = {
    id: payload.login.LocationID ?? "",
    label: payload.locationShortName || payload.locationName,
    name: payload.locationName,
    shortName: payload.locationShortName || payload.locationName,
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

function migrateLegacyUserCookie(raw: string): StoredLoginCookie | null {
  try {
    const parsed: unknown = JSON.parse(raw)
    if (isStoredLoginCookie(parsed)) {
      return {
        ...parsed,
        login: toSlimLoginCredentials(parsed.login),
      }
    }

    if (isLegacyUserCredentials(parsed)) {
      return {
        login: toSlimLoginCredentials({
          UserID: parsed.UserID,
          LocationID: parsed.LocationID ?? undefined,
          UserName: parsed.UserName,
          FirstName: parsed.FirstName,
          LastName: parsed.LastName,
          UserRights: parsed.UserRights,
          Email: parsed.Email,
        }),
        connectionName: parsed.ConnectionName,
        locationName: parsed.LocationName,
        locationShortName: parsed.LocationName,
        locationDbName: parsed.DBName,
        locationCity: parsed.ClubCityName,
      }
    }
  } catch {
    return null
  }

  return null
}

function persistStoredLoginCookie(payload: StoredLoginCookie) {
  const slimPayload: StoredLoginCookie = {
    ...payload,
    login: toSlimLoginCredentials(payload.login),
  }
  setCookie(authConfig.userDataCookieName, JSON.stringify(slimPayload))
  deleteCookie(authConfig.legacyUserDataCookieName)
  clearLegacyAuthCookies()
  return slimPayload
}

export function getStoredLoginCookie(): StoredLoginCookie | null {
  const raw = readCookieByNames([
    authConfig.userDataCookieName,
    authConfig.legacyUserDataCookieName,
  ])

  if (!raw) {
    return null
  }

  try {
    const parsed: unknown = JSON.parse(raw)
    if (isStoredLoginCookie(parsed)) {
      if (loginHasSensitiveFields(parsed.login)) {
        return persistStoredLoginCookie(parsed)
      }
      return {
        ...parsed,
        login: toSlimLoginCredentials(parsed.login),
      }
    }
  } catch {
    return migrateLegacyUserCookie(raw)
  }

  return migrateLegacyUserCookie(raw)
}

export function getStoredCredentials(): UserCredentials | null {
  const stored = getStoredLoginCookie()
  if (stored) {
    return enrichCredentialsWithLocationCookie(
      cookiePayloadToCredentials(stored)
    )
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
  const slimLogin = toSlimLoginCredentials(login)
  const credentials = mapLoginResponseToCredentials(slimLogin, {
    connectionString: context.connectionString,
    userName: slimLogin.UserName ?? "",
    location: context.location,
  })

  const payload: StoredLoginCookie = {
    login: slimLogin,
    connectionName: context.connectionString,
    locationName: context.location.name || context.location.label,
    locationShortName: context.location.shortName || context.location.label,
    locationDbName: context.location.dbName,
    locationCity: context.location.city,
  }

  setCookie(authConfig.userDataCookieName, JSON.stringify(payload))
  deleteCookie(authConfig.legacyUserDataCookieName)
  clearLegacyAuthCookies()

  if (!getCookie(authConfig.userDataCookieName)) {
    throw new Error("Failed to save login session to cookies.")
  }

  return credentials
}

export function clearStoredCredentials() {
  deleteCookie(authConfig.userDataCookieName)
  deleteCookie(authConfig.legacyUserDataCookieName)
  clearLegacyAuthCookies()
}

export function createEmptyGuid() {
  return "00000000-0000-0000-0000-000000000000"
}
