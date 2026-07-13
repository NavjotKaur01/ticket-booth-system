import { dispatchEndpoint } from "@/lib/api/dispatch-endpoint"
import { clubmanApi } from "@/store/api/clubmanApi"
import type { ApiDefShowItem, ShowDefRequestModel } from "@/types/api/show-def"

export function searchDefShow(request: ShowDefRequestModel) {
  return dispatchEndpoint<ApiDefShowItem[], ShowDefRequestModel>(
    clubmanApi.endpoints.searchDefShow,
    request
  )
}

export function saveShowDef(request: ShowDefRequestModel) {
  return dispatchEndpoint<boolean, ShowDefRequestModel>(
    clubmanApi.endpoints.saveShowDef,
    request
  )
}

export function updateShowDef(request: ShowDefRequestModel) {
  return dispatchEndpoint<boolean, ShowDefRequestModel>(
    clubmanApi.endpoints.updateShowDef,
    request
  )
}

export function deleteShowDefs(request: ShowDefRequestModel) {
  return dispatchEndpoint<boolean, ShowDefRequestModel>(
    clubmanApi.endpoints.deleteShowDefs,
    request
  )
}

export function getDefShowInfo(connectionName: string, showDefId: string) {
  return dispatchEndpoint<
    ApiDefShowItem[],
    { connectionName: string; showDefId: string }
  >(clubmanApi.endpoints.getDefShowInfo, { connectionName, showDefId })
}
