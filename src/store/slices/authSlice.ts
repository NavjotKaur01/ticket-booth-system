import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit"

import { authConfig } from "@/config/auth-config"
import { applyLocationToCredentials } from "@/lib/auth/apply-location"
import {
  clearStoredCredentials,
  getStoredCredentials,
  getStoredLoginCookie,
  saveLoginSession,
} from "@/lib/auth/credentials-storage"
import { clearStoredLocations } from "@/lib/auth/locations-storage"
import { assertLoginResponseData } from "@/lib/auth/map-login-credentials"
import { enrichCredentialsWithLocationCookie } from "@/lib/auth/resolve-session-location"
import { findLocationById } from "@/lib/map-location"
import { clubmanApi } from "@/store/api/clubmanApi"
import type { AppLocation } from "@/types/api/locations"
import type { UserCredentials } from "@/types/auth"

type AuthState = {
  credentials: UserCredentials | null
  isLoading: boolean
}

const initialState: AuthState = {
  credentials: getStoredCredentials(),
  isLoading: false,
}

export const login = createAsyncThunk(
  "auth/login",
  async (
    { userName, userPwd }: { userName: string; userPwd: string },
    { dispatch }
  ) => {
    const trimmedUserName = userName.trim()
    const storedLogin = getStoredLoginCookie()
    const connectionString =
      storedLogin?.connectionName ?? authConfig.defaultConnectionString
    const clubSlug = connectionString.toLowerCase()

    if (!trimmedUserName || !userPwd) {
      throw new Error("Username and password are required.")
    }

    const locations = await dispatch(
      clubmanApi.endpoints.getLocations.initiate(clubSlug)
    ).unwrap()

    const preferredLocationId =
      storedLogin?.login.LocationID ?? getStoredCredentials()?.LocationID ?? ""

    const location =
      findLocationById(preferredLocationId, locations) ?? locations[0]

    if (!location) {
      throw new Error("No location is available for this club.")
    }

    const loginData = await dispatch(
      clubmanApi.endpoints.accountLogin.initiate({
        ConnectionString: connectionString,
        UserName: trimmedUserName,
        UserPwd: userPwd,
        LocationId: location.id,
      })
    ).unwrap()

    const apiCredentials = assertLoginResponseData(loginData)

    const resolvedLocation =
      findLocationById(apiCredentials.LocationID ?? "", locations) ?? location

    return enrichCredentialsWithLocationCookie(
      saveLoginSession(apiCredentials, {
        connectionString,
        location: resolvedLocation,
      })
    )
  }
)

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    switchLocation: (state, action: PayloadAction<AppLocation>) => {
      if (!state.credentials) {
        return
      }

      state.credentials = enrichCredentialsWithLocationCookie(
        applyLocationToCredentials(state.credentials, action.payload)
      )

      const stored = getStoredLoginCookie()
      if (stored) {
        saveLoginSession(
          {
            ...stored.login,
            LocationID: action.payload.id,
          },
          {
            connectionString: stored.connectionName,
            location: action.payload,
          }
        )
        state.credentials = enrichCredentialsWithLocationCookie(
          state.credentials
        )
      }
    },
    logout: (state) => {
      state.credentials = null
      clearStoredCredentials()
      clearStoredLocations()
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true
      })
      .addCase(login.fulfilled, (state, action) => {
        state.credentials = enrichCredentialsWithLocationCookie(action.payload)
        state.isLoading = false
      })
      .addCase(login.rejected, (state) => {
        state.isLoading = false
      })
  },
})

export const { switchLocation, logout } = authSlice.actions
export const authReducer = authSlice.reducer
