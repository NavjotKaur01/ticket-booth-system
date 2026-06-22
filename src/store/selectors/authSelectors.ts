import { createSelector } from "@reduxjs/toolkit"

import { mapCredentialsToUserSession } from "@/lib/auth/map-user-session"
import type { RootState } from "@/store"

const selectAuthState = (state: RootState) => state.auth

export const selectCredentials = createSelector(
  selectAuthState,
  (auth) => auth.credentials
)

export const selectIsAuthLoading = createSelector(
  selectAuthState,
  (auth) => auth.isLoading
)

export const selectUserSession = createSelector(selectCredentials, (credentials) =>
  credentials ? mapCredentialsToUserSession(credentials) : null
)

export const selectIsAuthenticated = createSelector(
  selectCredentials,
  (credentials) => Boolean(credentials)
)

export const selectLocationId = createSelector(
  selectCredentials,
  (credentials) => credentials?.LocationID ?? ""
)

export const selectLocationName = createSelector(
  selectCredentials,
  (credentials) => credentials?.LocationName ?? ""
)

export const selectConnectionName = createSelector(
  selectCredentials,
  (credentials) => credentials?.ConnectionName ?? ""
)

export const selectClubSlug = createSelector(selectConnectionName, (connectionName) =>
  connectionName.toLowerCase()
)

export const selectIsSessionReady = createSelector(
  selectCredentials,
  (credentials) =>
    Boolean(
      credentials?.LocationID &&
        credentials.ConnectionName &&
        credentials.UserName
    )
)
