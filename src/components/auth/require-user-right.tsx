import type { ReactNode } from "react"
import { Navigate, Outlet } from "react-router-dom"

import { ROUTES } from "@/constants/routes"
import { useAppSession } from "@/hooks/use-app-session"
import {
  canAccessAdministrator,
  canAccessVenueManager,
  hasAnyUserRight,
} from "@/lib/auth/user-rights"

type RequireUserRightProps = {
  /** Allow if user has any of these SEC codes. */
  anyOf?: readonly string[]
  /** Named area shortcuts used by App routes. */
  area?: "administrator" | "venue"
  children?: ReactNode
  /** Where to send unauthorized users. */
  redirectTo?: string
}

/**
 * Route guard for UserRights (Phase 2). Nest under ProtectedLayout.
 * Desktop parity:
 * - Administrator: blocked for SEC02 User only
 * - Venue Manager: available to any user with a rights code
 * Additive UX only — does not replace server authorization.
 */
export function RequireUserRight({
  anyOf,
  area,
  children,
  redirectTo = ROUTES.dashboard,
}: RequireUserRightProps) {
  const { userRight } = useAppSession()

  let allowed = false
  if (area === "administrator") {
    allowed = canAccessAdministrator(userRight)
  } else if (area === "venue") {
    allowed = canAccessVenueManager(userRight)
  } else if (anyOf?.length) {
    allowed = hasAnyUserRight(userRight, anyOf)
  }

  if (!allowed) {
    return <Navigate to={redirectTo} replace />
  }

  return children ? <>{children}</> : <Outlet />
}
