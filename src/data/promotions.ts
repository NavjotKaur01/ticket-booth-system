/**
 * Search-page discount filter options — matches ClubMan PromotionVM.GetLookupList(true).
 * API codes: All Promos literal; PROMO01/02/03 from LookupType PROMO
 * (Discount / Free Tickets / Set Price — see ReservationVMHelper).
 */
export const promotionDiscountOptions = [
  { id: "all-promos", label: "All Promos", apiCode: "All Promos" },
  { id: "discount", label: "Discount", apiCode: "PROMO01" },
  { id: "free-tickets", label: "Free Tickets", apiCode: "PROMO02" },
  { id: "set-price", label: "Set Price", apiCode: "PROMO03" },
] as const

export type PromotionDiscountOptionId =
  (typeof promotionDiscountOptions)[number]["id"]

/** @deprecated Use promotionDiscountOptions — kept for any stray imports */
export const promotionScopeOptions = promotionDiscountOptions

export function getPromotionDiscountApiCode(optionId: string): string {
  const match = promotionDiscountOptions.find((option) => option.id === optionId)
  return match?.apiCode ?? "All Promos"
}

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
