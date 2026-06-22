import { useEffect, useState } from "react"

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

  useEffect(() => {
    if (!enabled || !organization || !locationId || !userId || !userRight) {
      setUsers([])
      setError(null)
      setLoading(false)
      return
    }

    let cancelled = false

    async function loadUsers() {
      setLoading(true)
      setError(null)

      try {
        const data = await fetchSystemUsers({
          organization,
          locationId,
          userId,
          userRight,
        })

        if (!cancelled) {
          setUsers(mapSystemUsers(data))
        }
      } catch (requestError) {
        if (!cancelled) {
          setUsers([])
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Failed to load users"
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadUsers()

    return () => {
      cancelled = true
    }
  }, [organization, locationId, userId, userRight, enabled])

  return { users, loading, error }
}
