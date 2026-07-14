/** ClubMan UserAcessVM / GetUserPremissionData response item. */
export type ApiUserAccessItem = {
  PermID?: string
  LocationID?: string | null
  PermType?: string | null
  PermDesc?: string | null
  PermUserPos?: string | null
  PermAccess1?: string | null
  LastUpdateID?: string | null
  LastUpdateDt?: string | null
}

/**
 * Nested AccessbilityList item for SaveUserAccessbility.
 * Desktop only sends PermDesc + IsUserAccess + IsManagerAccess.
 */
export type UserAccessAccessibilityItem = {
  PermDesc: string
  IsUserAccess: boolean
  IsManagerAccess: boolean
}

/** ClubMan AdminstratorApi.SaveUserAccessbility body (API typo: Accessbility). */
export type UserAccessRequestModel = {
  ConnectionString: string
  LocationID: string
  LastUpdateID: string
  LastUpdateDt: string
  AccessbilityList: UserAccessAccessibilityItem[]
}
