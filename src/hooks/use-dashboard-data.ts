import { useCallback, useMemo } from "react"

import { mapDashboardStats } from "@/lib/map-dashboard-data"
import { getClubmanErrorMessage } from "@/store/api/baseQuery"
import { useLoadDashboardQuery } from "@/store/api/clubmanApi"
import type { StatSummary } from "@/types/dashboard"

type UseDashboardDataResult = {
  stats: StatSummary[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useDashboardData(
  connectionName: string,
  locationId: string,
  enabled = true
): UseDashboardDataResult {
  const shouldSkip = !enabled || !connectionName || !locationId

  const { data, isLoading, error, refetch } = useLoadDashboardQuery(
    { connectionName, locationId },
    { skip: shouldSkip }
  )

  const stats = useMemo(
    () => mapDashboardStats(shouldSkip ? undefined : data),
    [data, shouldSkip]
  )

  const refresh = useCallback(async () => {
    if (shouldSkip) {
      return
    }

    await refetch().unwrap()
  }, [refetch, shouldSkip])

  return {
    stats,
    loading: shouldSkip ? false : isLoading && data === undefined,
    error: error ? getClubmanErrorMessage(error) : null,
    refresh,
  }
}
