import { useMemo } from "react"

import { useAppSession } from "@/hooks/use-app-session"
import {
  filterSecurityLookupOptions,
  type SecurityLevelOption,
} from "@/lib/security-lookup"
import { useGetSystemLookupQuery } from "@/store/api/clubmanApi"

type UseSecurityLevelOptionsParams = {
  skip?: boolean
}

/**
 * Same SECURITY list for Add and Edit (desktop UserVM.GetLookupList).
 * Managers never see SEC01 — including when editing an Administrator.
 */
export function useSecurityLevelOptions({
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

  const options = useMemo(
    () =>
      filterSecurityLookupOptions(lookups, {
        locationId,
        currentUserRight: userRight,
      }),
    [lookups, locationId, userRight]
  )

  return { options, isLoading }
}
