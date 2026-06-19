export type LimitPerPassType = "dollar" | "tickets"

export type PromotionFormValues = {
  promotionName: string
  promotionCode: string
  walkUp: boolean
  phoneIn: boolean
  web: boolean
  managerComp: boolean
  validDays: Record<string, boolean>
  ccRequired: string
  startDate: string
  endDate: string
  showFees: boolean
  dayOfShowFee: string
  walkupFee: string
  phoneFee: string
  webFee: string
  overrideCcFee: boolean
  discountOption: string
  minimumTickets: string
  limitPerPassType: LimitPerPassType
  maximumDiscount: string
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
  ccRequired: "cc-required",
  startDate: todayDateValue(),
  endDate: "",
  showFees: true,
  dayOfShowFee: "1.00",
  walkupFee: "0.00",
  phoneFee: "0.00",
  webFee: "0.00",
  overrideCcFee: false,
  discountOption: "",
  minimumTickets: "",
  limitPerPassType: "dollar",
  maximumDiscount: "",
}

export function createEmptyPromotionForm(): PromotionFormValues {
  return {
    ...EMPTY_PROMOTION_FORM,
    validDays: { ...EMPTY_VALID_DAYS },
    startDate: todayDateValue(),
  }
}
