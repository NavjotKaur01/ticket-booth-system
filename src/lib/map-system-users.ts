import { formatApiDateTime } from "@/lib/format-datetime"
import type { ApiSystemUser } from "@/types/api/system-users"
import type { AdminUser } from "@/types/user-admin"

function normalizeText(value: string) {
  return value.replace(/\s+/g, " ").trim()
}

function mapActiveStatus(active: string) {
  return active.trim().toUpperCase() === "Y" ? "Active" : "Inactive"
}

function mapPasswordDisplay(user: ApiSystemUser) {
  if (user.PasswordForUser.trim().toLowerCase() !== "visible") {
    return "**********"
  }

  return normalizeText(user.Password)
}

export function mapSystemUsers(users: ApiSystemUser[]): AdminUser[] {
  return users.map((user) => ({
    id: user.UserID,
    lastName: normalizeText(user.LastName),
    firstName: normalizeText(user.FirstName),
    userName: normalizeText(user.UserName),
    password: mapPasswordDisplay(user),
    security: normalizeText(user.Security),
    lastUpdateId: normalizeText(user.LastUpdateID),
    lastUpdateDt: formatApiDateTime(user.LastUpdateDt),
    status: mapActiveStatus(user.Active),
  }))
}
