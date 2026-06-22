import { useCallback, useMemo } from "react"

import { mapRecentSalesReport } from "@/lib/map-recent-sales-report"
import { getClubmanErrorMessage } from "@/store/api/baseQuery"
import { useGetRecentSalesReportQuery } from "@/store/api/clubmanApi"
import type { TodaySalesSummary } from "@/types/today-sales-report"

const EMPTY_SUMMARY: TodaySalesSummary = {
  ticketsSoldToday: 0,
  todaysShows: [],
  recentSales: [],
}

type UseRecentSalesReportResult = {
  data: TodaySalesSummary
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useRecentSalesReport(
  clubSlug: string,
  locationId: string,
  refreshIntervalMs: number | null,
  enabled = true
): UseRecentSalesReportResult {
  const shouldSkip = !enabled || !clubSlug || !locationId

  const pollingInterval =
    enabled && refreshIntervalMs && refreshIntervalMs > 0
      ? refreshIntervalMs
      : 0

  const { data, isLoading, isFetching, error, refetch } =
    useGetRecentSalesReportQuery(
      { clubSlug, locationId },
      { skip: shouldSkip, pollingInterval }
    )

  const summary = useMemo(
    () => (shouldSkip || !data ? EMPTY_SUMMARY : mapRecentSalesReport(data)),
    [data, shouldSkip]
  )

  const refresh = useCallback(async () => {
    if (shouldSkip) {
      return
    }

    await refetch().unwrap()
  }, [refetch, shouldSkip])

  return {
    data: summary,
    loading: shouldSkip ? !enabled : isLoading || isFetching,
    error: error ? getClubmanErrorMessage(error) : null,
    refresh,
  }
}
