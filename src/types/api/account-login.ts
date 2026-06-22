import type { ApiResponse } from "@/types/api/common"

export type AccountLoginRequest = {
  ConnectionString: string
  UserName: string
  UserPwd: string
  LocationId: string
}

/** AccountLogin `Data` object returned by the ClubMan API. */
export type ApiUserCredentials = {
  UserID?: string
  LocationID?: string
  UserName?: string
  Passwd?: string
  FirstName?: string
  LastName?: string
  UserPos?: string
  UserRights?: string
  DateAdded?: string
  Active?: string
  StatusDt?: string
  UpdateCount?: number
  LastUpdateID?: string
  LastUpdateDt?: string
  SecurityQuestion?: string | null
  SecurityAnswer?: string | null
  Email?: string | null
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
