import { formatDesktopDateTime } from "@/lib/format-us-datetime"
import { listAlsoAppliesDayNames, toShowDefDayName } from "@/lib/show-time-day"
import type {
  ShowDefLookupModel,
  ShowDefRequestModel,
  ShowDefSectionDetModel,
} from "@/types/api/show-def"
import type { SectionLookupItem } from "@/types/api/system-lookup"
import type { ShowTimeFormValues, ShowTimeSectionDraft } from "@/types/show-time"

function parseMoney(value: string) {
  const parsed = Number.parseFloat(value.replace(/[^0-9.-]/g, ""))
  return Number.isFinite(parsed) ? parsed : 0
}

function parseSeats(value: string) {
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) ? parsed : 0
}

/** Combine today's date with an HH:mm time, matching desktop DateTime fields. */
export function combineTodayWithTime(hhmm: string): string {
  const now = new Date()
  const [rawHours, rawMinutes] = hhmm.split(":")
  const hours = Number.parseInt(rawHours ?? "0", 10)
  const minutes = Number.parseInt(rawMinutes ?? "0", 10)
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  const hh = String(Number.isFinite(hours) ? hours : 0).padStart(2, "0")
  const mm = String(Number.isFinite(minutes) ? minutes : 0).padStart(2, "0")
  return `${year}-${month}-${day}T${hh}:${mm}:00`
}

function resolveSectionCode(
  sectionId: string,
  sectionLookups: SectionLookupItem[]
) {
  const match =
    sectionLookups.find((item) => item.code === sectionId) ??
    sectionLookups.find((item) => item.description === sectionId)
  return match?.code ?? sectionId
}

function mapSections(
  sections: ShowTimeSectionDraft[],
  form: ShowTimeFormValues,
  sectionLookups: SectionLookupItem[],
  includeDetIds: boolean
): ShowDefSectionDetModel[] {
  const dinner = form.dinner ? "Y" : "N"
  return sections.map((section) => ({
    ...(includeDetIds ? { ShowDetID: section.id } : {}),
    ShowDinner: dinner,
    ShowPrice: parseMoney(section.price),
    ShowSmoking: 0,
    ShowNon: parseSeats(section.seats),
    Web: section.showOnWeb ? "Y" : "N",
    RestrictPromoForSection: section.restrictShowPromo ? "Y" : "N",
    walkupsvccharge: parseMoney(section.walkupFee),
    phonesvccharge: parseMoney(section.phoneFee),
    websvccharge: parseMoney(section.webFee),
    ShowSec: resolveSectionCode(section.sectionId, sectionLookups),
  }))
}

function buildNewLookupList(
  sections: ShowTimeSectionDraft[],
  sectionLookups: SectionLookupItem[]
): ShowDefLookupModel[] {
  const result: ShowDefLookupModel[] = []
  const seen = new Set<string>()

  for (const section of sections) {
    const code = resolveSectionCode(section.sectionId, sectionLookups)
    const known = sectionLookups.some((item) => item.code === code)
    if (known || seen.has(code)) continue
    seen.add(code)
    const label =
      sectionLookups.find((item) => item.code === code)?.description ??
      section.sectionId
    result.push({
      LookupCode: code,
      LookupType: "SECTION",
      LookupSDesc: label,
      LookupLDesc: label,
      LookupOrder: 99,
    })
  }

  return result
}

export function buildSearchDefShowRequest(params: {
  connectionName: string
  locationId: string
  dayOfWeekId: string
}): ShowDefRequestModel | null {
  const dayName = toShowDefDayName(params.dayOfWeekId)
  if (!dayName) return null

  return {
    ConnectionString: params.connectionName,
    LocationId: params.locationId,
    DayOfWeek: dayName,
  }
}

export function buildDeleteShowDefRequest(params: {
  connectionName: string
  locationId: string
  lastUpdateId: string
  showDefId: string
}): ShowDefRequestModel {
  return {
    ConnectionString: params.connectionName,
    LocationId: params.locationId,
    LastUpdateId: params.lastUpdateId,
    LastUpdateDt: formatDesktopDateTime(new Date()),
    ShowDefID: params.showDefId,
  }
}

type BuildSaveParams = {
  connectionName: string
  locationId: string
  lastUpdateId: string
  form: ShowTimeFormValues
  sectionLookups: SectionLookupItem[]
  dayName: string
  showDefId?: string
}

function buildShowDefBody({
  connectionName,
  locationId,
  lastUpdateId,
  form,
  sectionLookups,
  dayName,
  showDefId,
}: BuildSaveParams): ShowDefRequestModel {
  return {
    ConnectionString: connectionName,
    LocationId: locationId,
    LastUpdateId: lastUpdateId,
    LastUpdateDt: formatDesktopDateTime(new Date()),
    ShowArrival: combineTodayWithTime(form.arrivalTime),
    ShowTime: combineTodayWithTime(form.showTime),
    DayOfWeek: dayName,
    ShowDefID: showDefId,
    IsDinner: form.dinner,
    IsNoPasses: form.noPasses,
    IsVIPSeating: form.vipSeating,
    Is21Over: form.age21Plus,
    IsHub: form.hub,
    NewLookupList: buildNewLookupList(form.sections, sectionLookups),
    SectionList: mapSections(
      form.sections,
      form,
      sectionLookups,
      Boolean(showDefId)
    ),
  }
}

/** ClubMan SaveShowTimes → one SaveShowDef call per checked day. */
export function buildSaveShowDefRequests(params: {
  connectionName: string
  locationId: string
  lastUpdateId: string
  form: ShowTimeFormValues
  sectionLookups: SectionLookupItem[]
}): ShowDefRequestModel[] {
  const days = listAlsoAppliesDayNames(params.form.dayOfWeek, params.form.alsoAppliesTo)
  return days.map((dayName) =>
    buildShowDefBody({
      ...params,
      dayName,
    })
  )
}

/**
 * ClubMan UpdateShowTimes:
 * - UpdateShowDef for the primary day when that day is checked
 * - SaveShowDef for other checked days
 */
export function buildUpdateShowDefRequests(params: {
  connectionName: string
  locationId: string
  lastUpdateId: string
  form: ShowTimeFormValues
  sectionLookups: SectionLookupItem[]
  showDefId: string
}): { updates: ShowDefRequestModel[]; creates: ShowDefRequestModel[] } {
  const primaryDay = toShowDefDayName(params.form.dayOfWeek)
  const days = listAlsoAppliesDayNames(
    params.form.dayOfWeek,
    params.form.alsoAppliesTo
  )
  const updates: ShowDefRequestModel[] = []
  const creates: ShowDefRequestModel[] = []

  for (const dayName of days) {
    const body = buildShowDefBody({
      ...params,
      dayName,
      showDefId: dayName === primaryDay ? params.showDefId : undefined,
    })
    if (dayName === primaryDay) {
      updates.push(body)
    } else {
      creates.push(body)
    }
  }

  return { updates, creates }
}
