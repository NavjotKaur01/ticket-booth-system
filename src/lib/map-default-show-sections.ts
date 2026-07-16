import type { ApiDefaultShowSection } from "@/types/api/save-show"
import type {
  AddShowDialogData,
  ShowTimeOption,
} from "@/types/calendar-show"
import { formatDateForDisplay } from "@/lib/date-display-format"
import { formatShowTime } from "@/lib/format-show-time"
import { weekdayIndexToName } from "@/lib/recurrence/recurrence-date-utils"

const AGE_RESTRICTIONS = [
  { value: "", label: "Blank", description: "Do not show age on web" },
  { value: "A", label: "A - (All ages)", description: "All ages" },
  { value: "Y", label: "Y (21 and over)", description: "Over 21" },
  { value: "N", label: "N (18 and over)", description: "Over 18" },
  { value: "S", label: "S (custom)", description: "Special case set min age" },
]

const WEEKDAY_NAME_PATTERN =
  /^(sunday|monday|tuesday|wednesday|thursday|friday|saturday)$/i

function formatTimeRange(showTim: string | null, showArrival: string | null) {
  const format = (value: string | null) => {
    if (!value) {
      return ""
    }

    return formatShowTime(value, { seconds: false }) ?? ""
  }

  const arrival = format(showArrival)
  const showTime = format(showTim)
  if (arrival && showTime) {
    return `${arrival} - ${showTime}`
  }

  return arrival || showTime || "Show time"
}

function yn(value: string | null | undefined) {
  return value?.trim().toUpperCase() === "Y"
}

/** Prefer weekday name (e.g. Tuesday); never a calendar date. */
function formatShowDayLabel(
  showDay: string | null | undefined,
  weekDay: number | null | undefined
) {
  const dayName = showDay?.trim() ?? ""
  if (dayName && WEEKDAY_NAME_PATTERN.test(dayName)) {
    return dayName
  }

  if (typeof weekDay === "number" && weekDay >= 0 && weekDay <= 6) {
    return weekdayIndexToName(weekDay)
  }

  if (dayName && !formatDateForDisplay(dayName, "")) {
    return dayName
  }

  return dayName || "Show"
}

export function mapDefaultShowSectionsToDialogData(
  sections: ApiDefaultShowSection[],
  performers: AddShowDialogData["performers"]
): Omit<AddShowDialogData, "sectionLookups"> {
  const sorted = [...sections].sort((left, right) => {
    if (left.WeekDay !== right.WeekDay) {
      return left.WeekDay - right.WeekDay
    }

    // Latest arrival/show times first (e.g. 9:45, then 9:30, then 7:35)
    const leftArrival = new Date(left.ShowArrival ?? left.ShowTim ?? 0).getTime()
    const rightArrival = new Date(right.ShowArrival ?? right.ShowTim ?? 0).getTime()
    if (leftArrival !== rightArrival) {
      return rightArrival - leftArrival
    }

    const leftTime = new Date(left.ShowTim ?? 0).getTime()
    const rightTime = new Date(right.ShowTim ?? 0).getTime()
    return rightTime - leftTime
  })

  const grouped = new Map<string, ApiDefaultShowSection[]>()

  for (const section of sorted) {
    const key = section.ShowDefID
    const current = grouped.get(key) ?? []
    current.push(section)
    grouped.set(key, current)
  }

  const showTimes: ShowTimeOption[] = Array.from(grouped.entries()).map(
    ([showDefId, rows]) => {
      const first = rows[0]
      return {
        id: showDefId,
        dayLabel: formatShowDayLabel(first.ShowDay, first.WeekDay),
        timeRange: formatTimeRange(first.ShowTim, first.ShowArrival),
        enabled: true,
        sections: rows.map((row) => ({
          id: row.ShowDetID,
          section: row.Section ?? "Section",
          price: row.ShowPrice ?? 0,
          seats: row.ShowNon ?? 0,
          restrictShowPromo: yn(row.ShowDetRestrictPromo),
          web: yn(row.Web),
          walkupFee: row.ShowDefDetwalkupsvc,
          phoneFee: row.ShowDefDetphonesvc,
          webFee: row.ShowDefDetwebsvc,
        })),
      }
    }
  )

  return {
    performers,
    ageRestrictions: AGE_RESTRICTIONS,
    showTimes,
    sectionRows: sorted,
  }
}

export function buildSaveShowFilterList(
  sectionRows: ApiDefaultShowSection[],
  selectedShowTimeIds: string[]
) {
  const selected = new Set(selectedShowTimeIds)
  return sectionRows.filter((row) => selected.has(row.ShowDefID))
}
