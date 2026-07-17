import { formatUsDateFromValue, formatUsDateTime } from "@/lib/format-us-datetime"
import type {
  ApiShowPromotionItem,
  SaveShowPromotionRequest,
} from "@/types/api/show-promotion"

export type AdjustPromoRow = {
  id: string
  code: string
  name: string
  startDate: string
  endDate: string
  weekDays: string
  discountType: string
  walkUp: string
  web: string
  phoneIn: string
  managerOnly: string
  ccReq: string
  flag: string | null
  isSelected: boolean
}

const DISCOUNT_TYPE_LABELS: Record<string, string> = {
  PROMO01: "Discount",
  PROMO02: "Free Tickets",
  PROMO03: "Set Price",
  Discount: "Discount",
  "Free Tickets": "Free Tickets",
  "Set Price": "Set Price",
}

function formatYesNo(value: string | null | undefined): string {
  const normalized = (value ?? "").trim()
  if (!normalized) return "No"
  const upper = normalized.toUpperCase()
  if (upper === "Y" || upper === "YES" || upper === "TRUE" || upper === "1") {
    return "Yes"
  }
  if (upper === "N" || upper === "NO" || upper === "FALSE" || upper === "0") {
    return "No"
  }
  if (normalized === "Yes" || normalized === "No") return normalized
  return normalized
}

function formatDiscountType(value: string | null | undefined): string {
  const raw = (value ?? "").trim()
  if (!raw) return ""
  return DISCOUNT_TYPE_LABELS[raw] ?? raw
}

function formatPromoDate(value: string | null | undefined): string {
  if (value == null || String(value).trim() === "") return ""
  return formatUsDateFromValue(value, "")
}

function startOfLocalDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

/** Desktop: DayOfWeek + 1 → Sunday=1 … Saturday=7 */
function getDesktopWeekdayNumber(date: Date) {
  return date.getDay() + 1
}

function isManagerOnlyYes(value: string | null | undefined) {
  return formatYesNo(value) === "Yes"
}

function collectGuidList(value: string[] | null | undefined): Set<string> {
  const ids = new Set<string>()
  if (!Array.isArray(value)) return ids
  for (const entry of value) {
    const id = String(entry ?? "")
      .trim()
      .toLowerCase()
    if (id) ids.add(id)
  }
  return ids
}

function toPromoRow(
  item: ApiShowPromotionItem,
  isSelected: boolean,
  flag: string | null
): AdjustPromoRow {
  return {
    id: String(item.PromotionID ?? "").trim(),
    code: item.PromotionCode ?? "",
    name: item.PromotionName ?? "",
    startDate: formatPromoDate(item.StartDt),
    endDate: formatPromoDate(item.EndDt),
    weekDays: item.WeekDays ?? "",
    discountType: formatDiscountType(item.DiscountType),
    walkUp: formatYesNo(item.WalkUp),
    web: formatYesNo(item.Web),
    phoneIn: formatYesNo(item.PhoneIn),
    managerOnly: formatYesNo(item.ManagerOnly),
    ccReq: formatYesNo(item.CCReq),
    flag,
    isSelected,
  }
}

/**
 * Desktop Show Promotion checkbox init:
 * 1. All unchecked, Flag unset
 * 2. Candidates = weekday match (or all if past show)
 * 3. SpecialEng=Y → only ManagerOnly=Yes candidates get Flag=Y / checked
 * 4. ShowPromotionAddInList force ON
 * 5. ShowPromotionRemoveInList force OFF (wins)
 */
export function initializePromoSelections(
  items: ApiShowPromotionItem[],
  showDate: Date,
  today: Date = new Date()
): AdjustPromoRow[] {
  const first = items[0]
  const specialEng = (first?.SpecialEng ?? "").trim().toUpperCase()
  const addIds = collectGuidList(first?.ShowPromotionAddInList)
  const removeIds = collectGuidList(first?.ShowPromotionRemoveInList)

  const isPastShow =
    startOfLocalDay(showDate).getTime() < startOfLocalDay(today).getTime()
  const dayNumber = String(getDesktopWeekdayNumber(showDate))

  return items.map((item) => {
    const id = String(item.PromotionID ?? "").trim()
    const normalizedId = id.toLowerCase()

    // 1. Starting state
    let isSelected = false
    let flag: string | null = null

    // 2. Weekday candidates (or all for past shows)
    const weekDays = item.WeekDays ?? ""
    const isWeekdayCandidate =
      isPastShow || weekDays.includes(dayNumber)

    // 3. Special engagement / ManagerOnly
    const passesSpecialEng =
      specialEng === "Y" ? isManagerOnlyYes(item.ManagerOnly) : true

    if (isWeekdayCandidate && passesSpecialEng) {
      isSelected = true
      flag = "Y"
    }

    // 4. Force ON via AddInList (IsSelected only; keep Flag if already set)
    if (addIds.has(normalizedId)) {
      isSelected = true
    }

    // 5. Force OFF via RemoveInList (final)
    if (removeIds.has(normalizedId)) {
      isSelected = false
    }

    return toPromoRow(item, isSelected, flag)
  })
}

export function togglePromoSelection(
  rows: AdjustPromoRow[],
  promoId: string
): AdjustPromoRow[] {
  return rows.map((row) =>
    row.id === promoId ? { ...row, isSelected: !row.isSelected } : row
  )
}

export function buildSaveShowPromotionRequest(params: {
  connectionString: string
  locationId: string
  calendarShowId: string
  username: string
  rows: AdjustPromoRow[]
  now?: Date
}): SaveShowPromotionRequest {
  const now = params.now ?? new Date()
  const lastUpdateDt = formatUsDateTime(now)
  const lastUpdateId = params.username.trim()

  return {
    ConnectionString: params.connectionString,
    LocationId: params.locationId,
    CalendarShowId: params.calendarShowId,
    LastUpdateDt: lastUpdateDt,
    LastUpdateId: lastUpdateId,
    PromotionList: params.rows.map((row) => ({
      PromotionID: row.id,
      PromotionCode: row.code,
      Flag: row.flag,
      IsSelected: row.isSelected,
      LastUpdateDt: lastUpdateDt,
      LastUpdateID: lastUpdateId,
    })),
  }
}
