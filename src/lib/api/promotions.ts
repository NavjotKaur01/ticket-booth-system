import { administratorApiPath, apiRequest } from "@/lib/api/client"
import { buildSearchPromotionRequest } from "@/lib/build-search-promotion-request"
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
  return apiRequest<ApiPromotionSearchItem[]>(
    administratorApiPath("SearchPromotion"),
    {
      method: "PUT",
      body: JSON.stringify(
        buildSearchPromotionRequest({
          connectionName,
          locationId,
          filters,
        })
      ),
    }
  )
}
