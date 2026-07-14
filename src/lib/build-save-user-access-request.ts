import { formatDesktopDateTime } from "@/lib/format-us-datetime"
import type { UserAccessRequestModel } from "@/types/api/user-access"
import type { ReportPermission } from "@/types/user-access"

/** ClubMan UserAcessVM.SaveUserAccess → SaveUserAccessbility body. */
export function buildSaveUserAccessRequest(params: {
  connectionName: string
  locationId: string
  lastUpdateId: string
  permissions: ReportPermission[]
}): UserAccessRequestModel {
  return {
    ConnectionString: params.connectionName,
    LocationID: params.locationId,
    LastUpdateID: params.lastUpdateId,
    LastUpdateDt: formatDesktopDateTime(new Date()),
    AccessbilityList: params.permissions.map((item) => ({
      PermDesc: item.name,
      IsUserAccess: item.user,
      IsManagerAccess: item.manager,
    })),
  }
}
