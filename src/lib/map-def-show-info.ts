import { toShowDefDayId } from "@/lib/show-time-day"
import type { ApiDefShowItem } from "@/types/api/show-def"
import type { SectionLookupItem } from "@/types/api/system-lookup"
import {
  createEmptyShowTimeForm,
  type ShowTimeFormValues,
  type ShowTimeSectionDraft,
} from "@/types/show-time"

function text(value: string | null | undefined) {
  return (value ?? "").trim()
}

function isYes(value: string | null | undefined) {
  return text(value).toUpperCase() === "Y"
}

function toTimeInput(value: string | null | undefined): string {
  if (!value) return "19:00"
  const match = String(value).match(/T?(\d{1,2}):(\d{2})/)
  if (!match) return "19:00"
  return `${String(Number.parseInt(match[1], 10)).padStart(2, "0")}:${match[2]}`
}

function money(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return "0.00"
  return Number(value).toFixed(2)
}

function resolveSectionId(
  sectionCode: string | null | undefined,
  sectionLookups: SectionLookupItem[]
) {
  const code = text(sectionCode)
  if (!code) return ""
  const match = sectionLookups.find((item) => item.code === code)
  return match?.code ?? code
}

/** Maps GetDefShowInfo rows into the Add/Edit show-time form. */
export function mapDefShowInfoToForm(
  items: ApiDefShowItem[],
  sectionLookups: SectionLookupItem[] = []
): ShowTimeFormValues {
  const form = createEmptyShowTimeForm()
  if (!items.length) return form

  const first = items[0]
  const dayId = toShowDefDayId(first.ShowDefDay)

  form.dayOfWeek = dayId
  form.alsoAppliesTo = {
    sun: false,
    mon: false,
    tue: false,
    wed: false,
    thu: false,
    fri: false,
    sat: false,
    [dayId]: true,
  }
  form.showTime = toTimeInput(first.ShowDefTime)
  form.arrivalTime = toTimeInput(first.ShowDefArrival)
  form.dinner = isYes(first.ShowDefDinner)
  form.noPasses = isYes(first.ShowDefNPasses)
  form.vipSeating = isYes(first.ShowDefVIP)
  form.age21Plus = isYes(first.ShowDef21)
  form.hub = text(first.ShowDefHub).toUpperCase() !== "N"

  form.sections = items
    .filter((item) => text(item.ShowDetID) || text(item.ShowDetSec))
    .map((item): ShowTimeSectionDraft => ({
      id: text(item.ShowDetID) || crypto.randomUUID(),
      sectionId: resolveSectionId(item.ShowDetSec, sectionLookups),
      price: money(item.ShowDetPrice),
      walkupFee: money(item.ShowDefDetwalkupsvc),
      phoneFee: money(item.ShowDefDetphonesvc),
      webFee: money(item.ShowDefDetwebsvc),
      seats: String(item.ShowDetNon ?? 0),
      showOnWeb: isYes(item.ShowDetWeb),
      restrictShowPromo: isYes(item.ShowRestrictedPromo),
    }))

  return form
}
