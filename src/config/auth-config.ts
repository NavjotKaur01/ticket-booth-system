export const authConfig = {
  defaultConnectionString: "Standupmedia",
  credentialsStorageKey: "clubman_user_credentials",
  /** Known valid login until AccountLogin API returns Status:false for bad credentials. */
  validLogin: {
    userName: "admin",
    userPwd: "123456",
  },
} as const
