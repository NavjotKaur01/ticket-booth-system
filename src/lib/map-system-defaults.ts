import { formatUsDateTimeFromValue } from "@/lib/format-us-datetime"
import type { ApiSystemDefaultItem } from "@/types/api/system-defaults"
import type { SystemDefault } from "@/types/system-default"

function text(value: string | null | undefined) {
  return (value ?? "").trim()
}

function hasLocationId(value: string | null | undefined) {
  const id = text(value)
  return Boolean(id) && id !== "00000000-0000-0000-0000-000000000000"
}

/**
 * Prefer location-specific rows when Screen+Field duplicates exist.
 * Mirrors SystemDefaultsVM.GetDefaults / GetDefaultsByName foreach dedupe.
 */
export function dedupeSystemDefaults(
  items: ApiSystemDefaultItem[]
): ApiSystemDefaultItem[] {
  const filtered: ApiSystemDefaultItem[] = []
  let screen = ""
  let field = ""

  for (const item of items ?? []) {
    const itemScreen = text(item.Screen)
    const itemField = text(item.Field)

    if (screen === itemScreen && field === itemField) {
      if (hasLocationId(item.LocationID)) {
        if (filtered.length > 0) {
          filtered[filtered.length - 1] = item
        }
        continue
      }
      continue
    }

    screen = itemScreen
    field = itemField
    filtered.push(item)
  }

  return filtered
}

/** Maps LoadSystemDefaults → table rows (after permission filter + dedupe). */
export function mapSystemDefaults(
  items: ApiSystemDefaultItem[]
): SystemDefault[] {
  return dedupeSystemDefaults(items).map((item, index) => ({
    id: text(item.DefaultID) || `system-default-${index}`,
    screen: text(item.Screen),
    field: text(item.Field),
    description: text(item.SDesc),
    defaultValue: text(item.DefValue),
    type: text(item.Type),
    lookupType: text(item.LookupType),
    lastUpdateId: text(item.LastUpdateID),
    lastUpdateDt: item.LastUpdateDt
      ? formatUsDateTimeFromValue(item.LastUpdateDt, text(item.LastUpdateDt))
      : "",
  }))
}

/**
 * Visibility rules from SystemDefaultsVM.GetDefaultsByName /
 * GetSystemDefauts (exclude GiftCert; non-SEC09 hide AddComic / PaymentTestGetway / Touch screens).
 */
export function filterVisibleSystemDefaultItems(
  items: ApiSystemDefaultItem[],
  userRight: string
): ApiSystemDefaultItem[] {
  const isSystemUser = userRight.trim().toUpperCase() === "SEC09"

  return (items ?? []).filter((item) => {
    const screen = text(item.Screen)
    const field = text(item.Field)
    if (screen.toLowerCase() === "giftcert") return false
    if (isSystemUser) return true
    if (screen.toLowerCase() === "addcomic") return false
    if (screen === "Touch") return false
    if (field === "PaymentTestGetway") return false
    return true
  })
}

export function buildSystemDefaultScreenOptions(
  records: SystemDefault[]
): string[] {
  return [...new Set(records.map((record) => record.screen).filter(Boolean))].sort(
    (a, b) => a.localeCompare(b)
  )
}

export function isSystemDefaultEditBlocked(record: SystemDefault) {
  return (
    record.screen === "AddComic" &&
    record.description === "FTP Location for Pictures"
  )
}
