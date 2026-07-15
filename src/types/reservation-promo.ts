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
  minTix: number | null
  tixMax: number | null
  dollarMax: number | null
  discountType: string
  useShowFees: 'Y' | 'N'
  phoneInFee: number
  walkUpFee: number
  webFee: number
  dayOfShowFee: number
}

export type ReservationPromoOption = {
  value: string
  label: string
}

export const EMPTY_RESERVATION_PROMO_OPTION: ReservationPromoOption = {
  value: 'none',
  label: 'Select promo code'
}
