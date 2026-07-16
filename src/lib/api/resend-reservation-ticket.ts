import { dispatchEndpoint } from "@/lib/api/dispatch-endpoint"
import { buildUpdateCustomerEmailRequest } from "@/lib/build-update-customer-email-request"
import { clubmanApi } from "@/store/api/clubmanApi"

/**
 * Desktop resend ticket email uses a separate host (not ClubmanWebApi).
 * Success = HTTP 2xx (desktop does not parse GenericResponseModel).
 */
export async function resendReservationTicketEmail({
  reservationId,
  locationId,
  email,
  connectionName,
}: {
  reservationId: string
  locationId: string
  email: string
  connectionName: string
}) {
  const trimmedEmail = email.trim()
  if (!trimmedEmail) {
    throw new Error("Please enter valid email address. ")
  }

  if (!trimmedEmail.includes("@")) {
    throw new Error("Please enter valid email address. ")
  }

  const url =
    `https://apireservation.standupmedia.com/api/Ticket/SendReservationEmails/` +
    `${encodeURIComponent(reservationId)}/` +
    `${encodeURIComponent(locationId)}/` +
    `${encodeURIComponent(trimmedEmail)}/` +
    `${encodeURIComponent(connectionName)}`

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

export async function updateCustomerEmail({
  connectionName,
  customerId,
  email,
  lastUpdateId,
}: {
  connectionName: string
  customerId: string
  email: string
  lastUpdateId: string
}) {
  const request = buildUpdateCustomerEmailRequest({
    connectionName,
    customerId,
    email,
    lastUpdateId,
  })

  return dispatchEndpoint(
    clubmanApi.endpoints.updateCustomerEmail,
    request
  )
}
