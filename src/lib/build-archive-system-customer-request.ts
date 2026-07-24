import type { ArchiveSystemCustomerRequest } from "@/types/api/system-users"

type BuildArchiveSystemCustomerRequestParams = {
  connectionName: string
  locationId: string
  userId: string
}

/** ClubMan UserVM.DeleteUser → ArchiveSystemCustomer body. */
export function buildArchiveSystemCustomerRequest({
  connectionName,
  locationId,
  userId,
}: BuildArchiveSystemCustomerRequestParams): ArchiveSystemCustomerRequest {
  return {
    ConnectionName: connectionName,
    LocationID: locationId,
    UserId: userId,
  }
}
