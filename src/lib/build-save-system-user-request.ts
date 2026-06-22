import { userRightBySecurityLevel } from "@/data/users"
import { formatApiDateTime } from "@/lib/format-datetime"
import type { SaveSystemUserRequest } from "@/types/api/system-users"
import type { AdminUserFormValues } from "@/types/user-admin"

export const NEW_SYSTEM_USER_ID = "00000000-0000-0000-0000-000000000000"

type BuildSaveSystemUserRequestParams = {
  connectionName: string
  locationId: string
  lastUpdateId: string
  form: AdminUserFormValues
}

export function buildSaveSystemUserRequest({
  connectionName,
  locationId,
  lastUpdateId,
  form,
}: BuildSaveSystemUserRequestParams): SaveSystemUserRequest {
  return {
    ConnectionName: connectionName,
    Email: form.email.trim(),
    FirstName: form.firstName.trim(),
    LastName: form.lastName.trim(),
    LastUpdateDt: formatApiDateTime(new Date().toISOString()),
    LastUpdateId: lastUpdateId,
    LocationID: locationId,
    Password: form.password,
    Security: null,
    UserId: NEW_SYSTEM_USER_ID,
    UserName: form.userName.trim(),
    UserRight: userRightBySecurityLevel[form.security] ?? "SEC02",
    Active: form.status === "active" ? "Y" : "N",
  }
}
