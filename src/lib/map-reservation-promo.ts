import type { ApiPromotionSearchItem } from '@/types/api/promotion-search'
import {
  type ReservationPromo,
  type ReservationPromoOption
} from '@/types/reservation-promo'

function normalizeText(value: string | null | undefined) {
  return value?.trim() ?? ''
}

export function mapReservationPromo(
  item: ApiPromotionSearchItem
): ReservationPromo {
  return {
    id: item.PromotionID,
    promotionCode: normalizeText(item.PromotionCode),
    promotionName: normalizeText(item.PromotionName),
    percOff: item.PercOff,
    dollarOff: item.DollarOff,
    buyTix: item.BuyTix,
    buyTixFree: item.BuyTixFree,
    price: item.Price,
    promoTix: item.PromoTix ?? 0
  }
}

export function mapReservationPromoOptions(
  promos: ReservationPromo[]
): ReservationPromoOption[] {
  return promos.map(promo => ({
    value: promo.id,
    label: promo.promotionCode || promo.promotionName
  }))
}
