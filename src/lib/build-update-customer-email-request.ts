import type { UpdateCustomerEmailRequest } from "@/types/api/update-customer-email"

/** Matches desktop CheckInVM.ResendTicketEmail → AdminstratorApi.UpdateCustomerEmail. */
export function buildUpdateCustomerEmailRequest({
  connectionName,
  locationId,
  reservationId,
  email,
}: {
  connectionName: string
  locationId: string
  reservationId: string
  email: string
}): UpdateCustomerEmailRequest {
  return {
    LocationId: locationId,
    ConnectionString: connectionName,
    ConnectionName: connectionName,
    ReservationId: reservationId,
    Email1: email.trim(),
  }
}
