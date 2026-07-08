import type { SystemRole } from "@/types/system-role"
import { USER_SETUP_ROLES } from "@/data/user-setup"

function toRoleId(name: string) {
  return name.toLowerCase().replace(/\s+/g, "-")
}

export const systemRoles: SystemRole[] = USER_SETUP_ROLES.map((name) => ({
  id: toRoleId(name),
  name,
}))

export function createSystemRole(name: string): SystemRole {
  const trimmed = name.trim()
  return {
    id: `${toRoleId(trimmed)}-${Date.now()}`,
    name: trimmed,
  }
}
