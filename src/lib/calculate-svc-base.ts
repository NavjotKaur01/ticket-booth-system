import type { ApiShowData } from "@/types/api/get-show-data"
import type { ReservationPromo } from "@/types/reservation-promo"

export type OriginCode = "SRC01" | "SRC02" | "SRC03"

/** Desktop: ShowSectionFee == "Y" → IsShowSectionFee. API may send bool or Y/N. */
export function isShowSectionFeeEnabled(
  value: boolean | string | number | null | undefined
): boolean {
  if (value === true || value === 1) return true
  if (typeof value === "string") {
    const normalized = value.trim().toUpperCase()
    return normalized === "Y" || normalized === "TRUE" || normalized === "1"
  }
  return false
}

export function mapOriginToCode(origin: "phone" | "walkup" | "web"): OriginCode {
  if (origin === "web") return "SRC03"
  if (origin === "walkup") return "SRC02"
  return "SRC01"
}

export function calculateSvcBase({
  originCode,
  partySize,
  showDate,
  reservationCreatedDate,
  showData,
  sectionData,
  excludePhoneDayOfShow = false,
  excludeWebDayOfShow = false,
  /** Optional override from GetShowSections (PhoneSvcCharge / WalkupSvcCharge / WebSvcCharge). */
  sectionSvcFees,
}: {
  originCode: OriginCode
  partySize: number
  showDate: string
  reservationCreatedDate: string | null
  showData: ApiShowData | null
  sectionData: ApiShowData | null | undefined
  excludePhoneDayOfShow?: boolean
  excludeWebDayOfShow?: boolean
  sectionSvcFees?: {
    phoneSvcCharge?: number | null
    walkupSvcCharge?: number | null
    webSvcCharge?: number | null
  } | null
}): number {
  if (!showData) return 0

  const isUseSectionFee = isShowSectionFeeEnabled(showData.IsUseSectionFee)

  // Desktop CalculateServiceCharge: when Use Section Fee, prefer section SVC
  // (GetShowData ShowDefDet*svc, else GetShowSections *SvcCharge), else show-level.
  const sectionPhoneFee =
    sectionData?.ShowDefDetphonesvc ?? sectionSvcFees?.phoneSvcCharge ?? null
  const sectionWalkupFee =
    sectionData?.ShowDefDetwalkupsvc ?? sectionSvcFees?.walkupSvcCharge ?? null
  const sectionWebFee =
    sectionData?.ShowDefDetwebsvc ?? sectionSvcFees?.webSvcCharge ?? null

  // 1 & 2. Pick the base fee
  let sourceFee = 0
  if (originCode === "SRC01") {
    sourceFee = isUseSectionFee
      ? sectionPhoneFee ?? showData.PhoneCharge
      : showData.PhoneCharge
  } else if (originCode === "SRC02") {
    sourceFee = isUseSectionFee
      ? sectionWalkupFee ?? showData.WalkupCharge
      : showData.WalkupCharge
  } else if (originCode === "SRC03") {
    sourceFee = isUseSectionFee
      ? sectionWebFee ?? showData.WebCharge
      : showData.WebCharge
  }

  // 4 & 5. Day-of-show check
  let dayOfShowFee = 0
  const isToday = isSameDate(showDate, new Date())

  // Parse created date, if editing existing
  let isAdvanceBooking = false
  if (reservationCreatedDate) {
    const created = new Date(reservationCreatedDate)
    const show = new Date(showDate)
    if (!isNaN(created.getTime()) && !isNaN(show.getTime())) {
      // Compare calendar dates (ignore time)
      if (created.setHours(0, 0, 0, 0) < show.setHours(0, 0, 0, 0)) {
        isAdvanceBooking = true
      }
    }
  }

  if (isToday && !isAdvanceBooking) {
    // 6. Exclude day-of-show?
    let excluded = false
    if (originCode === "SRC01" && excludePhoneDayOfShow) {
      excluded = true
    } else if (originCode === "SRC03" && excludeWebDayOfShow) {
      excluded = true
    }
    // Walkup (SRC02) is never excluded

    if (!excluded) {
      dayOfShowFee = showData.DayOfShowCharge ?? 0
    }
  }

  // 7. Multiply by party
  return (sourceFee + dayOfShowFee) * partySize
}

function isSameDate(dateStr: string, compareTo: Date) {
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return false
  return (
    d.getFullYear() === compareTo.getFullYear() &&
    d.getMonth() === compareTo.getMonth() &&
    d.getDate() === compareTo.getDate()
  )
}

export function calculatePromoFeeAdjustment({
  promo,
  applicableTickets,
  originCode,
  showDate,
  reservationCreatedDate,
  showData,
  sectionData,
  excludePhoneDayOfShow = false,
  excludeWebDayOfShow = false,
}: {
  promo: ReservationPromo | null
  applicableTickets: number
  originCode: OriginCode
  showDate: string
  reservationCreatedDate: string | null
  showData: ApiShowData | null
  sectionData: ApiShowData | null | undefined
  excludePhoneDayOfShow?: boolean
  excludeWebDayOfShow?: boolean
}): number {
  if (!promo || promo.useShowFees !== 'N' || applicableTickets <= 0 || !showData) {
    return 0
  }

  const isUseSectionFee = isShowSectionFeeEnabled(showData.IsUseSectionFee)

  // Pick the base fee
  let showSourceFee = 0
  let promoSourceFee = 0

  if (originCode === "SRC01") {
    showSourceFee = isUseSectionFee
      ? sectionData?.ShowDefDetphonesvc ?? showData.PhoneCharge
      : showData.PhoneCharge
    promoSourceFee = promo.phoneInFee
  } else if (originCode === "SRC02") {
    showSourceFee = isUseSectionFee
      ? sectionData?.ShowDefDetwalkupsvc ?? showData.WalkupCharge
      : showData.WalkupCharge
    promoSourceFee = promo.walkUpFee
  } else if (originCode === "SRC03") {
    showSourceFee = isUseSectionFee
      ? sectionData?.ShowDefDetwebsvc ?? showData.WebCharge
      : showData.WebCharge
    promoSourceFee = promo.webFee
  }

  let showDayOfShowFee = 0
  let promoDayOfShowFee = 0
  const isToday = isSameDate(showDate, new Date())

  let isAdvanceBooking = false
  if (reservationCreatedDate) {
    const created = new Date(reservationCreatedDate)
    const show = new Date(showDate)
    if (!isNaN(created.getTime()) && !isNaN(show.getTime())) {
      if (created.setHours(0, 0, 0, 0) < show.setHours(0, 0, 0, 0)) {
        isAdvanceBooking = true
      }
    }
  }

  if (isToday && !isAdvanceBooking) {
    let excluded = false
    if (originCode === "SRC01" && excludePhoneDayOfShow) {
      excluded = true
    } else if (originCode === "SRC03" && excludeWebDayOfShow) {
      excluded = true
    }

    if (!excluded) {
      showDayOfShowFee = showData.DayOfShowCharge ?? 0
      promoDayOfShowFee = promo.dayOfShowFee
    }
  }

  const dSVCDiff = (promoSourceFee - showSourceFee) + (promoDayOfShowFee - showDayOfShowFee)
  return dSVCDiff * applicableTickets
}
