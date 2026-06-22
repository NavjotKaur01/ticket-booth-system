import { useMemo } from "react"

import { mapShowDetailsToOptions } from "@/lib/map-show-details"
import { getClubmanErrorMessage } from "@/store/api/baseQuery"
import { useGetShowDetailsByDateQuery } from "@/store/api/clubmanApi"

type UseShowDetailsByDateResult = {
  shows: ReturnType<typeof mapShowDetailsToOptions>
  loading: boolean
  error: string | null
}

export function useShowDetailsByDate(
  connectionString: string,
  locationId: string,
  showDate: string,
  isCancelledShow: boolean,
  enabled = true
): UseShowDetailsByDateResult {
  const shouldSkip =
    !enabled || !connectionString || !locationId || !showDate

  const { data, isLoading, isFetching, error } = useGetShowDetailsByDateQuery(
    { connectionString, locationId, showDate, isCancelledShow },
    { skip: shouldSkip }
  )

  const shows = useMemo(
    () => (shouldSkip ? [] : mapShowDetailsToOptions(data ?? [])),
    [data, shouldSkip]
  )

  return {
    shows,
    loading: shouldSkip ? false : isLoading || isFetching,
    error: error ? getClubmanErrorMessage(error) : null,
  }
}
