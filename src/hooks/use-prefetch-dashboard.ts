import { useEffect } from "react"

import { useAppSession } from "@/hooks/use-app-session"
import { useAppDispatch } from "@/store/hooks"
import { clubmanApi } from "@/store/api/clubmanApi"

/** Warm the LoadDashboard cache as soon as the session is ready. */
export function usePrefetchDashboard() {
  const dispatch = useAppDispatch()
  const { connectionName, locationId, isReady } = useAppSession()

  useEffect(() => {
    if (!isReady) {
      return
    }

    dispatch(
      clubmanApi.endpoints.loadDashboard.initiate({
        connectionName,
        locationId,
      })
    )
  }, [dispatch, connectionName, locationId, isReady])
}
