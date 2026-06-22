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
