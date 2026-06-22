export type AccountLoginRequest = {
  ConnectionString: string
  UserName: string
  UserPwd: string
  LocationId: string
}

export type AccountLoginResponse = {
  Status: boolean
  Message: string
  Data: null
}
