/**
 * UserRights / SEC helpers for Phase 2 RBAC UX.
 * Client gating is UX only — backend must still enforce (BE-2.x).
 */

/** Full administrator (desktop SEC01). */
export const RIGHT_ADMIN = "SEC01"
/** Standard booth user (desktop SEC02). */
export const RIGHT_USER = "SEC02"
/** Restricted user variant seen in cancel-payment paths. */
export const RIGHT_USER_RESTRICTED = "SEC03"
/** Manager (desktop SEC05). */
export const RIGHT_MANAGER = "SEC05"
/** Elevated system right (desktop SEC09). */
export const RIGHT_SYSTEM = "SEC09"

const ELEVATED_RIGHTS = new Set([
  RIGHT_ADMIN,
  RIGHT_MANAGER,
  RIGHT_SYSTEM,
])

export function normalizeUserRight(userRight: string | null | undefined): string {
  return (userRight ?? "").replace(/\s+/g, "").trim().toUpperCase()
}

/** Administrator sidebar + `/administrator/*` routes. */
export function canAccessAdministrator(userRight: string | null | undefined): boolean {
  return ELEVATED_RIGHTS.has(normalizeUserRight(userRight))
}

/** Venue Manager sidebar + `/venue/*` routes. */
export function canAccessVenueManager(userRight: string | null | undefined): boolean {
  return ELEVATED_RIGHTS.has(normalizeUserRight(userRight))
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
