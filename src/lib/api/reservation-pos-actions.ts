/**
 * Reservation/payment peripheral actions.
 * Assign seat table nums use UpdateTableNumberReservation (desktop shape).
 */

import { dispatchEndpoint } from "@/lib/api/dispatch-endpoint"
import { buildUpdateTableNumberReservationRequest } from "@/lib/build-assign-seats-request"
import { clubmanApi } from "@/store/api/clubmanApi"

export type AssignReservationSeatParams = {
  connectionName: string
  locationId: string
  showId: string
  reservationId: string
  tableNums: string
  lastUpdateId?: string
  removeReservationIds?: string[]
}

/**
 * Desktop SaveTableNumberInReservation for one (or more) reservations.
 */
export async function assignReservationSeat(
  params: AssignReservationSeatParams
) {
  const request = buildUpdateTableNumberReservationRequest({
    connectionName: params.connectionName,
    locationId: params.locationId,
    showId: params.showId,
    removeReservationIds: params.removeReservationIds ?? [],
    addReservationIds: [
      {
        ReservationId: params.reservationId,
        Table: params.tableNums.trim(),
      },
    ],
  })
  return dispatchEndpoint(
    clubmanApi.endpoints.updateTableNumberReservation,
    request
  )
}

/** Batch UpdateTableNumberReservation like desktop (one PUT). */
export async function updateReservationTableNumbers({
  connectionName,
  locationId,
  showId,
  addReservationIds,
  removeReservationIds = [],
}: {
  connectionName: string
  locationId: string
  showId: string
  addReservationIds: Array<{ reservationId: string; tableNums: string }>
  removeReservationIds?: string[]
}) {
  const request = buildUpdateTableNumberReservationRequest({
    connectionName,
    locationId,
    showId,
    removeReservationIds,
    addReservationIds: addReservationIds.map((row) => ({
      ReservationId: row.reservationId,
      Table: row.tableNums.trim(),
    })),
  })
  return dispatchEndpoint(
    clubmanApi.endpoints.updateTableNumberReservation,
    request
  )
}

export type ReservationPaymentActionParams = {
  connectionName: string
  locationId: string
  reservationId: string
  lastUpdateId: string
}

export async function refundReservationPayment(
  _params: ReservationPaymentActionParams
): Promise<never> {
  throw new Error(
    "Refund is not available yet — the payment refund endpoint has not been implemented on the backend."
  )
}

export async function voidReservationPayment(
  _params: ReservationPaymentActionParams
): Promise<never> {
  throw new Error(
    "Void is not available yet — the payment void endpoint has not been implemented on the backend."
  )
}

export async function clearReservationPayment(
  _params: ReservationPaymentActionParams
): Promise<never> {
  throw new Error(
    "Clear is not available yet — the payment clear endpoint has not been implemented on the backend."
  )
}

/** Placeholder until POS bridge / printer kick is wired for Check-in. */
export async function openCashDrawer(): Promise<{ message: string }> {
  return {
    message: "Cash drawer is not available yet.",
  }
}

export async function revealMaskedCardNumber(
  _params: ReservationPaymentActionParams
): Promise<never> {
  throw new Error(
    "Display is not available yet — revealing a masked card number requires a dedicated, PCI-compliant backend endpoint that does not exist."
  )
}
