import { useMemo } from 'react'

import { mapReservationHistory } from '@/lib/map-reservation-history'
import { getClubmanErrorMessage } from '@/store/api/baseQuery'
import { useGetReservationHistoryByIdQuery } from '@/store/api/clubmanApi'

type UseReservationHistoryResult = {
  rows: ReturnType<typeof mapReservationHistory>
  loading: boolean
  error: string | null
}

export function useReservationHistory(
  connectionString: string,
  reservationId: string,
  enabled = true
): UseReservationHistoryResult {
  const shouldSkip = !enabled || !connectionString || !reservationId

  const { data, isLoading, isFetching, error } =
    useGetReservationHistoryByIdQuery(
      { connectionString, reservationId },
      { skip: shouldSkip }
    )

  const rows = useMemo(
    () => (shouldSkip ? [] : mapReservationHistory(data)),
    [data, shouldSkip]
  )

  return useMemo(
    () => ({
      rows,
      loading: shouldSkip ? false : isLoading || isFetching,
      error: error ? getClubmanErrorMessage(error) : null
    }),
    [error, isFetching, isLoading, rows, shouldSkip]
  )
}
