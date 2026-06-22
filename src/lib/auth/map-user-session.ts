import type { UserCredentials } from "@/types/auth"
import type { UserSession } from "@/types/dashboard"

export function mapCredentialsToUserSession(
  credentials: UserCredentials
): UserSession {
  return {
    username: credentials.UserName,
    organization: credentials.ConnectionName,
    clubSlug: credentials.ConnectionName.toLowerCase(),
    userId: credentials.UserID,
    userRight: credentials.UserRights,
    locationId: credentials.LocationID ?? "",
    locationName: credentials.LocationName,
    lastLogin: new Date().toLocaleDateString("en-US"),
  }
}
