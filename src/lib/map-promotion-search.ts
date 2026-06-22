import { formatApiDateTime } from "@/lib/format-datetime"
import type { ApiPromotionSearchItem } from "@/types/api/promotion-search"
import type { Promotion } from "@/types/promotion"

function normalizeText(value: string | null | undefined) {
  if (!value) {
    return ""
  }

  return value.replace(/\s+/g, " ").trim()
}

function formatApiDate(value: string | null | undefined) {
  if (!value) {
    return ""
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleDateString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
  })
}

function formatMoney(value: number | null | undefined) {
  if (value == null) {
    return ""
  }

  return value.toFixed(2)
}

function isExpired(endDate: string | null | undefined) {
  if (!endDate) {
    return false
  }

  const date = new Date(endDate)
  if (Number.isNaN(date.getTime())) {
    return false
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date < today
}

export function mapPromotionSearchResults(
  promotions: ApiPromotionSearchItem[]
): Promotion[] {
  return (promotions ?? []).map((item) => ({
    id: item.PromotionID,
    promotionName: normalizeText(item.PromotionName),
    promotionCode: normalizeText(item.PromotionCode),
    startDate: formatApiDate(item.StartDt),
    endDate: formatApiDate(item.EndDt),
    weekDays: normalizeText(item.WeekDays),
    walkup: normalizeText(item.WalkUp),
    phoneIn: normalizeText(item.PhoneIn),
    web: normalizeText(item.Web),
    mgr: normalizeText(item.ManagerOnly),
    useShowFee: normalizeText(item.UseShowFees),
    dayOfShowFee: formatMoney(item.DayOfShowFee),
    walkupFee: formatMoney(item.WalkUpFee),
    phoneInFee: formatMoney(item.PhoneInFee),
    ccReq: normalizeText(item.CCReq),
    lastUpdateId: normalizeText(item.LastUpdateID),
    lastUpdateDt: formatApiDateTime(item.LastUpdateDt),
    expired: isExpired(item.EndDt),
  }))
}
