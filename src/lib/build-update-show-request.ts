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

// function resolveAge(ageRestriction: string) {
//   switch (ageRestriction) {
//     case "A":
//       return { SelectedAge: "A", MinAge: null }
//     case "Y":
//       return { SelectedAge: "Y", MinAge: "21 & Over" }
//     case "N":
//       return { SelectedAge: "N", MinAge: null }
//     case "S":
//       return { SelectedAge: "S", MinAge: null } // S (custom) is handled if MinAge is passed in AddShowFormValues?
//     default:
//       // If it's a number (e.g. "18+"), the desktop uses SelectedAge="S (custom)" or similar.
//       // But the desktop logic mentioned in previous message:
//       // Y -> Y (21 and over)
//       // N -> N (18 and over)
//       // A -> A (all ages)
//       // Custom -> "S (custom)" -> empty Over21 + MinAge
//       // Based on user provided JSON: SelectedAge: "Y (21 and over)", MinAge: "21 & Over"
//       // Wait, earlier the user showed how Age is resolved.
//       // For UpdateShow they need SelectedAge: "Y (21 and over)", "N (18 and over)", "A (all ages)", "S (custom)", ""
//       return { SelectedAge: ageRestriction, MinAge: ageRestriction }
//   }
// }

// Map the age restriction dropdown back to the specific desktop string format
function getSelectedAgeFormat(age: string): string {
  if (age === "21+") return "Y (21 and over)"
  if (age === "18+") return "N (18 and over)" // or whatever is used
  if (age === "All Ages") return "A (all ages)"
  if (age === "A") return "A (all ages)"
  if (age === "Y") return "Y (21 and over)"
  if (age === "N") return "N (18 and over)"
  if (age) return "S (custom)"
  return ""
}

function getMinAgeFormat(age: string): string | null {
  if (age === "21+" || age === "Y") return "21 & Over"
  if (age === "18+" || age === "N") return "18 & Over"
  if (age === "All Ages" || age === "A") return null
  return age || null
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
    MinAge: getMinAgeFormat(form.ageRestriction),
    IsShowSoldOut: form.isShowSoldOut,
    IsShowAvailableOnWeb: form.showOnWeb,
    IsPrivate: form.preSalePrivateShow,
    specialshownotes: form.specialNote || null,
    SectionList: sectionList,
    NewLookupList: newLookupList,
    DeleteShowSectionIds: [],
  }
}
