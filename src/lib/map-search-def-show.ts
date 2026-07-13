import type { ApiDefShowItem } from "@/types/api/show-def"
import type { SectionLookupItem } from "@/types/api/system-lookup"
import type { ShowTimeRow } from "@/types/show-time"
import { toShowDefDayId } from "@/lib/show-time-day"

function text(value: string | null | undefined) {
  return (value ?? "").trim()
}

function yn(value: string | null | undefined, fallback = "N") {
  const normalized = text(value).toUpperCase()
  if (normalized === "Y" || normalized === "N") return normalized
  return fallback
}

function formatPrice(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return "$0.00"
  return `$${Number(value).toFixed(2)}`
}

function resolveSectionLabel(
  sectionCode: string | null | undefined,
  sectionLookups: SectionLookupItem[]
) {
  const code = text(sectionCode)
  if (!code) return ""
  const match = sectionLookups.find((item) => item.code === code)
  return match?.description || code
}

/**
 * Maps Adminstrator/SearchDefShow rows the same way ShowTimesVM builds ShowDetailList.
 */
export function mapSearchDefShowResults(
  items: ApiDefShowItem[],
  sectionLookups: SectionLookupItem[] = []
): ShowTimeRow[] {
  return (items ?? []).map((item, index) => {
    const showDefId = text(item.ShowDefID) || `show-def-${index}`
    const showDetId = text(item.ShowDetID) || `${showDefId}-${index}`
    const hubRaw = text(item.ShowDefHub).toUpperCase()

    return {
      id: showDetId,
      groupId: showDefId,
      dayOfWeek: toShowDefDayId(item.ShowDefDay),
      startTime: item.ShowDefTime ? String(item.ShowDefTime) : "",
      arrivalTime: item.ShowDefArrival ? String(item.ShowDefArrival) : "",
      dinner: yn(item.ShowDefDinner),
      noPasses: yn(item.ShowDefNPasses),
      age21Plus: yn(item.ShowDef21),
      // Desktop: anything other than explicit "N" displays as "Y"
      hub: hubRaw === "N" ? "N" : "Y",
      section: resolveSectionLabel(item.ShowDetSec, sectionLookups),
      price: formatPrice(item.ShowDetPrice),
      seats: Number(item.ShowDetNon ?? 0) || 0,
      restrictedPromo: yn(item.ShowRestrictedPromo),
      web: yn(item.ShowDetWeb),
    }
  })
}
