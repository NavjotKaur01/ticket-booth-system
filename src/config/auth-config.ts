export const authConfig = {
  defaultConnectionString: "Standupmedia",
  credentialsCookieName: "clubman_user_credentials",
  /** Legacy key — cleared on logout so old sessions do not linger. */
  legacyCredentialsStorageKey: "clubman_user_credentials",
  credentialsCookieMaxAgeDays: 7,
} as const
