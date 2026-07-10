import type { Promotion, PromotionFilters } from "@/types/promotion"

/**
 * Desktop relies on SearchPromotion API filtering.
 * Keep a light client pass-through for name/code only as a safety net.
 */
export function filterPromotions(
  rows: Promotion[],
  filters: PromotionFilters
): Promotion[] {
  const nameQuery = filters.promotionName.trim().toLowerCase()
  const codeQuery = filters.promotionCode.trim().toLowerCase()

  if (!nameQuery && !codeQuery) {
    return rows
  }

  return rows.filter((row) => {
    if (nameQuery && !row.promotionName.toLowerCase().includes(nameQuery)) {
      return false
    }
    if (codeQuery && !row.promotionCode.toLowerCase().includes(codeQuery)) {
      return false
    }
    return true
  })
}
