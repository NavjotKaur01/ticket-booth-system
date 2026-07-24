import { dispatchEndpoint } from "@/lib/api/dispatch-endpoint"
import { clubmanApi } from "@/store/api/clubmanApi"
import type {
  ApiSystemUser,
  ArchiveSystemCustomerRequest,
  SaveSystemUserRequest,
  UpdateSystemUserRequest,
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
  return dispatchEndpoint<ApiSystemUser[], FetchSystemUsersParams>(
    clubmanApi.endpoints.getSystemUsers,
    { organization, locationId, userId, userRight }
  )
}

export function saveSystemUser(request: SaveSystemUserRequest) {
  return dispatchEndpoint<boolean, SaveSystemUserRequest>(
    clubmanApi.endpoints.saveSystemUser,
    request
  )
}

export function updateSystemUser(request: UpdateSystemUserRequest) {
  return dispatchEndpoint<boolean, UpdateSystemUserRequest>(
    clubmanApi.endpoints.updateSystemUser,
    request
  )
}

export function archiveSystemCustomer(request: ArchiveSystemCustomerRequest) {
  return dispatchEndpoint<boolean, ArchiveSystemCustomerRequest>(
    clubmanApi.endpoints.archiveSystemCustomer,
    request
  )
}
