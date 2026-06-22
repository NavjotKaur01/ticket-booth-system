import type { SearchPromotionRequest } from "@/types/api/promotion-search"
import type { PromotionFilters } from "@/types/promotion"

type BuildSearchPromotionRequestParams = {
  connectionName: string
  locationId: string
  filters: PromotionFilters
}

export function buildSearchPromotionRequest({
  connectionName,
  locationId,
  filters,
}: BuildSearchPromotionRequestParams): SearchPromotionRequest {
  return {
    Connection: connectionName,
    LocationID: locationId,
    // API DiscountType is promo category (PROMO02/03), not web/phone/walkup scope.
    DiscountType: "All Promos",
    IsShowExpired: filters.displayExpired,
    PromotionName: filters.promotionName.trim(),
    PromotionCode: filters.promotionCode.trim(),
  }
}
