import { dispatchEndpoint } from "@/lib/api/dispatch-endpoint"
import { clubmanApi } from "@/store/api/clubmanApi"
import type { ComedianRequestModel } from "@/types/api/comedian-info"
import type { ApiComedianSearchItem, ComedianSearchRequestModel } from "@/types/api/save-show"

export function searchComedians(request: ComedianSearchRequestModel) {
  return dispatchEndpoint<ApiComedianSearchItem[], ComedianSearchRequestModel>(
    clubmanApi.endpoints.searchComedians,
    request
  )
}

export function saveComedian(
  request: ComedianRequestModel & {
    Image?: string | null
    ImageFileName?: string
  }
) {
  return dispatchEndpoint<
    boolean,
    ComedianRequestModel & {
      Image?: string | null
      ImageFileName?: string
    }
  >(clubmanApi.endpoints.saveComedian, request)
}
