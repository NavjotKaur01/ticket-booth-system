/**
 * Promotion discount lookups — mirrors ClubMan PromotionVM.GetLookupList.
 *
 * Search (isSearchWindow=true):
 *   1. "Discount options" (LookUpCode = "")  ← default SelectedIndex 0
 *   2. "All Promos"       (LookUpCode = "All Promos")
 *   3+. PROMO lookups ordered by LookUpDesc (Discount, Free Tickets, Set Price)
 *
 * Form (isSearchWindow=false): same without "All Promos".
 */

const PROMO_LOOKUP_OPTIONS = [
  { id: "discount", label: "Discount", apiCode: "PROMO01" },
  { id: "free-tickets", label: "Free Tickets", apiCode: "PROMO02" },
  { id: "set-price", label: "Set Price", apiCode: "PROMO03" },
] as const

/** Search-page filter options — GetLookupList(true) */
export const promotionDiscountOptions = [
  { id: "discount-options", label: "Discount options", apiCode: "" },
  { id: "all-promos", label: "All Promos", apiCode: "All Promos" },
  ...PROMO_LOOKUP_OPTIONS,
] as const

/** Add/Edit form options — GetLookupList(false); no "All Promos" */
export const promotionFormDiscountOptions = [
  { id: "discount-options", label: "Discount options", apiCode: "" },
  ...PROMO_LOOKUP_OPTIONS,
] as const

export type PromotionDiscountOptionId =
  (typeof promotionDiscountOptions)[number]["id"]

/** @deprecated Use promotionDiscountOptions — kept for any stray imports */
export const promotionScopeOptions = promotionDiscountOptions

/** ClubMan default DiscountType on search and add/edit constructors */
export const DEFAULT_PROMOTION_DISCOUNT_TYPE = "discount-options" as const

export function getPromotionDiscountApiCode(optionId: string): string {
  const match = promotionDiscountOptions.find((option) => option.id === optionId)
  // Desktop: LookUpCode for "Discount options" is string.Empty
  return match?.apiCode ?? ""
}

/** Add/Edit form select — GetLookupList(false); maps to form discountType ids */
export const promotionFormDiscountSelectOptions = [
  { id: "discount-options", label: "Discount options" },
  { id: "amount", label: "Discount" },
  { id: "free-tickets", label: "Free Tickets" },
  { id: "set-price", label: "Set Price" },
] as const

/** Form discountType → ClubMan lookup code for SavePromotion */
export function getPromotionFormDiscountApiCode(
  discountType: "amount" | "free-tickets" | "set-price"
): string {
  switch (discountType) {
    case "free-tickets":
      return "PROMO02"
    case "set-price":
      return "PROMO03"
    case "amount":
    default:
      return "PROMO01"
  }
}
