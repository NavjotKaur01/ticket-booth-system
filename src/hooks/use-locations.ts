import { useMemo } from "react"

import { getClubmanErrorMessage } from "@/store/api/baseQuery"
import { useGetLocationsQuery } from "@/store/api/clubmanApi"
import type { AppLocation } from "@/types/api/locations"

type UseLocationsResult = {
  locations: AppLocation[]
  loading: boolean
  error: string | null
}

export function useLocations(clubSlug: string): UseLocationsResult {
  const { data, isLoading, isFetching, error } = useGetLocationsQuery(clubSlug, {
    skip: !clubSlug,
  })

  const errorMessage = useMemo(() => {
    if (!clubSlug) {
      return "Club slug is required"
    }

    if (!error) {
      return null
    }

    return getClubmanErrorMessage(error)
  }, [clubSlug, error])

  return {
    locations: data ?? [],
    loading: clubSlug ? isLoading || isFetching : false,
    error: errorMessage,
  }
}
