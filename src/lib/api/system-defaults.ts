import { dispatchEndpoint } from "@/lib/api/dispatch-endpoint"
import { clubmanApi } from "@/store/api/clubmanApi"
import type { SystemDefaultRequestModel } from "@/types/api/system-defaults"

export function updateSystemDefault(request: SystemDefaultRequestModel) {
  return dispatchEndpoint<boolean, SystemDefaultRequestModel>(
    clubmanApi.endpoints.updateSystemDefault,
    request
  )
}
