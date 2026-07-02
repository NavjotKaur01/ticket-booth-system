import type { ReactNode } from "react"
import { Navigate } from "react-router-dom"

import { ROUTES } from "@/constants/routes"
import { useAppSession } from "@/hooks/use-app-session"
import {
  readGiftCardNavVisible,
  readGiftCertificateNavVisible,
} from "@/lib/gift-nav-defaults"
import { useGetSystemDefaultsQuery } from "@/store/api/clubmanApi"

type GiftFeatureGuardProps = {
  feature: "gift-cards" | "gift-certificate"
  children: ReactNode
}

export function GiftFeatureGuard({ feature, children }: GiftFeatureGuardProps) {
  const { connectionName, locationId, isReady } = useAppSession()
  const { data: systemDefaults, isLoading, isFetching } =
    useGetSystemDefaultsQuery(
      { connectionName, locationId },
      { skip: !isReady }
    )

  if (!isReady || isLoading || (isFetching && !systemDefaults)) {
    return null
  }

  const isVisible =
    feature === "gift-cards"
      ? readGiftCardNavVisible(systemDefaults ?? [])
      : readGiftCertificateNavVisible(systemDefaults ?? [])

  if (!isVisible) {
    return <Navigate to={ROUTES.dashboard} replace />
  }

  return children
}
