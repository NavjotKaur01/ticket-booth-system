import type { MarketingFilterSearchRequest } from "@/types/api/marketing-filter-search"
import type {
  MarketingFilterComedian,
  MarketingFilterForm,
} from "@/types/marketing-filter"
import { MARKETING_FILTER_SELECT_MONTH } from "@/types/marketing-filter"

type BuildMarketingFilterSearchRequestParams = {
  connectionName: string
  locationId: string
  filters: MarketingFilterForm
  pageNo: number
}

function toLocalIsoDateTime(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0")

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

function monthToInt(month: string) {
  if (!month || month === MARKETING_FILTER_SELECT_MONTH) {
    return 0
  }

  const parsed = new Date(`${month} 1, 2000`)
  if (Number.isNaN(parsed.getTime())) {
    return 0
  }

  return parsed.getMonth() + 1
}

function buildComicIdsXml(comedians: MarketingFilterComedian[]) {
  if (comedians.length === 0) {
    return ""
  }

  const items = comedians
    .map((comedian) => `<Comic ID = "${comedian.id}"/>`)
    .join("")

  return `<Comics>${items}</Comics>`
}

function parseDateBoundary(value: string, fallback: "min" | "max") {
  if (!value) {
    return fallback === "min"
      ? "0001-01-01T00:00:00"
      : "9999-12-31T23:59:59.9999999"
  }

  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) {
    return fallback === "min"
      ? "0001-01-01T00:00:00"
      : "9999-12-31T23:59:59.9999999"
  }

  return toLocalIsoDateTime(date)
}

export function buildMarketingFilterSearchRequest({
  connectionName,
  locationId,
  filters,
  pageNo,
}: BuildMarketingFilterSearchRequestParams): MarketingFilterSearchRequest {
  const birthMonth = monthToInt(filters.birthMonth)
  const isDob = birthMonth > 0
  const isSince = Boolean(filters.newCustomerFrom || filters.newCustomerTo)

  return {
    ConnectionString: connectionName,
    LocationID: locationId,
    FirstName: filters.firstName.trim(),
    LastName: filters.lastName.trim(),
    Zip: filters.zipCodes[0]?.trim() ?? "",
    Zip1: filters.zipCodes[1]?.trim() ?? "",
    Zip2: filters.zipCodes[2]?.trim() ?? "",
    Zip3: filters.zipCodes[3]?.trim() ?? "",
    Zip4: filters.zipCodes[4]?.trim() ?? "",
    IsDOB: isDob,
    BirthMonth: birthMonth,
    IsSince: isSince,
    Since: parseDateBoundary(filters.newCustomerFrom, "min"),
    SinceTo: parseDateBoundary(filters.newCustomerTo, "max"),
    IsInactive: filters.excludeInactive,
    IsBanned: filters.excludeBanned,
    IsPhone: filters.onlyWithPhone,
    IsEmail: filters.onlyWithEmail,
    IsNocall: filters.excludeNoCallList,
    IsAddress: filters.onlyWithStreetAddress,
    ComicIds: buildComicIdsXml(filters.selectedComedians),
    TodayDate: toLocalIsoDateTime(new Date()),
    PageNo: pageNo,
  }
}

export function hasMarketingFilterSearchCriteria(filters: MarketingFilterForm) {
  const hasZip = filters.zipCodes.some((zip) => zip.trim())
  const birthMonth = monthToInt(filters.birthMonth)
  const isSince = Boolean(filters.newCustomerFrom || filters.newCustomerTo)

  return Boolean(
    filters.lastName.trim() ||
      filters.firstName.trim() ||
      hasZip ||
      filters.areaCode.trim() ||
      filters.selectedComedians.length > 0 ||
      birthMonth > 0 ||
      isSince ||
      filters.excludeBanned ||
      filters.onlyWithPhone ||
      filters.onlyWithEmail ||
      filters.excludeInactive ||
      filters.onlyWithStreetAddress ||
      filters.excludeFutureReservations ||
      filters.excludeNoCallList
  )
}
