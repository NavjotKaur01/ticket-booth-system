import { getPromotionFormDiscountApiCode } from "@/data/promotions"
import { weekDayOptions } from "@/data/promotion-form-options"
import {
  formatDesktopDateTime,
  formatUsDateTime,
} from "@/lib/format-us-datetime"
import type { SavePromotionRequest } from "@/types/api/save-promotion"
import type { PromotionFormValues } from "@/types/promotion-form"

type BuildSavePromotionRequestParams = {
  connectionName: string
  locationId: string
  lastUpdateId: string
  form: PromotionFormValues
}

function parseOptionalNumber(value: string): number | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  const parsed = Number(trimmed)
  return Number.isFinite(parsed) ? parsed : null
}

function parseDateInput(value: string): Date | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  const parsed = new Date(`${trimmed}T00:00:00`)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function buildShowDay(validDays: Record<string, boolean>): string {
  const allSelected = weekDayOptions.every((day) => validDays[day.id])
  if (allSelected) {
    return "1234567"
  }

  // Desktop: Sun=1 … Sat=7
  return weekDayOptions
    .map((day, index) => (validDays[day.id] ? String(index + 1) : ""))
    .join("")
}

export function buildSavePromotionRequest({
  connectionName,
  locationId,
  lastUpdateId,
  form,
}: BuildSavePromotionRequestParams): SavePromotionRequest {
  const now = new Date()
  const startDate = parseDateInput(form.startDate) ?? now
  const endDate = parseDateInput(form.endDate)

  // Desktop IsShowFees=true → use show fees (inputs disabled). React overrideShowFees=yes → custom fees.
  const isShowFees = form.overrideShowFees === "no"
  const isAmount = form.discountType === "amount"
  const isFreeTickets = form.discountType === "free-tickets"
  const isSetPrice = form.discountType === "set-price"
  const isDollarOff = isAmount && form.amountDiscountKind === "dollar"
  const isPercOff = isAmount && form.amountDiscountKind === "percentage"
  const isLimitDollar = form.limitPerPassType === "dollar"

  const request: SavePromotionRequest = {
    Connection: connectionName,
    LocationID: locationId,
    LastUpdateID: lastUpdateId,
    LastUpdateDt: formatDesktopDateTime(now),
    PromotionName: form.promotionName.trim(),
    PromotionCode: form.promotionCode.trim(),
    StartDt: formatUsDateTime(startDate),
    EndDt: endDate ? formatUsDateTime(endDate) : null,
    IsWalkup: form.walkUp,
    IsPhoneIn: form.phoneIn,
    IsWeb: form.web,
    IsManagerComp: form.managerComp,
    IsShowFees: isShowFees,
    DayOfShowFee: !isShowFees ? parseOptionalNumber(form.dayOfShowFee) : null,
    WalkUpFee: !isShowFees ? parseOptionalNumber(form.walkupFee) : null,
    PhoneInFee: !isShowFees ? parseOptionalNumber(form.phoneFee) : null,
    WebFee: !isShowFees ? parseOptionalNumber(form.webFee) : null,
    CreditCard: form.ccRequired === "yes" ? "Yes" : "No",
    ShowDay: buildShowDay(form.validDays),
    MinTix: parseOptionalNumber(form.minimumTickets),
    IsAdditionalAmountDoller: isLimitDollar,
    IsAdditionalAmountTicket: !isLimitDollar,
    DollarMax: isLimitDollar
      ? parseOptionalNumber(form.maximumDiscount)
      : null,
    TixMax: !isLimitDollar ? parseOptionalNumber(form.maximumTickets) : null,
    DiscountType: getPromotionFormDiscountApiCode(form.discountType),
    IsOverrideCCFee: form.overrideCcFee === "yes",
    IsDiscountAmountDoller: isDollarOff,
    IsDiscountAmountPercentage: isPercOff,
    IsBuy: isFreeTickets,
    IsSpecialPromotion: false,
  }

  if (isDollarOff) {
    request.DollarOff = parseOptionalNumber(form.dollarOff)
  }
  if (isPercOff) {
    request.PercOff = parseOptionalNumber(form.percOff)
  }
  if (isFreeTickets) {
    request.BuyTix = parseOptionalNumber(form.buyTix)
    request.BuyTixFree = parseOptionalNumber(form.buyTixFree) ?? 0
  }
  if (isSetPrice) {
    request.Price = parseOptionalNumber(form.setPrice) ?? 0
  }

  return request
}
