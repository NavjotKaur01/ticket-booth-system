import { normalizeUserRight } from "@/lib/auth/user-rights"
import { formatApiDateTime } from "@/lib/format-datetime"
import type { SecurityLevelOption } from "@/lib/security-lookup"
import type { AdminUser, AdminUserFormValues } from "@/types/user-admin"

export function adminUserToFormValues(user: AdminUser): AdminUserFormValues {
  const password = user.password === "**********" ? "" : user.password

  return {
    lastName: user.lastName,
    firstName: user.firstName,
    email: user.email,
    userName: user.userName,
    password,
    confirmPassword: password,
    // Always keep assigned LookUpCode (locked roles stay SEC01 on save).
    security: normalizeUserRight(user.userRight),
    status: user.status.toLowerCase(),
  }
}

export function formValuesToAdminUser(
  user: AdminUser,
  form: AdminUserFormValues,
  lastUpdateId: string,
  securityOptions: SecurityLevelOption[] = []
): AdminUser {
  const right = normalizeUserRight(form.security)
  const securityLabel =
    securityOptions.find(
      (option) => normalizeUserRight(option.id) === right
    )?.label ??
    user.security

  return {
    ...user,
    lastName: form.lastName.trim(),
    firstName: form.firstName.trim(),
    email: form.email.trim(),
    userName: form.userName.trim(),
    password: form.password,
    userRight: right,
    security: securityLabel,
    status: form.status === "active" ? "Active" : "Inactive",
    lastUpdateId: lastUpdateId.trim(),
    lastUpdateDt: formatApiDateTime(new Date().toISOString()),
  }
}

export function syncFiltersAfterUserEdit(
  previousUser: AdminUser,
  updatedUser: AdminUser,
  filters: {
    lastName: string
    firstName: string
    userName: string
    securityLevel: string
    active: string
  }
) {
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
