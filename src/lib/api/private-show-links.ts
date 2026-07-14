import { dispatchEndpoint } from "@/lib/api/dispatch-endpoint"
import { clubmanApi } from "@/store/api/clubmanApi"
import type {
  ApiPrivateShowLink,
  PrivateShowLinkRequestModel,
} from "@/types/api/private-show-link"

export function getPrivateShowLinks(request: PrivateShowLinkRequestModel) {
  return dispatchEndpoint<ApiPrivateShowLink[], PrivateShowLinkRequestModel>(
    clubmanApi.endpoints.getPrivateShowLinks,
    request
  )
}

export function savePrePrivateSetupLink(request: PrivateShowLinkRequestModel) {
  return dispatchEndpoint<boolean, PrivateShowLinkRequestModel>(
    clubmanApi.endpoints.savePrePrivateSetupLink,
    request
  )
}

export function deletePrivateShowLink(request: PrivateShowLinkRequestModel) {
  return dispatchEndpoint<boolean, PrivateShowLinkRequestModel>(
    clubmanApi.endpoints.deletePrivateShowLink,
    request
  )
}
