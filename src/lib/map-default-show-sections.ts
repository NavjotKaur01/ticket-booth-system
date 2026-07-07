import type { ApiDefaultShowSection } from "@/types/api/save-show"
import type {
  AddShowDialogData,
  ShowTimeOption,
} from "@/types/calendar-show"
import { formatDateForDisplay } from "@/lib/date-display-format"

const AGE_RESTRICTIONS = [
  { value: "A", label: "A - All ages", description: "All ages" },
  { value: "Y", label: "Y - Over 21", description: "Over 21" },
  { value: "N", label: "N - Over 18", description: "Over 18" },
  { value: "S", label: "S - Special case", description: "Special case set min age" },
]

function formatTimeRange(showTim: string | null, showArrival: string | null) {
  const format = (value: string | null) => {
    if (!value) {
      return ""
    }

    const date = new Date(value)
    if (Number.isNaN(date.getTime())) {
      return value
    }

    return date.toLocaleString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  const start = format(showTim)
  const end = format(showArrival)
  if (start && end) {
    return `${start} - ${end}`
  }

  return start || end || "Show time"
}

function yn(value: string | null | undefined) {
  return value?.trim().toUpperCase() === "Y"
}

function formatShowDayLabel(
  showDay: string | null | undefined,
  showDate: string | null | undefined
) {
  const formattedDate =
    formatDateForDisplay(showDate, "") || formatDateForDisplay(showDay, "")

  return formattedDate || showDay || "Show"
}

export function mapDefaultShowSectionsToDialogData(
  sections: ApiDefaultShowSection[],
  performers: AddShowDialogData["performers"]
): Omit<AddShowDialogData, "sectionLookups"> {
  const sorted = [...sections].sort((left, right) => {
    if (left.WeekDay !== right.WeekDay) {
      return left.WeekDay - right.WeekDay
    }

    const leftTime = new Date(left.ShowTim ?? 0).getTime()
    const rightTime = new Date(right.ShowTim ?? 0).getTime()
    return leftTime - rightTime
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
        dayLabel: formatShowDayLabel(first.ShowDay, first.ShowDate),
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
