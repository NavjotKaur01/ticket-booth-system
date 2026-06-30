import { useMemo } from 'react'

import { getClubmanErrorMessage } from '@/store/api/baseQuery'
import { useGetReservationNoteByIdQuery } from '@/store/api/clubmanApi'

type UseReservationNoteResult = {
  note: string
  loading: boolean
  error: string | null
}

export function useReservationNote (
  connectionString: string,
  reservationId: string,
  enabled = true
): UseReservationNoteResult {
  const shouldSkip = !enabled || !connectionString || !reservationId

  const { data, isLoading, isFetching, error } = useGetReservationNoteByIdQuery(
    { connectionString, reservationId },
    { skip: shouldSkip }
  )

  return useMemo(
    () => ({
      note: shouldSkip ? '' : (data ?? ''),
      loading: shouldSkip ? false : isLoading || isFetching,
      error: error ? getClubmanErrorMessage(error) : null
    }),
    [data, error, isFetching, isLoading, shouldSkip]
  )
}
