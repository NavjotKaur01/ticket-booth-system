import { dispatchEndpoint } from "@/lib/api/dispatch-endpoint"
import { buildUpdateCustomerEmailRequest } from "@/lib/build-update-customer-email-request"
import { clubmanApi } from "@/store/api/clubmanApi"

/**
 * Desktop: ReservationApi.ResendReservationTicketConfirmation
 * GET https://apireservation.standupmedia.com/api/Ticket/SendReservationEmails/
 *   {reservationId}/{locationId}/{email}/{dbName}
 *
 * Last segment is UserCredentials.DBName (not ConnectionName).
 * Success = HTTP 2xx (desktop does not parse response body).
 */
export async function resendReservationTicketEmail({
  reservationId,
  locationId,
  email,
  dbName,
}: {
  reservationId: string
  locationId: string
  email: string
  /** Desktop UserCredentials.DBName */
  dbName: string
}) {
  const trimmedEmail = email.trim()
  if (!trimmedEmail) {
    throw new Error("Please enter valid email address. ")
  }

  if (!trimmedEmail.includes("@")) {
    throw new Error("Please enter valid email address. ")
  }

  const trimmedDb = dbName.trim()
  if (!trimmedDb) {
    throw new Error("Missing database name for ticket email.")
  }

  // Match desktop HttpClient path segments (email may contain @).
  const url =
    `https://apireservation.standupmedia.com/api/Ticket/SendReservationEmails/` +
    `${encodeURIComponent(reservationId)}/` +
    `${encodeURIComponent(locationId)}/` +
    `${encodeURIComponent(trimmedEmail)}/` +
    `${encodeURIComponent(trimmedDb)}`

  const response = await fetch(url, { method: "GET" })
  if (!response.ok) {
    let detail = ""
    try {
      const text = await response.text()
      detail = text.trim().slice(0, 200)
    } catch {
      // ignore body parse failures
    }

    throw new Error(
      detail
        ? `Failed to resend ticket email (HTTP ${response.status}): ${detail}`
        : `Failed to resend ticket email (HTTP ${response.status})`
    )
  }

  return true
}

/**
 * Desktop overwrite path: AdminstratorApi.UpdateCustomerEmail(CustomerRequestModel
 * with ReservationId + Email1 — not CustomerId).
 */
export async function updateCustomerEmail({
  connectionName,
  locationId,
  reservationId,
  email,
}: {
  connectionName: string
  locationId: string
  reservationId: string
  email: string
}) {
  const request = buildUpdateCustomerEmailRequest({
    connectionName,
    locationId,
    reservationId,
    email,
  })

  return dispatchEndpoint(
    clubmanApi.endpoints.updateCustomerEmail,
    request
  )
}
