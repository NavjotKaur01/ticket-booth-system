import { useMemo } from 'react'

import { getClubmanErrorMessage } from '@/store/api/baseQuery'
import { useGetReservationPrintPropertiesQuery } from '@/store/api/clubmanApi'

type UseReservationPrintPropertiesResult = {
  properties: ReturnType<typeof useGetReservationPrintPropertiesQuery>['data']
  loading: boolean
  error: string | null
}

/**
 * Wraps GetReservationPrintProperties — provides Auth/PNREF/masked card details
 * for a reservation that already has a completed payment.
 */
export function useReservationPrintProperties(
  connectionName: string,
  reservationId: string,
  enabled = true
): UseReservationPrintPropertiesResult {
  const shouldSkip = !enabled || !connectionName || !reservationId

  const { data, isLoading, isFetching, error } = useGetReservationPrintPropertiesQuery(
    { connectionName, reservationId },
    { skip: shouldSkip }
  )

  return useMemo(
    () => ({
      properties: shouldSkip ? undefined : data,
      loading: shouldSkip ? false : isLoading || isFetching,
      error: error ? getClubmanErrorMessage(error) : null
    }),
    [data, error, isFetching, isLoading, shouldSkip]
  )
}
