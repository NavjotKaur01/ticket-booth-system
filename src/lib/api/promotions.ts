import { dispatchEndpoint } from "@/lib/api/dispatch-endpoint"
import { clubmanApi } from "@/store/api/clubmanApi"
import type { ApiPromotionSearchItem } from "@/types/api/promotion-search"
import type { PromotionFilters } from "@/types/promotion"

type SearchPromotionsParams = {
  connectionName: string
  locationId: string
  filters: PromotionFilters
}

export function searchPromotions({
  connectionName,
  locationId,
  filters,
}: SearchPromotionsParams) {
  return dispatchEndpoint<ApiPromotionSearchItem[], SearchPromotionsParams>(
    clubmanApi.endpoints.searchPromotions,
    { connectionName, locationId, filters }
  )
}
