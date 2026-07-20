import {
  normalizeUserRight,
  RIGHT_ADMIN,
  RIGHT_MANAGER,
  RIGHT_SYSTEM,
  RIGHT_USER_RESTRICTED,
} from "@/lib/auth/user-rights"
import type { ApiSystemLookupItem } from "@/types/api/system-lookup"

/** ClubMan SECURITY lookup option for Users Add/Edit (LookUpCode + description). */
export type SecurityLevelOption = {
  id: string
  label: string
}

type FilterSecurityLookupOptionsParams = {
  /** Desktop UserCredentials.UserLocationId — when set, hide SEC03 / SEC09. */
  locationId: string | null | undefined
  /** Desktop UserCredentials.UserRights — Managers (SEC05) cannot assign SEC01. */
  currentUserRight: string | null | undefined
}

/**
 * Desktop UserVM.GetLookupList — SECURITY lookups with location + Manager filters.
 * Does not insert the empty "Security Level" placeholder (UI uses Select placeholder).
 */
export function filterSecurityLookupOptions(
  lookups: ApiSystemLookupItem[] | null | undefined,
  { locationId, currentUserRight }: FilterSecurityLookupOptionsParams
): SecurityLevelOption[] {
  const hasLocation = Boolean(locationId?.trim())
  const isManager =
    normalizeUserRight(currentUserRight) === RIGHT_MANAGER

  return (lookups ?? [])
    .filter((item) => item.LookupType?.trim().toUpperCase() === "SECURITY")
    .map((item) => {
      const id = (item.LookupCode ?? "").trim().toUpperCase()
      const label = (item.LookupSDesc ?? item.LookupLDesc ?? "").trim()
      return { id, label }
    })
    .filter((item) => {
      if (!item.id || !item.label) {
        return false
      }
      // Desktop: when location is set, hide Read Only + System.
      if (hasLocation) {
        if (item.id === RIGHT_USER_RESTRICTED || item.id === RIGHT_SYSTEM) {
          return false
        }
      }
      // Desktop: Manager cannot assign Administrator.
      if (isManager && item.id === RIGHT_ADMIN) {
        return false
      }
      return true
    })
    .sort((left, right) => left.label.localeCompare(right.label))
}

/**
 * True when the user's assigned right is not in the assignable SECURITY list
 * (e.g. Manager editing an Administrator). UI shows read-only; value is preserved on save.
 */
export function isSecurityLevelLocked(
  assignedRight: string | null | undefined,
  options: SecurityLevelOption[]
): boolean {
  const right = normalizeUserRight(assignedRight)
  if (!right) {
    return false
  }

  return !options.some((option) => normalizeUserRight(option.id) === right)
}
