import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import { authConfig } from "@/config/auth-config"
import { accountLogin } from "@/lib/api/auth"
import { fetchLocations } from "@/lib/api/locations"
import { buildCredentialsFromLogin } from "@/lib/auth/build-credentials"
import { applyLocationToCredentials } from "@/lib/auth/apply-location"
import {
  getInvalidLoginMessage,
  isValidLoginCredential,
} from "@/lib/auth/validate-login"
import {
  clearStoredCredentials,
  getStoredCredentials,
  saveCredentials,
} from "@/lib/auth/credentials-storage"
import { mapCredentialsToUserSession } from "@/lib/auth/map-user-session"
import type { UserCredentials } from "@/types/auth"
import type { AppLocation } from "@/types/api/locations"
import type { UserSession } from "@/types/dashboard"

type AuthContextValue = {
  credentials: UserCredentials | null
  session: UserSession | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (userName: string, userPwd: string) => Promise<void>
  switchLocation: (location: AppLocation) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [credentials, setCredentials] = useState<UserCredentials | null>(() =>
    getStoredCredentials()
  )
  const [isLoading, setIsLoading] = useState(false)

  const session = useMemo(
    () => (credentials ? mapCredentialsToUserSession(credentials) : null),
    [credentials]
  )

  const login = useCallback(async (userName: string, userPwd: string) => {
    const trimmedUserName = userName.trim()
    const connectionString = authConfig.defaultConnectionString
    const clubSlug = connectionString.toLowerCase()

    if (!trimmedUserName || !userPwd) {
      throw new Error("Username and password are required.")
    }

    if (!isValidLoginCredential(trimmedUserName, userPwd)) {
      throw new Error(getInvalidLoginMessage())
    }

    setIsLoading(true)

    try {
      const locations = await fetchLocations(clubSlug)
      const location = locations[0]

      if (!location) {
        throw new Error("No location is available for this club.")
      }

      await accountLogin({
        ConnectionString: connectionString,
        UserName: trimmedUserName,
        UserPwd: userPwd,
        LocationId: location.id,
      })

      const nextCredentials = buildCredentialsFromLogin({
        connectionString,
        userName: trimmedUserName,
        location,
      })

      saveCredentials(nextCredentials)
      setCredentials(nextCredentials)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const switchLocation = useCallback((location: AppLocation) => {
    setCredentials((current) => {
      if (!current) {
        return current
      }

      const nextCredentials = applyLocationToCredentials(current, location)
      saveCredentials(nextCredentials)
      return nextCredentials
    })
  }, [])

  const logout = useCallback(() => {
    clearStoredCredentials()
    setCredentials(null)
  }, [])

  const value = useMemo(
    () => ({
      credentials,
      session,
      isAuthenticated: Boolean(credentials),
      isLoading,
      login,
      switchLocation,
      logout,
    }),
    [credentials, session, isLoading, login, switchLocation, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }

  return context
}
