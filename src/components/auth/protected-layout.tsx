import { Navigate } from "react-router-dom"

import { AppLayout } from "@/components/layout/app-layout"
import { useAuth } from "@/contexts/auth-context"
import { ROUTES } from "@/constants/routes"

export function ProtectedLayout() {
  const { session, isAuthenticated } = useAuth()

  if (!isAuthenticated || !session) {
    return <Navigate to={ROUTES.login} replace />
  }

  return <AppLayout session={session} />
}
