import { formatApiDateTime } from "@/lib/format-datetime"
import { normalizeUserRight } from "@/lib/auth/user-rights"
import type { UpdateSystemUserRequest } from "@/types/api/system-users"
import type { AdminUserFormValues } from "@/types/user-admin"

type BuildUpdateSystemUserRequestParams = {
  connectionName: string
  locationId: string
  lastUpdateId: string
  userId: string
  form: AdminUserFormValues
}

function mapFormStatusToUpdateActive(status: string) {
  return status === "active" ? "Active" : "Inactive"
}

export function buildUpdateSystemUserRequest({
  connectionName,
  locationId,
  lastUpdateId,
  userId,
  form,
}: BuildUpdateSystemUserRequestParams): UpdateSystemUserRequest {
  return {
    ConnectionName: connectionName,
    LocationID: locationId,
    LastUpdateID: lastUpdateId,
    LastUpdateDt: formatApiDateTime(new Date().toISOString()),
    UserId: userId,
    UserName: form.userName.trim(),
    LastName: form.lastName.trim(),
    FirstName: form.firstName.trim(),
    Email: form.email.trim(),
    Password: form.password,
    // Desktop: reqModel.UserRight = this.Security.LookUpCode
    UserRight: normalizeUserRight(form.security),
    Active: mapFormStatusToUpdateActive(form.status),
  }
}
