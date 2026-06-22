import {
  securityLevelByLabel,
  securityLevelOptions,
} from "@/data/users"
import { formatApiDateTime } from "@/lib/format-datetime"
import type {
  AdminUser,
  AdminUserFormValues,
  AdminUserSearchFilters,
} from "@/types/user-admin"

export function adminUserToFormValues(user: AdminUser): AdminUserFormValues {
  const password = user.password === "**********" ? "" : user.password

  return {
    lastName: user.lastName,
    firstName: user.firstName,
    email: user.email,
    userName: user.userName,
    password,
    confirmPassword: password,
    security: securityLevelByLabel[user.security] ?? "",
    status: user.status.toLowerCase(),
  }
}

export function formValuesToAdminUser(
  user: AdminUser,
  form: AdminUserFormValues,
  lastUpdateId: string
): AdminUser {
  const securityLabel =
    securityLevelOptions.find((option) => option.id === form.security)?.label ??
    user.security

  return {
    ...user,
    lastName: form.lastName.trim(),
    firstName: form.firstName.trim(),
    email: form.email.trim(),
    userName: form.userName.trim(),
    password: form.password,
    security: securityLabel,
    status: form.status === "active" ? "Active" : "Inactive",
    lastUpdateId: lastUpdateId.trim(),
    lastUpdateDt: formatApiDateTime(new Date().toISOString()),
  }
}

export function syncFiltersAfterUserEdit(
  previousUser: AdminUser,
  updatedUser: AdminUser,
  filters: AdminUserSearchFilters
): AdminUserSearchFilters {
  return {
    ...filters,
    lastName:
      filters.lastName && previousUser.lastName === filters.lastName
        ? updatedUser.lastName
        : filters.lastName,
    firstName:
      filters.firstName && previousUser.firstName === filters.firstName
        ? updatedUser.firstName
        : filters.firstName,
    userName:
      filters.userName && previousUser.userName === filters.userName
        ? updatedUser.userName
        : filters.userName,
  }
}
