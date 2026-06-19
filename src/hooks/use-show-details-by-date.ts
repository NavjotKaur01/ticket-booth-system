import { useEffect, useState } from "react"

import { fetchShowDetailsByDate } from "@/lib/api/reservations"
import { mapShowDetailsToOptions } from "@/lib/map-show-details"
import type { ShowOption } from "@/types/reservation"

type UseShowDetailsByDateResult = {
  shows: ShowOption[]
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
  const [shows, setShows] = useState<ShowOption[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled || !connectionString || !locationId || !showDate) {
      setShows([])
      setError(null)
      setLoading(false)
      return
    }

    let cancelled = false

    async function loadShows() {
      setLoading(true)
      setError(null)

      try {
        const data = await fetchShowDetailsByDate({
          connectionString,
          locationId,
          showDate,
          isCancelledShow,
        })

        if (!cancelled) {
          setShows(mapShowDetailsToOptions(data))
        }
      } catch (requestError) {
        if (!cancelled) {
          setShows([])
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Failed to load shows"
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadShows()

    return () => {
      cancelled = true
    }
  }, [connectionString, locationId, showDate, isCancelledShow, enabled])

  return { shows, loading, error }
}
