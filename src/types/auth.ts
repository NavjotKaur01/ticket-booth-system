/** Mirrors ClubMan desktop UserCredentials stored after login. */
export type UserCredentials = {
  UserID: string
  UserLocationId: string | null
  UserSavedLocationId: string | null
  LocationID: string | null
  UserName: string
  FirstName: string
  LastName: string
  UserRights: string
  Email: string
  LocationName: string
  DBName: string
  TempID: string
  ConnectionType: number
  ConnectionName: string
  ShowDate: string
  DefaultSeatCount: number
  ShowId: string
  IsInActiveShow: boolean
  IsNeedToOpenTouchWindow: boolean
  ClubCityName: string
  IsStripeEnabled: boolean
}

export type LoginFormValues = {
  userName: string
  userPwd: string
}
