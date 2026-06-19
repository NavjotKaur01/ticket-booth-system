import type { AdminUser, AdminUserSearchFilters } from "@/types/user-admin"

function matches(value: string, query: string) {
  if (!query) return true
  return value.toLowerCase().includes(query.toLowerCase())
}

export function filterAdminUsers(
  users: AdminUser[],
  filters: AdminUserSearchFilters
) {
  return users.filter((user) => {
    if (!matches(user.lastName, filters.lastName)) return false
    if (!matches(user.firstName, filters.firstName)) return false
    if (!matches(user.userName, filters.userName)) return false

    if (filters.securityLevel) {
      const security = user.security.toLowerCase()
      if (filters.securityLevel === "administrator" && security !== "administrator") {
        return false
      }
      if (filters.securityLevel === "manager" && security !== "manager") {
        return false
      }
      if (filters.securityLevel === "user" && security !== "user") {
        return false
      }
    }

    if (filters.active) {
      const status = user.status.toLowerCase()
      if (filters.active === "active" && status !== "active") return false
      if (filters.active === "inactive" && status !== "inactive") return false
    }

    return true
  })
}
