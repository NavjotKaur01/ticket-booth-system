import type { AdjustFeeDefaults } from "@/types/api/adjust-fees"
import type { ApiSystemDefaultItem } from "@/types/api/system-defaults"

const FEE_DEFAULT_FIELDS = [
  "txtWalkUp",
  "txtDayOfShow",
  "txtPhone",
  "txtWeb",
] as const

/**
 * Mirrors ClubMan AdjustFeesVM.GetDefaults:
 * DefaultsList where Screen is Reservation or Show, fields txtPhone / txtDayOfShow / txtWalkUp / txtWeb.
 */
export function mapAdjustFeeDefaults(
  defaults: ApiSystemDefaultItem[]
): AdjustFeeDefaults {
  const rows = defaults.filter((item) => {
    const screen = (item.Screen ?? "").trim()
    const field = (item.Field ?? "").trim()
    return (
      (screen === "Reservation" || screen === "Show") &&
      FEE_DEFAULT_FIELDS.includes(field as (typeof FEE_DEFAULT_FIELDS)[number])
    )
  })

  return {
    phoneCharge: readDecimalDef(rows, "txtPhone"),
    dayOfShow: readDecimalDef(rows, "txtDayOfShow"),
    walkupCharge: readDecimalDef(rows, "txtWalkUp"),
    webCharge: readDecimalDef(rows, "txtWeb"),
  }
}

function readDecimalDef(
  rows: ApiSystemDefaultItem[],
  field: string
): number | null {
  const match = rows.find((row) => (row.Field ?? "").trim() === field)
  if (!match) return null
  const raw = (match.DefValue ?? "").trim()
  if (!raw) return null
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? parsed : null
}

/** Display helper for the Default column (desktop binds decimal? as-is). */
export function formatAdjustFeeDefault(value: number | null): string {
  if (value == null) return ""
  return String(value)
}
