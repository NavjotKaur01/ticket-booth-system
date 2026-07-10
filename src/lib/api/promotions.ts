import { dispatchEndpoint } from "@/lib/api/dispatch-endpoint"
import { clubmanApi } from "@/store/api/clubmanApi"
import type { ApiPromotionSearchItem } from "@/types/api/promotion-search"
import type { PromotionFilters } from "@/types/promotion"
import type { PromotionFormValues } from "@/types/promotion-form"

type SearchPromotionsParams = {
  connectionName: string
  locationId: string
  lastUpdateId?: string
  filters: PromotionFilters
}

export function searchPromotions({
  connectionName,
  locationId,
  lastUpdateId,
  filters,
}: SearchPromotionsParams) {
  return dispatchEndpoint<ApiPromotionSearchItem[], SearchPromotionsParams>(
    clubmanApi.endpoints.searchPromotions,
    { connectionName, locationId, lastUpdateId, filters }
  )
}

type SavePromotionParams = {
  connectionName: string
  locationId: string
  lastUpdateId: string
  form: PromotionFormValues
}

export function savePromotion({
  connectionName,
  locationId,
  lastUpdateId,
  form,
}: SavePromotionParams) {
  return dispatchEndpoint<boolean, SavePromotionParams>(
    clubmanApi.endpoints.savePromotion,
    { connectionName, locationId, lastUpdateId, form }
  )
}
