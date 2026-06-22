import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react"

import { useAppDispatch, useAppSelector } from "@/store/hooks"
import {
  selectIsAuthLoading,
  selectIsAuthenticated,
  selectUserSession,
  selectCredentials,
} from "@/store/selectors/authSelectors"
import { login, logout, switchLocation as switchLocationAction } from "@/store/slices/authSlice"
import type { AppLocation } from "@/types/api/locations"
import type { UserCredentials } from "@/types/auth"
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
  const dispatch = useAppDispatch()
  const credentials = useAppSelector(selectCredentials)
  const session = useAppSelector(selectUserSession)
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const isLoading = useAppSelector(selectIsAuthLoading)

  const handleLogin = useCallback(
    async (userName: string, userPwd: string) => {
      await dispatch(login({ userName, userPwd })).unwrap()
    },
    [dispatch]
  )

  const handleSwitchLocation = useCallback(
    (location: AppLocation) => {
      dispatch(switchLocationAction(location))
    },
    [dispatch]
  )

  const handleLogout = useCallback(() => {
    dispatch(logout())
  }, [dispatch])

  const value = useMemo(
    () => ({
      credentials,
      session,
      isAuthenticated,
      isLoading,
      login: handleLogin,
      switchLocation: handleSwitchLocation,
      logout: handleLogout,
    }),
    [
      credentials,
      session,
      isAuthenticated,
      isLoading,
      handleLogin,
      handleSwitchLocation,
      handleLogout,
    ]
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
