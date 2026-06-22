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

type RefreshOptions = {
  silent?: boolean
}

type UseSystemUsersResult = {
  users: AdminUser[]
  loading: boolean
  error: string | null
  refresh: (options?: RefreshOptions) => Promise<void>
  upsertUser: (user: AdminUser) => void
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

  const upsertUser = useCallback((user: AdminUser) => {
    setUsers((current) => {
      const index = current.findIndex((item) => item.id === user.id)
      if (index === -1) {
        return [...current, user]
      }

      const next = [...current]
      next[index] = user
      return next
    })
  }, [])

  const refresh = useCallback(
    async ({ silent = false }: RefreshOptions = {}) => {
      if (!enabled || !organization || !locationId || !userId || !userRight) {
        setUsers([])
        setError(null)
        setLoading(false)
        return
      }

      if (!silent) {
        setLoading(true)
      }
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
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Failed to load users"
        )
      } finally {
        if (!silent) {
          setLoading(false)
        }
      }
    },
    [organization, locationId, userId, userRight, enabled]
  )

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { users, loading, error, refresh, upsertUser }
}
