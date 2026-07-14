/** Promotion fields needed for reservation pricing. */
export type ReservationPromo = {
  id: string
  promotionCode: string
  promotionName: string
  percOff: number | null
  dollarOff: number | null
  buyTix: number | null
  buyTixFree: number | null
  price: number | null
  promoTix: number
}

export type ReservationPromoOption = {
  value: string
  label: string
}

export const EMPTY_RESERVATION_PROMO_OPTION: ReservationPromoOption = {
  value: 'none',
  label: 'Select promo code'
}
