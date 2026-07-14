import { dispatchEndpoint } from "@/lib/api/dispatch-endpoint"
import { clubmanApi } from "@/store/api/clubmanApi"
import type {
  ApiUserAccessItem,
  UserAccessRequestModel,
} from "@/types/api/user-access"

export function getUserPermissionData(params: {
  connectionName: string
  locationId: string
}) {
  return dispatchEndpoint<
    ApiUserAccessItem[],
    { connectionName: string; locationId: string }
  >(clubmanApi.endpoints.getUserPermissionData, params)
}

export function saveUserAccessibility(request: UserAccessRequestModel) {
  return dispatchEndpoint<boolean, UserAccessRequestModel>(
    clubmanApi.endpoints.saveUserAccessibility,
    request
  )
}
