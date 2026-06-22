import { administratorApiPath, apiRequest } from "@/lib/api/client"
import type {
  ApiSystemUser,
  SaveSystemUserRequest,
} from "@/types/api/system-users"

type FetchSystemUsersParams = {
  organization: string
  locationId: string
  userId: string
  userRight: string
}

export function fetchSystemUsers({
  organization,
  locationId,
  userId,
  userRight,
}: FetchSystemUsersParams) {
  return apiRequest<ApiSystemUser[]>(
    administratorApiPath(
      organization,
      locationId,
      userId,
      userRight,
      "GetAllSystemUsers"
    ),
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    }
  )
}

export function saveSystemUser(request: SaveSystemUserRequest) {
  return apiRequest<boolean>(administratorApiPath("SaveSystemUser"), {
    method: "POST",
    body: JSON.stringify(request),
  })
}
