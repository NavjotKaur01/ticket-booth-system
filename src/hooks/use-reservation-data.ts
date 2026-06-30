import { useCallback, useMemo } from "react"

import { mapReservationData } from "@/lib/map-reservation-data"
import { parseTransactionRefreshMs } from "@/lib/parse-refresh-interval"
import { getClubmanErrorMessage } from "@/store/api/baseQuery"
import { useGetReservationDataQuery } from "@/store/api/clubmanApi"

type UseReservationDataResult = {
  reservations: ReturnType<typeof mapReservationData>
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useReservationData(
  connectionString: string,
  showId: string,
  includeCancelledReservations: boolean,
  enabled = true,
  refreshSeconds = "999",
  isCheckedIn = false,
  isReservationForm = true
): UseReservationDataResult {
  const shouldSkip = !enabled || !connectionString || !showId
  const pollingInterval = parseTransactionRefreshMs(refreshSeconds)

  const { data, isLoading, isFetching, error, refetch } =
    useGetReservationDataQuery(
      {
        connectionString,
        showId,
        includeCancelledReservations,
        isCheckedIn,
        isReservationForm,
      },
      {
        skip: shouldSkip,
        pollingInterval: shouldSkip ? 0 : pollingInterval,
      }
    )

  const reservations = useMemo(
    () => (shouldSkip ? [] : mapReservationData(data)),
    [data, shouldSkip]
  )

  const refresh = useCallback(async () => {
    if (shouldSkip) {
      return
    }

    await refetch().unwrap()
  }, [refetch, shouldSkip])

  return {
    reservations,
    loading: shouldSkip ? false : isLoading || isFetching,
    error: error ? getClubmanErrorMessage(error) : null,
    refresh,
  }
}
