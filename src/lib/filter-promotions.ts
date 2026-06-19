import type { Promotion, PromotionFilters } from "@/types/promotion"

function matches(value: string, query: string) {
  if (!query.trim()) return true
  return value.toLowerCase().includes(query.trim().toLowerCase())
}

function matchesScope(row: Promotion, scope: string) {
  switch (scope) {
    case "web":
      return row.web === "Y"
    case "phone-in":
      return row.phoneIn === "Y"
    case "walkup":
      return row.walkup === "Y"
    default:
      return true
  }
}

export function filterPromotions(
  rows: Promotion[],
  filters: PromotionFilters
): Promotion[] {
  return rows.filter((row) => {
    if (!filters.displayExpired && row.expired) return false
    if (!matches(row.promotionName, filters.promotionName)) return false
    if (!matches(row.promotionCode, filters.promotionCode)) return false
    if (!matchesScope(row, filters.promoScope)) return false
    return true
  })
}
