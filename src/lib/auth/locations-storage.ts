import { authConfig } from "@/config/auth-config"
import { deleteCookie, getCookie, setCookie } from "@/lib/auth/cookie-utils"
import { mapLocation } from "@/lib/map-location"
import type { ApiLocation, AppLocation } from "@/types/api/locations"

export type StoredLocationsCookie = {
  clubSlug: string
  locations: ApiLocation[]
}

function isApiLocation(value: unknown): value is ApiLocation {
  if (!value || typeof value !== "object") {
    return false
  }

  const record = value as ApiLocation
  return typeof record.LocationID === "string"
}

function isStoredLocationsCookie(value: unknown): value is StoredLocationsCookie {
  if (!value || typeof value !== "object") {
    return false
  }

  const record = value as StoredLocationsCookie
  return (
    typeof record.clubSlug === "string" &&
    Array.isArray(record.locations) &&
    record.locations.every(isApiLocation)
  )
}

function isAppLocationArray(value: unknown): value is AppLocation[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        item &&
        typeof item === "object" &&
        typeof (item as AppLocation).id === "string"
    )
  )
}

function readLegacyLocationsCookie(): StoredLocationsCookie | null {
  const raw = getCookie(authConfig.locationsCookieName)
  if (!raw) {
    return null
  }

  try {
    const parsed: unknown = JSON.parse(raw)
    if (isStoredLocationsCookie(parsed)) {
      return parsed
    }

    if (isAppLocationArray(parsed)) {
      return {
        clubSlug: "",
        locations: parsed.map((location) => ({
          LocationID: location.id,
          LocName: location.name,
          LocSName: location.shortName,
          DBName: location.dbName,
          LocContact: null,
          LocAddr1: null,
          LocAddr2: null,
          LocCity: location.city,
          LocState: null,
          LocZip: null,
          LocZipExt: null,
          LocCountry: null,
          LocPhone: null,
          LocPhoneExt: null,
          LocPhoneText: null,
          LocEmail: null,
          Gateway: null,
          LicenseID: null,
          SiteID: null,
          DeviceID: null,
          SoftwareID: null,
          IsDeleted: null,
        })),
      }
    }
  } catch {
    return null
  }

  return null
}

export function getStoredLocationsCookie(
  clubSlug?: string
): StoredLocationsCookie | null {
  const stored = readLegacyLocationsCookie()
  if (!stored) {
    return null
  }

  if (clubSlug && stored.clubSlug && stored.clubSlug !== clubSlug) {
    return null
  }

  return stored
}

export function getStoredLocations(clubSlug?: string): AppLocation[] {
  const stored = getStoredLocationsCookie(clubSlug)
  if (!stored) {
    return []
  }

  return stored.locations.map(mapLocation)
}

export function saveLocations(clubSlug: string, locations: ApiLocation[]) {
  if (!clubSlug || locations.length === 0) {
    return
  }

  const payload: StoredLocationsCookie = {
    clubSlug,
    locations,
  }

  setCookie(authConfig.locationsCookieName, JSON.stringify(payload))
}

export function saveLocationsFromApp(clubSlug: string, locations: AppLocation[]) {
  saveLocations(
    clubSlug,
    locations.map((location) => ({
      LocationID: location.id,
      LocName: location.name,
      LocSName: location.shortName,
      DBName: location.dbName,
      LocContact: null,
      LocAddr1: null,
      LocAddr2: null,
      LocCity: location.city,
      LocState: null,
      LocZip: null,
      LocZipExt: null,
      LocCountry: null,
      LocPhone: null,
      LocPhoneExt: null,
      LocPhoneText: null,
      LocEmail: null,
      Gateway: null,
      LicenseID: null,
      SiteID: null,
      DeviceID: null,
      SoftwareID: null,
      IsDeleted: null,
    }))
  )
}

export function clearStoredLocations() {
  deleteCookie(authConfig.locationsCookieName)
}
