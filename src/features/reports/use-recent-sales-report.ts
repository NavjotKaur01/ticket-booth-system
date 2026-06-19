import { useCallback, useEffect, useState } from "react"

import { fetchRecentSalesReport } from "@/lib/api/recent-sales"
import { mapRecentSalesReport } from "@/lib/map-recent-sales-report"
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
  const [data, setData] = useState<TodaySalesSummary>(EMPTY_SUMMARY)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!enabled || !clubSlug || !locationId) {
      setData(EMPTY_SUMMARY)
      setError(null)
      setLoading(!enabled ? false : !locationId)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetchRecentSalesReport(clubSlug, locationId)
      setData(mapRecentSalesReport(response))
    } catch (requestError) {
      setData(EMPTY_SUMMARY)
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Failed to load recent sales"
      )
    } finally {
      setLoading(false)
    }
  }, [clubSlug, locationId, enabled])

  useEffect(() => {
    void refresh()
  }, [refresh])

  useEffect(() => {
    if (!enabled || !refreshIntervalMs || refreshIntervalMs <= 0) {
      return
    }

    const timer = window.setInterval(() => {
      void refresh()
    }, refreshIntervalMs)

    return () => window.clearInterval(timer)
  }, [refresh, refreshIntervalMs, enabled])

  return { data, loading, error, refresh }
}
