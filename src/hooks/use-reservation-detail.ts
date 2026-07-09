import { useMemo } from 'react'

import { getClubmanErrorMessage } from '@/store/api/baseQuery'
import { useGetReservationDetailByIdQuery } from '@/store/api/clubmanApi'

type UseReservationDetailResult = {
  detail: ReturnType<typeof useGetReservationDetailByIdQuery>['data']
  loading: boolean
  error: string | null
}

export function useReservationDetail(
  connectionString: string,
  reservationId: string,
  enabled = true
): UseReservationDetailResult {
  const shouldSkip = !enabled || !connectionString || !reservationId

  const { data, isLoading, isFetching, error } = useGetReservationDetailByIdQuery(
    { connectionName: connectionString, reservationId },
    { skip: shouldSkip }
  )

  return useMemo(
    () => ({
      detail: shouldSkip ? undefined : data,
      loading: shouldSkip ? false : isLoading || isFetching,
      error: error ? getClubmanErrorMessage(error) : null
    }),
    [data, error, isFetching, isLoading, shouldSkip]
  )
}
