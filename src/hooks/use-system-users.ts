import { useCallback, useEffect, useMemo, useState } from "react"

import { mapSystemUsers } from "@/lib/map-system-users"
import { getClubmanErrorMessage } from "@/store/api/baseQuery"
import { useGetSystemUsersQuery } from "@/store/api/clubmanApi"
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
  const [isRefreshing, setIsRefreshing] = useState(false)

  const queryArgs = useMemo(
    () => ({ organization, locationId, userId, userRight }),
    [organization, locationId, userId, userRight]
  )

  const shouldSkip =
    !enabled || !organization || !locationId || !userId || !userRight

  const { data, isLoading, error, refetch } = useGetSystemUsersQuery(queryArgs, {
    skip: shouldSkip,
  })

  useEffect(() => {
    if (shouldSkip) {
      setUsers([])
      return
    }

    setUsers(mapSystemUsers(data ?? []))
  }, [data, shouldSkip])

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
      if (shouldSkip) {
        setUsers([])
        return
      }

      if (!silent) {
        setIsRefreshing(true)
      }

      try {
        await refetch().unwrap()
      } finally {
        if (!silent) {
          setIsRefreshing(false)
        }
      }
    },
    [refetch, shouldSkip]
  )

  return {
    users,
    loading: isLoading || isRefreshing,
    error: error ? getClubmanErrorMessage(error) : null,
    refresh,
    upsertUser,
  }
}
