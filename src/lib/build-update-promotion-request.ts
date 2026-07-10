import { buildSavePromotionRequest } from "@/lib/build-save-promotion-request"
import type { UpdatePromotionRequest } from "@/types/api/save-promotion"
import type { PromotionFormValues } from "@/types/promotion-form"

type BuildUpdatePromotionRequestParams = {
  connectionName: string
  locationId: string
  lastUpdateId: string
  promotionId: string
  form: PromotionFormValues
}

/** Matches desktop `PromotionVM.UpdatePromotion` / `Adminstrator/UpdatePromotion`. */
export function buildUpdatePromotionRequest({
  connectionName,
  locationId,
  lastUpdateId,
  promotionId,
  form,
}: BuildUpdatePromotionRequestParams): UpdatePromotionRequest {
  return {
    ...buildSavePromotionRequest({
      connectionName,
      locationId,
      lastUpdateId,
      form,
    }),
    PromotionId: promotionId,
  }
}
