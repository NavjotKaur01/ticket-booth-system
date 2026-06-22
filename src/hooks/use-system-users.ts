import { useCallback, useEffect, useState } from "react"

import { fetchSystemUsers } from "@/lib/api/system-users"
import { mapSystemUsers } from "@/lib/map-system-users"
import type { AdminUser } from "@/types/user-admin"

type UseSystemUsersParams = {
  organization: string
  locationId: string
  userId: string
  userRight: string
  enabled?: boolean
}

type UseSystemUsersResult = {
  users: AdminUser[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useSystemUsers({
  organization,
  locationId,
  userId,
  userRight,
  enabled = true,
}: UseSystemUsersParams): UseSystemUsersResult {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!enabled || !organization || !locationId || !userId || !userRight) {
      setUsers([])
      setError(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const data = await fetchSystemUsers({
        organization,
        locationId,
        userId,
        userRight,
      })
      setUsers(mapSystemUsers(data))
    } catch (requestError) {
      setUsers([])
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Failed to load users"
      )
    } finally {
      setLoading(false)
    }
  }, [organization, locationId, userId, userRight, enabled])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { users, loading, error, refresh }
}
