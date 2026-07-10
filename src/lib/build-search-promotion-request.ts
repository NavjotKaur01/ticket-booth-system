import { getPromotionDiscountApiCode } from "@/data/promotions"
import { formatDesktopDateTime, formatUsDateTime } from "@/lib/format-us-datetime"
import type { SearchPromotionRequest } from "@/types/api/promotion-search"
import type { PromotionFilters } from "@/types/promotion"

type BuildSearchPromotionRequestParams = {
  connectionName: string
  locationId: string
  lastUpdateId?: string
  filters: PromotionFilters
}

export function buildSearchPromotionRequest({
  connectionName,
  locationId,
  lastUpdateId = "",
  filters,
}: BuildSearchPromotionRequestParams): SearchPromotionRequest {
  const now = new Date()
  const endOfToday = new Date(now)
  endOfToday.setHours(0, 0, 0, 0)

  return {
    Connection: connectionName,
    LocationID: locationId,
    LastUpdateID: lastUpdateId,
    LastUpdateDt: formatDesktopDateTime(now),
    DiscountType: getPromotionDiscountApiCode(filters.discountType),
    IsShowExpired: filters.displayExpired,
    PromotionName: filters.promotionName.trim(),
    PromotionCode: filters.promotionCode.trim(),
    // Desktop: reqModel.EndDt = DateTime.Now.Date
    EndDt: formatUsDateTime(endOfToday),
  }
}
