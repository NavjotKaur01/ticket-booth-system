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
  return dedupeSystemDefaults(items)
    .map((item, index) => ({
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
    .sort((a, b) => {
      const screenCompare = a.screen.localeCompare(b.screen)
      if (screenCompare !== 0) return screenCompare
      return a.field.localeCompare(b.field)
    })
}

/**
 * Row visibility from SystemDefaultsVM.GetDefaultsByName.
 * GiftCert always hidden; non-SEC09 also hides AddComic + PaymentTestGetway.
 * Touch remains visible in the "all" list for non-SEC09 (desktop behavior).
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
    if (field === "PaymentTestGetway") return false
    return true
  })
}

/**
 * Screen combo options from SystemDefaultsVM.GetSystemDefauts.
 * Non-SEC09 also omits Touch from the dropdown (even though Touch rows can appear in "Select"/all).
 */
export function buildSystemDefaultScreenOptions(
  records: SystemDefault[],
  userRight: string
): string[] {
  const isSystemUser = userRight.trim().toUpperCase() === "SEC09"

  return [
    ...new Set(
      records
        .filter((record) => {
          if (!record.screen) return false
          if (isSystemUser) return true
          return record.screen !== "Touch"
        })
        .map((record) => record.screen)
    ),
  ].sort((a, b) => a.localeCompare(b))
}

/** SystemDefaults.xaml.cs — FTP Location for Pictures cannot be edited. */
export function isSystemDefaultEditBlocked(record: SystemDefault) {
  return (
    record.screen === "AddComic" &&
    record.description === "FTP Location for Pictures"
  )
}

/** Desktop cancels BeginningEdit when Type is null/empty. */
export function canOpenSystemDefaultEditor(record: SystemDefault) {
  if (isSystemDefaultEditBlocked(record)) return false
  return Boolean(record.type.trim())
}
