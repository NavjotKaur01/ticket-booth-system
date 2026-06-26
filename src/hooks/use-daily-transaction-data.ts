import { useCallback, useMemo } from "react"

import { mapDailyTransactionData } from "@/lib/map-daily-transaction"
import { parseTransactionRefreshMs } from "@/lib/parse-refresh-interval"
import { getClubmanErrorMessage } from "@/store/api/baseQuery"
import { useGetDailyTransactionDataQuery } from "@/store/api/clubmanApi"

type UseDailyTransactionDataResult = {
  transactions: ReturnType<typeof mapDailyTransactionData>
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useDailyTransactionData(
  connectionString: string,
  showId: string,
  refreshSeconds: string,
  enabled = true
): UseDailyTransactionDataResult {
  const shouldSkip = !enabled || !connectionString || !showId
  const pollingInterval = parseTransactionRefreshMs(refreshSeconds)

  const { data, isLoading, isFetching, error, refetch } =
    useGetDailyTransactionDataQuery(
      { connectionString, showId },
      {
        skip: shouldSkip,
        pollingInterval: shouldSkip ? 0 : pollingInterval,
      }
    )

  const transactions = useMemo(
    () => (shouldSkip ? [] : mapDailyTransactionData(data ?? [])),
    [data, shouldSkip]
  )

  const refresh = useCallback(async () => {
    if (shouldSkip) {
      return
    }

    await refetch().unwrap()
  }, [refetch, shouldSkip])

  return {
    transactions,
    loading: shouldSkip ? false : isLoading || isFetching,
    error: error ? getClubmanErrorMessage(error) : null,
    refresh,
  }
}
