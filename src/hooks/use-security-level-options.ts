import { useMemo } from "react"

import { useAppSession } from "@/hooks/use-app-session"
import {
  ensureSecurityOption,
  filterSecurityLookupOptions,
  type SecurityLevelOption,
} from "@/lib/security-lookup"
import { useGetSystemLookupQuery } from "@/store/api/clubmanApi"

type UseSecurityLevelOptionsParams = {
  /** When editing, keep the assigned right visible even if not assignable. */
  assigned?: { id: string; label: string } | null
  skip?: boolean
}

export function useSecurityLevelOptions({
  assigned,
  skip = false,
}: UseSecurityLevelOptionsParams = {}): {
  options: SecurityLevelOption[]
  isLoading: boolean
} {
  const { connectionName, locationId, userRight } = useAppSession()

  const { data: lookups = [], isLoading } = useGetSystemLookupQuery(
    connectionName,
    {
      skip: skip || !connectionName,
    }
  )

  const options = useMemo(() => {
    const filtered = filterSecurityLookupOptions(lookups, {
      locationId,
      currentUserRight: userRight,
    })
    return ensureSecurityOption(filtered, assigned)
  }, [lookups, locationId, userRight, assigned])

  return { options, isLoading }
}
