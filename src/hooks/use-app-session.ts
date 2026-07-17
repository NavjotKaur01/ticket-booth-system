import { useAuth } from "@/contexts/auth-context"
import { getStoredLocations } from "@/lib/auth/locations-storage"

/**
 * Last-resort hardcoded location, used only if the session has no location
 * and the locations list (from cookies) is empty, so there's nothing else
 * to fall back to. 
 * ========== This is for the temporary location passes, It must update in production =========
 */

const HARDCODED_LOCATION = {
  id: "0d12ceb8-9f0e-4b02-b8ac-fedd02c60708",
  label: "Standupmedia",
}

/** Active club/location from cookies (user_data + locations) or login session. */
export function useAppSession() {
  const { session, credentials } = useAuth()
  const clubSlug = session?.clubSlug ?? ""
  const cookieLocations = clubSlug ? getStoredLocations(clubSlug) : []

  // get first location form the list if not selected at any spot
  const firstLocation = cookieLocations[0]

  const activeLocation = cookieLocations.find(
    (location) =>
      location.id.toLowerCase() === (session?.locationId ?? "").toLowerCase()
  )

  // const locationId = activeLocation?.id ?? session?.locationId ?? ""

  const locationId =
    activeLocation?.id ||
    session?.locationId ||
    firstLocation?.id ||
    HARDCODED_LOCATION.id ||
    ""
  const locSName =
    activeLocation?.shortName ||
    activeLocation?.label ||
    session?.locationName ||
    firstLocation?.shortName ||
    firstLocation?.label ||
    HARDCODED_LOCATION.label ||
    ""

  return {
    session,
    credentials,
    username: session?.username ?? "",
    connectionName: session?.organization ?? credentials?.ConnectionName ?? "",
    /** Desktop UserCredentials.DBName — used by SendReservationEmails. */
    dbName: credentials?.DBName?.trim() || session?.organization || credentials?.ConnectionName || "",
    clubSlug,
    locationId,
    locationName: locSName,
    locSName,
    userId: session?.userId ?? credentials?.UserID ?? "",
    userRight: session?.userRight ?? credentials?.UserRights ?? "",
    locations: cookieLocations,
    isReady: Boolean(locationId && (session?.organization || credentials?.ConnectionName)),
  }
}
