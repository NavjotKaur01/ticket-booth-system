import type { ApiResponse } from "@/types/api/common"

export type AccountLoginRequest = {
  ConnectionString: string
  UserName: string
  UserPwd: string
  LocationId: string
}

/**
 * AccountLogin session fields the web app accepts.
 * Passwd / SecurityQuestion / SecurityAnswer are intentionally omitted
 * (BE-0.1) — even if an older API still sends them, we never type or store them.
 */
export type ApiUserCredentials = {
  UserID?: string
  LocationID?: string
  UserName?: string
  FirstName?: string
  LastName?: string
  UserRights?: string
  Email?: string | null
}

/** Keys allowed in the slim login cookie / in-memory session object. */
export const LOGIN_SESSION_KEYS = [
  "UserID",
  "LocationID",
  "UserName",
  "FirstName",
  "LastName",
  "UserRights",
  "Email",
] as const satisfies ReadonlyArray<keyof ApiUserCredentials>

/** Allowlist pick — drops Passwd / security Q&A / any other wire extras. */
export function toSlimLoginCredentials(
  login: ApiUserCredentials | Record<string, unknown>
): ApiUserCredentials {
  const source = login as Record<string, unknown>
  return {
    UserID: typeof source.UserID === "string" ? source.UserID : undefined,
    LocationID:
      typeof source.LocationID === "string" ? source.LocationID : undefined,
    UserName: typeof source.UserName === "string" ? source.UserName : undefined,
    FirstName:
      typeof source.FirstName === "string" ? source.FirstName : undefined,
    LastName: typeof source.LastName === "string" ? source.LastName : undefined,
    UserRights:
      typeof source.UserRights === "string" ? source.UserRights : undefined,
    Email:
      typeof source.Email === "string" || source.Email === null
        ? (source.Email as string | null)
        : null,
  }
}

export type AccountLoginResponse = ApiResponse<ApiUserCredentials | null>

export type StoredLoginCookie = {
  login: ApiUserCredentials
  connectionName: string
  locationName: string
  locationShortName?: string
  locationDbName: string
  locationCity: string
}
