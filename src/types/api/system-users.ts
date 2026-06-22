export type ApiSystemUser = {
  UserID: string
  UserName: string
  LastName: string
  FirstName: string
  Email: string | null
  Password: string
  UserRight: string
  Active: string
  LocationID: string
  UserPos: string
  DateAdded: string
  StatusDt: string
  UpdateCount: number
  LastUpdateID: string
  LastUpdateDt: string
  SecurityQuestion: string | null
  SecurityAnswer: string | null
  LocationName: string
  Security: string
  PasswordForSystem: string
  PasswordForUser: string
}

export type SaveSystemUserRequest = {
  ConnectionName: string
  Email: string
  FirstName: string
  LastName: string
  LastUpdateDt: string
  LastUpdateId: string
  LocationID: string
  Password: string
  Security: string | null
  UserId: string
  UserName: string
  UserRight: string
  Active: string
}

export type UpdateSystemUserRequest = {
  ConnectionName: string
  LocationID: string
  LastUpdateID: string
  LastUpdateDt: string
  UserId: string
  UserName: string
  LastName: string
  FirstName: string
  Email: string
  Password: string
  UserRight: string
  Active: string
}
