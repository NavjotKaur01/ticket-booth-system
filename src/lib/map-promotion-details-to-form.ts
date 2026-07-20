import { weekDayOptions } from "@/data/promotion-form-options"
import {
  createEmptyPromotionForm,
  type PromotionFormValues,
  type YesNo,
} from "@/types/promotion-form"
import type { ApiPromotionSearchItem } from "@/types/api/promotion-search"

function normalizeText(value: string | null | undefined) {
  if (!value) return ""
  return value.replace(/\s+/g, " ").trim()
}

function isYesFlag(value: string | null | undefined): boolean {
  return normalizeText(value).toUpperCase() === "Y"
}

function toYesNo(value: boolean): YesNo {
  return value ? "yes" : "no"
}

function toDateInput(value: string | null | undefined): string {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/)
    return match ? `${match[1]}-${match[2]}-${match[3]}` : ""
  }
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${date.getFullYear()}-${month}-${day}`
}

function toNumberString(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return ""
  return String(value)
}

function toMoneyString(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return ""
  return value.toFixed(2)
}

function mapDiscountType(
  discountType: string | null | undefined,
  item: ApiPromotionSearchItem
): Pick<
  PromotionFormValues,
  | "discountType"
  | "amountDiscountKind"
  | "dollarOff"
  | "percOff"
  | "freeTicketsKind"
  | "buyTix"
  | "buyTixFree"
  | "specialReq"
  | "setPrice"
> {
  const code = normalizeText(discountType).toUpperCase()
  const hasDollarOff = item.DollarOff != null
  const hasPercOff = item.PercOff != null
  const hasBuy =
    item.BuyTix != null || item.BuyTixFree != null
  const hasSetPrice = item.Price != null
  const specialReq = normalizeText(item.SpecialReq)
  const isSpecialFreeTickets = Boolean(specialReq)

  if (code === "PROMO02" || (!code && (hasBuy || isSpecialFreeTickets))) {
    if (isSpecialFreeTickets) {
      return {
        discountType: "free-tickets",
        amountDiscountKind: "dollar",
        dollarOff: "",
        percOff: "",
        freeTicketsKind: "special-promotion",
        buyTix: "",
        buyTixFree: "",
        specialReq: specialReq.slice(0, 100),
        setPrice: "",
      }
    }

    return {
      discountType: "free-tickets",
      amountDiscountKind: "dollar",
      dollarOff: "",
      percOff: "",
      freeTicketsKind: "buy",
      buyTix: toNumberString(item.BuyTix),
      buyTixFree: toNumberString(item.BuyTixFree),
      specialReq: "",
      setPrice: "",
    }
  }

  if (code === "PROMO03" || (!code && hasSetPrice)) {
    return {
      discountType: "set-price",
      amountDiscountKind: "dollar",
      dollarOff: "",
      percOff: "",
      freeTicketsKind: "",
      buyTix: "",
      buyTixFree: "",
      specialReq: "",
      setPrice: toMoneyString(item.Price),
    }
  }

  return {
    discountType: "amount",
    amountDiscountKind: hasPercOff && !hasDollarOff ? "percentage" : "dollar",
    dollarOff: toMoneyString(item.DollarOff),
    percOff: toNumberString(item.PercOff),
    freeTicketsKind: "",
    buyTix: "",
    buyTixFree: "",
    specialReq: "",
    setPrice: "",
  }
}

function mapValidDays(weekDays: string | null | undefined): Record<string, boolean> {
  const days = normalizeText(weekDays)
  const validDays: Record<string, boolean> = {}
  weekDayOptions.forEach((day, index) => {
    validDays[day.id] = days.includes(String(index + 1))
  })
  return validDays
}

/** Maps desktop `GetPromotionDetails` / `PromotionModel` into the add/edit form. */
export function mapPromotionDetailsToForm(
  item: ApiPromotionSearchItem
): PromotionFormValues {
  const useShowFees = isYesFlag(item.UseShowFees)
  const hasDollarMax = item.DollarMax != null
  const hasTixMax = item.TixMax != null
  const discount = mapDiscountType(item.DiscountType, item)

  return {
    ...createEmptyPromotionForm(),
    promotionName: normalizeText(item.PromotionName),
    promotionCode: normalizeText(item.PromotionCode),
    walkUp: isYesFlag(item.WalkUp),
    phoneIn: isYesFlag(item.PhoneIn),
    web: isYesFlag(item.Web),
    managerComp: isYesFlag(item.ManagerOnly),
    validDays: mapValidDays(item.WeekDays),
    ccRequired: toYesNo(isYesFlag(item.CCReq)),
    startDate: toDateInput(item.StartDt),
    endDate: toDateInput(item.EndDt),
    // Desktop UseShowFees=Y → IsShowFees checked → fee inputs disabled.
    overrideShowFees: toYesNo(useShowFees),
    dayOfShowFee: toMoneyString(item.DayOfShowFee) || "1.00",
    walkupFee: toMoneyString(item.WalkUpFee) || "0.00",
    phoneFee: toMoneyString(item.PhoneInFee) || "0.00",
    webFee: toMoneyString(item.WebFee) || "0.00",
    overrideCcFee: toYesNo(Boolean(item.overrideccfee)),
    ...discount,
    minimumTickets: toNumberString(item.MinTix),
    limitPerPassType: hasTixMax && !hasDollarMax ? "tickets" : "dollar",
    maximumDiscount: toMoneyString(item.DollarMax),
    maximumTickets: toNumberString(item.TixMax),
  }
}
