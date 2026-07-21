import { useAuth } from "@/contexts/auth-context"
import { getStoredLocations } from "@/lib/auth/locations-storage"

/** Active club/location from cookies (user_data + locations) or login session. */
export function useAppSession() {
  const { session, credentials } = useAuth()
  const clubSlug = session?.clubSlug ?? ""
  const cookieLocations = clubSlug ? getStoredLocations(clubSlug) : []

  const firstLocation = cookieLocations[0]

  const activeLocation = cookieLocations.find(
    (location) =>
      location.id.toLowerCase() === (session?.locationId ?? "").toLowerCase()
  )

  // Phase 2: no hardcoded Standupmedia GUID — empty locations stay empty.
  const locationId =
    activeLocation?.id ||
    session?.locationId ||
    firstLocation?.id ||
    ""
  const locSName =
    activeLocation?.shortName ||
    activeLocation?.label ||
    session?.locationName ||
    firstLocation?.shortName ||
    firstLocation?.label ||
    ""

  return {
    session,
    credentials,
    username: session?.username ?? "",
    connectionName: session?.organization ?? credentials?.ConnectionName ?? "",
    /** Desktop UserCredentials.DBName — used by SendReservationEmails. */
    dbName:
      credentials?.DBName?.trim() ||
      session?.organization ||
      credentials?.ConnectionName ||
      "",
    clubSlug,
    locationId,
    locationName: locSName,
    locSName,
    userId: session?.userId ?? credentials?.UserID ?? "",
    userRight: session?.userRight ?? credentials?.UserRights ?? "",
    locations: cookieLocations,
    isReady: Boolean(
      locationId && (session?.organization || credentials?.ConnectionName)
    ),
  }
}
