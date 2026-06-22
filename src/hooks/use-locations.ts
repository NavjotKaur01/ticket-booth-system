import { useEffect, useMemo, useState } from "react"

import { getStoredLocations } from "@/lib/auth/locations-storage"
import { getClubmanErrorMessage } from "@/store/api/baseQuery"
import { useGetLocationsQuery } from "@/store/api/clubmanApi"
import type { AppLocation } from "@/types/api/locations"

type UseLocationsResult = {
  locations: AppLocation[]
  loading: boolean
  error: string | null
  source: "cookie" | "api" | null
}

export function useLocations(clubSlug: string): UseLocationsResult {
  const [locations, setLocations] = useState<AppLocation[]>(() =>
    getStoredLocations(clubSlug)
  )
  const [source, setSource] = useState<"cookie" | "api" | null>(() =>
    getStoredLocations(clubSlug).length > 0 ? "cookie" : null
  )

  const hasCookieLocations = useMemo(
    () => getStoredLocations(clubSlug).length > 0,
    [clubSlug]
  )

  const shouldFetchApi = Boolean(clubSlug) && !hasCookieLocations

  const { data, isLoading, isFetching, error } = useGetLocationsQuery(clubSlug, {
    skip: !shouldFetchApi,
  })

  useEffect(() => {
    const stored = getStoredLocations(clubSlug)
    if (stored.length > 0) {
      setLocations(stored)
      setSource("cookie")
      return
    }

    if (!clubSlug) {
      setLocations([])
      setSource(null)
    }
  }, [clubSlug])

  useEffect(() => {
    if (!data?.length || !clubSlug) {
      return
    }

    setLocations(data)
    setSource("api")
  }, [data, clubSlug])

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
    locations,
    loading: shouldFetchApi ? isLoading || isFetching : false,
    error: errorMessage,
    source,
  }
}
