import { formatUsDateTime } from "@/lib/format-us-datetime"
import { parseApiDateOrFallback } from "@/lib/parse-api-date"
import { changeTime, toApiDateTime } from "@/lib/recurrence/recurrence-date-utils"
import {
  applySectionLookupCodes,
  buildNewLookupList,
  collectPendingCustomSections,
  resolveSectionCode,
  resolveSectionOrder,
} from "@/lib/section-lookup"
import type {
  ApiDefaultShowSection,
  SaveShowListItem,
  SaveShowRequestModel,
  ShowSectionDetModel,
} from "@/types/api/save-show"
import type { AddShowFormValues } from "@/types/calendar-show"
import type { SectionLookupItem } from "@/types/api/system-lookup"

const EMPTY_GUID = "00000000-0000-0000-0000-000000000000"

type BuildSaveShowRequestParams = {
  connectionString: string
  locationId: string
  username: string
  showDate: Date
  showArrivalTime: Date
  form: AddShowFormValues
  sectionRows: ApiDefaultShowSection[]
  sectionLookups: SectionLookupItem[]
}

function parseDecimal(value: string, fallback = 0) {
  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function toGuid(value: string) {
  return value && value !== "select" ? value : EMPTY_GUID
}

function yn(value: boolean) {
  return value ? "Y" : "N"
}

function resolveAge(ageRestriction: string) {
  switch (ageRestriction) {
    case "A":
      return { over21: "A", minAge: null }
    case "Y":
      return { over21: "Y", minAge: "21 & Over" }
    case "N":
      return { over21: "N", minAge: null }
    case "S":
      return { over21: "S", minAge: null }
    default:
      return { over21: "", minAge: null }
  }
}

function buildSectionList(
  rows: ApiDefaultShowSection[],
  assignTable: boolean,
  dbSections: SectionLookupItem[],
  pendingCustomSections: SectionLookupItem[]
): ShowSectionDetModel[] {
  return rows.map((row) => ({
    ShowDetID: row.ShowDetID,
    ShowSec: resolveSectionCode(
      row.Section,
      row.ShowSec,
      dbSections,
      pendingCustomSections
    ),
    ShowSecOrder: resolveSectionOrder(
      row.Section,
      row.ShowSec,
      dbSections,
      pendingCustomSections
    ),
    ShowPrice: row.ShowPrice,
    ShowNon: row.ShowNon,
    ShowSmoking: row.ShowSmoking,
    Web: row.Web,
    AssignSeats: assignTable ? "Y" : "N",
    RestrictPromoForSection: row.ShowDetRestrictPromo ?? "N",
    walkupsvccharge: row.ShowDefDetwalkupsvc,
    phonesvccharge: row.ShowDefDetphonesvc,
    websvccharge: row.ShowDefDetwebsvc,
  }))
}

export function buildSaveShowRequest({
  connectionString,
  locationId,
  username,
  showDate,
  showArrivalTime,
  form,
  sectionRows,
  sectionLookups,
}: BuildSaveShowRequestParams): SaveShowRequestModel {
  const age = resolveAge(form.ageRestriction)
  const dayName = showDate.toLocaleDateString("en-US", { weekday: "long" })
  const pendingCustomSections = collectPendingCustomSections(
    sectionRows,
    sectionLookups
  )
  const resolvedRows = applySectionLookupCodes(
    sectionRows,
    sectionLookups,
    pendingCustomSections
  )
  const newLookupList = buildNewLookupList(
    resolvedRows,
    sectionLookups,
    pendingCustomSections
  )

  const groupedByArrival = new Map<string, ApiDefaultShowSection[]>()
  for (const row of resolvedRows.filter(
    (item) => item.ShowDay?.trim() === dayName
  )) {
    const key = row.ShowArrival ?? row.ShowTim ?? row.ShowDefID
    const current = groupedByArrival.get(key) ?? []
    current.push(row)
    groupedByArrival.set(key, current)
  }

  const showList: SaveShowListItem[] = Array.from(groupedByArrival.values()).map(
    (rows) => {
      const first = rows[0]
      const showTimSource = parseApiDateOrFallback(first.ShowTim, showDate)
      const showArrivalSource = parseApiDateOrFallback(
        first.ShowArrival,
        showArrivalTime
      )

      const resolvedShowDate = changeTime(
        showDate,
        showTimSource.getHours(),
        showTimSource.getMinutes()
      )
      const resolvedShowTim = changeTime(
        showDate,
        showTimSource.getHours(),
        showTimSource.getMinutes()
      )
      const resolvedShowArrival = changeTime(
        showArrivalTime,
        showArrivalSource.getHours(),
        showArrivalSource.getMinutes()
      )

      return {
        ShowDate: toApiDateTime(resolvedShowDate),
        ShowTim: toApiDateTime(resolvedShowTim),
        ShowArrival: toApiDateTime(resolvedShowArrival),
        Headliner: toGuid(form.headlinerId),
        Headliner2: toGuid(form.headliner2Id),
        Feature: toGuid(form.featureId),
        Feature2: toGuid(form.feature2Id),
        Opener: toGuid(form.openerId),
        IsUseSectionFee: form.useSectionFee,
        ShowDinner: yn(form.dinner),
        NoPasses: yn(form.noPasses),
        VIP: yn(form.vipSeating),
        Hub: yn(form.hub),
        MinAge: age.minAge,
        Over21: age.over21,
        ShowType: "SHOW03",
        specialshownotes: form.specialNote || null,
        DayOfShowCharge: parseDecimal(form.dayOfShowFee, 0),
        PhoneCharge: parseDecimal(form.phoneFee, 0),
        WalkupCharge: parseDecimal(form.walkupFee, 0),
        WebCharge: parseDecimal(form.webFee, 0),
        IsPrivate: form.preSalePrivateShow,
        SectionList: buildSectionList(
          rows,
          form.assignTable,
          sectionLookups,
          pendingCustomSections
        ),
      }
    }
  )

  return {
    ConnectionString: connectionString,
    LocationId: locationId,
    ShowDate: toApiDateTime(showDate),
    ShowArivalTime: toApiDateTime(showArrivalTime),
    LastUpdateDt: formatUsDateTime(new Date()),
    LastUpdateId: username,
    IsShowAvailableOnWeb: form.showOnWeb,
    ShowList: showList,
    NewLookupList: newLookupList,
  }
}

export function validateAddShowForm(
  form: AddShowFormValues,
  sectionRows: ApiDefaultShowSection[]
) {
  if (!form.headlinerId || form.headlinerId === EMPTY_GUID) {
    return "Headliner is required."
  }

  if (sectionRows.length === 0) {
    return "No show times are available for the selected recurrence."
  }

  if (form.selectedShowTimeIds.length === 0) {
    return "Select at least one show time."
  }

  return null
}
