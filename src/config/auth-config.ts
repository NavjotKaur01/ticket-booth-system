export const authConfig = {
  defaultConnectionString: "Standupmedia",
  userDataCookieName: "user_data",
  locationsCookieName: "locations",
  /** Cleared on logout / migration. */
  legacyUserDataCookieName: "clubman_user_credentials",
  legacyCredentialsStorageKey: "clubman_user_credentials",
  credentialsCookieMaxAgeDays: 7,
} as const
