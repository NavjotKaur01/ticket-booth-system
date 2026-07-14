import type { ApiUserAccessItem } from "@/types/api/user-access"
import type { ReportPermission } from "@/types/user-access"

function text(value: string | null | undefined) {
  return (value ?? "").trim()
}

function isYes(value: string | null | undefined) {
  return text(value).toUpperCase() === "Y"
}

function sameLocation(
  locationId: string | null | undefined,
  currentLocationId: string
) {
  return text(locationId).toLowerCase() === text(currentLocationId).toLowerCase()
}

/** Dedupe by PermDesc + PermUserPos — UserAcessVM.GetPermDescList. */
export function dedupeUserAccessItems(
  items: ApiUserAccessItem[]
): ApiUserAccessItem[] {
  const result: ApiUserAccessItem[] = []
  const seen = new Set<string>()

  for (const item of items ?? []) {
    const key = `${text(item.PermDesc).toLowerCase()}|${text(item.PermUserPos).toUpperCase()}`
    if (seen.has(key)) continue
    seen.add(key)
    result.push({
      ...item,
      PermDesc: text(item.PermDesc),
      PermType: text(item.PermType),
      PermUserPos: text(item.PermUserPos),
      PermAccess1: text(item.PermAccess1),
    })
  }

  return result
}

/**
 * Pivot API rows into one report permission row per PermDesc.
 * Mirrors UserAcessVM GetAdmin/User/Manager lists + GetFinalAceessList.
 */
export function mapUserAccessPermissions(
  items: ApiUserAccessItem[],
  locationId: string
): ReportPermission[] {
  const deduped = dedupeUserAccessItems(items)

  const adminByDesc = new Map<string, boolean>()
  const userByDesc = new Map<string, boolean>()
  const managerByDesc = new Map<string, boolean>()

  for (const item of deduped) {
    const desc = text(item.PermDesc)
    const role = text(item.PermUserPos).toUpperCase()
    const type = text(item.PermType)
    if (!desc || type !== "Report") continue

    if (role === "SEC01") {
      adminByDesc.set(desc, isYes(item.PermAccess1))
    } else if (role === "SEC02") {
      userByDesc.set(desc, isYes(item.PermAccess1))
    } else if (role === "SEC05" && sameLocation(item.LocationID, locationId)) {
      managerByDesc.set(desc, isYes(item.PermAccess1))
    }
  }

  const names = [
    ...new Set(
      deduped
        .map((item) => text(item.PermDesc))
        .filter(Boolean)
    ),
  ].sort((a, b) => a.localeCompare(b))

  return names.map((name) => ({
    id: name,
    name,
    user: userByDesc.get(name) ?? false,
    manager: managerByDesc.get(name) ?? false,
    admin: adminByDesc.get(name) ?? false,
  }))
}
