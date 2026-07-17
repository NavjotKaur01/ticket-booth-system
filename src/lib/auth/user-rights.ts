/**
 * UserRights / SEC helpers for Phase 2 RBAC UX.
 * Aligned with desktop MainWindow + Roles (ActionForm.cs).
 * Client gating is UX only — backend must still enforce (BE-2.x).
 */

/** Full administrator (desktop SEC01). */
export const RIGHT_ADMIN = "SEC01"
/** Standard booth user (desktop SEC02) — Administration panel disabled. */
export const RIGHT_USER = "SEC02"
/** Read-only (desktop SEC03). */
export const RIGHT_USER_RESTRICTED = "SEC03"
/** Manager (desktop SEC05). */
export const RIGHT_MANAGER = "SEC05"
/** Elevated system right (desktop SEC09). */
export const RIGHT_SYSTEM = "SEC09"

export function normalizeUserRight(userRight: string | null | undefined): string {
  return (userRight ?? "").replace(/\s+/g, "").trim().toUpperCase()
}

/**
 * Desktop MainWindow: only Roles.User (SEC02) disables pnlAdministration.
 * SEC01 / SEC03 / SEC05 / SEC09 keep Administration enabled.
 */
export function canAccessAdministrator(
  userRight: string | null | undefined
): boolean {
  const right = normalizeUserRight(userRight)
  if (!right) {
    return false
  }

  return right !== RIGHT_USER
}

/**
 * Desktop does not disable Venue Manager by UserRights.
 * Any authenticated user with a rights code can open Venue Manager.
 */
export function canAccessVenueManager(
  userRight: string | null | undefined
): boolean {
  return Boolean(normalizeUserRight(userRight))
}

export function hasAnyUserRight(
  userRight: string | null | undefined,
  allowed: readonly string[]
): boolean {
  const normalized = normalizeUserRight(userRight)
  if (!normalized) {
    return false
  }

  return allowed.some((right) => normalizeUserRight(right) === normalized)
}
