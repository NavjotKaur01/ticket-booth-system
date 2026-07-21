import { useCallback, useRef, useState } from "react"

/**
 * Shared double-submit guard (Phase 2).
 * Ignores overlapping clicks while an async submit is in flight.
 */
export function useSubmitInFlight() {
  const [inFlight, setInFlight] = useState(false)
  const inFlightRef = useRef(false)

  const run = useCallback(async <T,>(action: () => Promise<T>): Promise<T | undefined> => {
    if (inFlightRef.current) {
      return undefined
    }

    inFlightRef.current = true
    setInFlight(true)
    try {
      return await action()
    } finally {
      inFlightRef.current = false
      setInFlight(false)
    }
  }, [])

  return { inFlight, run }
}
