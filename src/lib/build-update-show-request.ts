import { formatUsDateTime } from "@/lib/format-us-datetime"
import { toApiDateTime } from "@/lib/recurrence/recurrence-date-utils"
import {
  applySectionLookupCodes,
  buildNewLookupList,
  collectPendingCustomSections,
  resolveSectionCode,
  resolveSectionOrder,
} from "@/lib/section-lookup"
import type { ApiDefaultShowSection } from "@/types/api/save-show"
import type { AddShowFormValues } from "@/types/calendar-show"
import type { SectionLookupItem } from "@/types/api/system-lookup"
import type { UpdateShowRequestModel, UpdateShowSectionDetModel } from "@/types/api/update-show"

const EMPTY_GUID = "00000000-0000-0000-0000-000000000000"

type BuildUpdateShowRequestParams = {
  connectionString: string
  locationId: string
  username: string
  showDate: Date
  showArrivalTime: Date
  form: AddShowFormValues
  sectionRows: ApiDefaultShowSection[]
  sectionLookups: SectionLookupItem[]
  showId: string
}

function parseDecimal(value: string, fallback = 0) {
  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function toGuid(value: string) {
  return value && value !== "select" && value !== EMPTY_GUID ? value : EMPTY_GUID
}

function toOptionalGuid(value: string): string | null {
  return value && value !== "select" && value !== EMPTY_GUID ? value : null
}

function getSelectedAgeFormat(ageRestriction: string): string {
  switch (ageRestriction) {
    case "A":
      return "A (all ages)"
    case "Y":
      return "Y (21 and over)"
    case "N":
      return "N (18 and over)"
    case "S":
      return "S (custom)"
    default:
      return ""
  }
}

function getMinAgeFormat(ageRestriction: string, minAge: string): string | null {
  switch (ageRestriction) {
    case "Y":
      return "21 & Over"
    case "N":
      return "18 & Over"
    case "S":
      return minAge.trim() || null
    case "A":
    default:
      return null
  }
}

export function buildUpdateShowRequest({
  connectionString,
  locationId,
  username,
  showDate,
  showArrivalTime,
  form,
  sectionRows,
  sectionLookups,
  showId,
}: BuildUpdateShowRequestParams): UpdateShowRequestModel {
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

  const sectionList: UpdateShowSectionDetModel[] = resolvedRows.map((row) => ({
    ShowDetID: row.ShowDetID || null,
    ShowSec: resolveSectionCode(
      row.Section,
      row.ShowSec,
      sectionLookups,
      pendingCustomSections
    ),
    ShowSecOrder: resolveSectionOrder(
      row.Section,
      row.ShowSec,
      sectionLookups,
      pendingCustomSections
    ),
    ShowPrice: row.ShowPrice,
    ShowNon: row.ShowNon,
    ShowSmoking: row.ShowSmoking,
    Web: row.Web,
    ShowAppearing: "Y",
    Active: "Y",
    RestrictPromoForSection: row.ShowDetRestrictPromo ?? "N",
    walkupsvccharge: row.ShowDefDetwalkupsvc,
    phonesvccharge: row.ShowDefDetphonesvc,
    websvccharge: row.ShowDefDetwebsvc,
    LookupSectionCode: resolveSectionCode(
      row.Section,
      row.ShowSec,
      sectionLookups,
      pendingCustomSections
    ),
  }))

  return {
    ConnectionString: connectionString,
    LocationId: locationId,
    ShowId: showId,
    ShowTime: toApiDateTime(showDate),
    ShowArrival: toApiDateTime(showArrivalTime),
    LastUpdateDt: formatUsDateTime(new Date()),
    LastUpdateId: username,
    HeadlinerGuid1: toGuid(form.headlinerId),
    HeadlinerGuid2: toOptionalGuid(form.headliner2Id),
    FeatureGuid1: toOptionalGuid(form.featureId),
    FeatureGuid2: toOptionalGuid(form.feature2Id),
    OpenerGuid: toOptionalGuid(form.openerId),
    IsDinner: form.dinner,
    IsNoPasses: form.noPasses,
    IsVIPSeating: form.vipSeating,
    IsHub: form.hub,
    DayOfShowFee: parseDecimal(form.dayOfShowFee, 0),
    PhoneInFee: parseDecimal(form.phoneFee, 0),
    WalkUpFee: parseDecimal(form.walkupFee, 0),
    WebFee: parseDecimal(form.webFee, 0),
    IsUseSectionFee: form.useSectionFee,
    SelectedAge: getSelectedAgeFormat(form.ageRestriction),
    MinAge: getMinAgeFormat(form.ageRestriction, form.minAge),
    IsShowSoldOut: form.isShowSoldOut,
    IsShowAvailableOnWeb: form.showOnWeb,
    IsPrivate: form.preSalePrivateShow,
    specialshownotes: form.specialNote || null,
    SectionList: sectionList,
    NewLookupList: newLookupList,
    DeleteShowSectionIds: [],
  }
}
