import { useEffect, useState } from "react"

import { fetchReservationData } from "@/lib/api/reservations"
import { mapReservationData } from "@/lib/map-reservation-data"
import type { Reservation } from "@/types/reservation"

type UseReservationDataResult = {
  reservations: Reservation[]
  loading: boolean
  error: string | null
}

export function useReservationData(
  connectionString: string,
  showId: string,
  includeCancelledReservations: boolean,
  enabled = true
): UseReservationDataResult {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled || !connectionString || !showId) {
      setReservations([])
      setError(null)
      setLoading(false)
      return
    }

    let cancelled = false

    async function loadReservations() {
      setLoading(true)
      setError(null)

      try {
        const data = await fetchReservationData({
          connectionString,
          showId,
          includeCancelledReservations,
        })

        if (!cancelled) {
          setReservations(mapReservationData(data))
        }
      } catch (requestError) {
        if (!cancelled) {
          setReservations([])
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Failed to load reservations"
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadReservations()

    return () => {
      cancelled = true
    }
  }, [connectionString, showId, includeCancelledReservations, enabled])

  return { reservations, loading, error }
}
