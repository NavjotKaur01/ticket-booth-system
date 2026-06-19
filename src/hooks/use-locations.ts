import { useEffect, useState } from "react"

import { fetchLocations } from "@/lib/api/locations"
import type { AppLocation } from "@/types/api/locations"

type UseLocationsResult = {
  locations: AppLocation[]
  loading: boolean
  error: string | null
}

export function useLocations(clubSlug: string): UseLocationsResult {
  const [locations, setLocations] = useState<AppLocation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!clubSlug) {
      setLocations([])
      setError("Club slug is required")
      setLoading(false)
      return
    }

    let cancelled = false

    async function loadLocations() {
      setLoading(true)
      setError(null)

      try {
        const nextLocations = await fetchLocations(clubSlug)
        if (!cancelled) {
          setLocations(nextLocations)
        }
      } catch (requestError) {
        if (!cancelled) {
          setLocations([])
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Failed to load locations"
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadLocations()

    return () => {
      cancelled = true
    }
  }, [clubSlug])

  return { locations, loading, error }
}
