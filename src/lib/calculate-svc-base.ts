import type { ApiShowData, ApiShowProperties } from "@/types/api/get-show-data"

export type OriginCode = "SRC01" | "SRC02" | "SRC03"

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
}: {
  originCode: OriginCode
  partySize: number
  showDate: string
  reservationCreatedDate: string | null
  showData: ApiShowData | null
  sectionData: ApiShowData | null | undefined
  excludePhoneDayOfShow?: boolean
  excludeWebDayOfShow?: boolean
}): number {
  if (!showData) return 0

  const isUseSectionFee = showData.IsUseSectionFee

  // 1 & 2. Pick the base fee
  let sourceFee = 0
  if (originCode === "SRC01") {
    sourceFee = isUseSectionFee
      ? sectionData?.ShowDefDetphonesvc ?? showData.PhoneCharge
      : showData.PhoneCharge
  } else if (originCode === "SRC02") {
    sourceFee = isUseSectionFee
      ? sectionData?.ShowDefDetwalkupsvc ?? showData.WalkupCharge
      : showData.WalkupCharge
  } else if (originCode === "SRC03") {
    sourceFee = isUseSectionFee
      ? sectionData?.ShowDefDetwebsvc ?? showData.WebCharge
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
