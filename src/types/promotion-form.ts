export type YesNo = "yes" | "no"

export type LimitPerPassType = "dollar" | "tickets"

export type DiscountType =
  | "discount-options"
  | "amount"
  | "free-tickets"
  | "set-price"

export type AmountDiscountKind = "dollar" | "percentage"

/** Free Tickets sub-mode — Buy X Get Y Free vs Special Promotion (Admit N). */
export type FreeTicketsKind = "buy" | "special-promotion" | ""

export type PromotionFormValues = {
  promotionName: string
  promotionCode: string
  walkUp: boolean
  phoneIn: boolean
  web: boolean
  managerComp: boolean
  validDays: Record<string, boolean>
  ccRequired: YesNo
  startDate: string
  endDate: string
  overrideShowFees: YesNo
  dayOfShowFee: string
  walkupFee: string
  phoneFee: string
  webFee: string
  overrideCcFee: YesNo
  discountType: DiscountType
  amountDiscountKind: AmountDiscountKind
  dollarOff: string
  percOff: string
  freeTicketsKind: FreeTicketsKind
  buyTix: string
  buyTixFree: string
  /** Special Promotion label (SpecialReq) — display/reference only; max 100 chars. */
  specialReq: string
  setPrice: string
  minimumTickets: string
  limitPerPassType: LimitPerPassType
  maximumDiscount: string
  maximumTickets: string
}

function todayDateValue() {
  const date = new Date()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${date.getFullYear()}-${month}-${day}`
}

export const EMPTY_VALID_DAYS: Record<string, boolean> = {
  sun: false,
  mon: false,
  tue: false,
  wed: false,
  thu: false,
  fri: false,
  sat: false,
}

export const EMPTY_PROMOTION_FORM: PromotionFormValues = {
  promotionName: "",
  promotionCode: "",
  walkUp: true,
  phoneIn: true,
  web: true,
  managerComp: false,
  validDays: { ...EMPTY_VALID_DAYS },
  ccRequired: "yes",
  startDate: todayDateValue(),
  endDate: "",
  overrideShowFees: "yes",
  dayOfShowFee: "1.00",
  walkupFee: "0.00",
  phoneFee: "0.00",
  webFee: "0.00",
  overrideCcFee: "no",
  discountType: "discount-options",
  amountDiscountKind: "dollar",
  dollarOff: "",
  percOff: "",
  freeTicketsKind: "",
  buyTix: "",
  buyTixFree: "",
  specialReq: "",
  setPrice: "",
  minimumTickets: "",
  limitPerPassType: "dollar",
  maximumDiscount: "",
  maximumTickets: "",
}

export function createEmptyPromotionForm(): PromotionFormValues {
  return {
    ...EMPTY_PROMOTION_FORM,
    validDays: { ...EMPTY_VALID_DAYS },
    startDate: todayDateValue(),
  }
}
