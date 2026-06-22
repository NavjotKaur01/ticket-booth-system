import { useMemo } from "react"

import { mapReservationData } from "@/lib/map-reservation-data"
import { getClubmanErrorMessage } from "@/store/api/baseQuery"
import { useGetReservationDataQuery } from "@/store/api/clubmanApi"

type UseReservationDataResult = {
  reservations: ReturnType<typeof mapReservationData>
  loading: boolean
  error: string | null
}

export function useReservationData(
  connectionString: string,
  showId: string,
  includeCancelledReservations: boolean,
  enabled = true
): UseReservationDataResult {
  const shouldSkip = !enabled || !connectionString || !showId

  const { data, isLoading, isFetching, error } = useGetReservationDataQuery(
    { connectionString, showId, includeCancelledReservations },
    { skip: shouldSkip }
  )

  const reservations = useMemo(
    () => (shouldSkip ? [] : mapReservationData(data ?? [])),
    [data, shouldSkip]
  )

  return {
    reservations,
    loading: shouldSkip ? false : isLoading || isFetching,
    error: error ? getClubmanErrorMessage(error) : null,
  }
}
