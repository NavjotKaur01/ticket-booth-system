import { dispatchEndpoint } from "@/lib/api/dispatch-endpoint"
import { clubmanApi } from "@/store/api/clubmanApi"
import type { UpdateShowAndPromotionFeeRequest } from "@/types/api/adjust-fees"

export function updateShowAndPromotionFee(
  request: UpdateShowAndPromotionFeeRequest
) {
  return dispatchEndpoint<boolean, UpdateShowAndPromotionFeeRequest>(
    clubmanApi.endpoints.updateShowAndPromotionFee,
    request
  )
}
