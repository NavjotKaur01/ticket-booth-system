import { useCallback, useEffect, useState } from "react"

import { getPrivateShowLinks } from "@/lib/api/private-show-links"
import { buildGetPrivateShowLinksRequest } from "@/lib/build-private-show-link-request"
import { mapPrivateShowLinks } from "@/lib/map-private-show-links"
import { getClubmanErrorMessage } from "@/store/api/baseQuery"
import type { PreSaleRecord } from "@/types/pre-sale"

type UsePrivateShowLinksParams = {
  connectionName: string
  locationId: string
  enabled?: boolean
}

type UsePrivateShowLinksResult = {
  records: PreSaleRecord[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

/**
 * Administrator Private Pre-sale Setup list.
 * Mirrors ShowTimesVM.GetPrivateShowLinksList → PUT Adminstrator/GetPrivateShowLinks.
 */
export function usePrivateShowLinks({
  connectionName,
  locationId,
  enabled = true,
}: UsePrivateShowLinksParams): UsePrivateShowLinksResult {
  const [records, setRecords] = useState<PreSaleRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!enabled || !connectionName || !locationId) {
      setRecords([])
      setError(
        enabled ? "Location is required before loading private show links." : null
      )
      return
    }

    setLoading(true)
    setError(null)

    try {
      const data = await getPrivateShowLinks(
        buildGetPrivateShowLinksRequest({ connectionName, locationId })
      )
      setRecords(mapPrivateShowLinks(data ?? []))
    } catch (loadError) {
      setRecords([])
      setError(
        loadError instanceof Error
          ? loadError.message
          : getClubmanErrorMessage(loadError)
      )
    } finally {
      setLoading(false)
    }
  }, [connectionName, locationId, enabled])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { records, loading, error, refresh }
}
