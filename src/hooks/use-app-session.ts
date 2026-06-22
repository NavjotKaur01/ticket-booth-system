import { useAuth } from "@/contexts/auth-context"

/** Active club/location from login or header location switch. */
export function useAppSession() {
  const { session, credentials } = useAuth()

  return {
    session,
    credentials,
    username: session?.username ?? "",
    connectionName: session?.organization ?? "",
    clubSlug: session?.clubSlug ?? "",
    locationId: session?.locationId ?? "",
    locationName: session?.locationName ?? "",
    userId: session?.userId ?? "",
    userRight: session?.userRight ?? "",
    isReady: Boolean(session?.locationId && session?.organization),
  }
}
