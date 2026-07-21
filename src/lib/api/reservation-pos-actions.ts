/**
 * Reservation/payment peripheral actions.
 * Assign seat table nums use UpdateTableNumberReservation (desktop shape).
 */

import { dispatchEndpoint } from "@/lib/api/dispatch-endpoint"
import { buildUpdateTableNumberReservationRequest } from "@/lib/build-assign-seats-request"
import {
  buildRefundPaymentRequest,
  buildVoidPaymentRequest,
} from "@/lib/build-refund-payment-request"
import { clubmanApi } from "@/store/api/clubmanApi"
import type { ApiPaymentDetail } from "@/types/api/reservation-payment-actions"

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

/** GetPaymentById — full payment record (decrypted card + type codes). */
export async function getReservationPaymentById(params: {
  connectionName: string
  paymentId: string
}): Promise<ApiPaymentDetail> {
  return dispatchEndpoint<ApiPaymentDetail, typeof params>(
    clubmanApi.endpoints.getPaymentById,
    params
  )
}

/** Desktop RefundPayment — refunds the selected card for RefundAmount. */
export async function refundReservationPayment(params: {
  connectionName: string
  locationId: string
  lastUpdateId: string
  refundAmount: number
  payment: ApiPaymentDetail
}): Promise<unknown> {
  const request = buildRefundPaymentRequest(params)
  return dispatchEndpoint(clubmanApi.endpoints.refundPayment, request)
}

/** Desktop VoidCreditAndGiftCardPayment — voids one payment by id. */
export async function voidReservationPayment(params: {
  connectionName: string
  locationId: string
  lastUpdateId: string
  paymentId: string
}): Promise<unknown> {
  const request = buildVoidPaymentRequest(params)
  return dispatchEndpoint(
    clubmanApi.endpoints.voidCreditAndGiftCardPayment,
    request
  )
}

/** Placeholder until POS bridge / printer kick is wired for Check-in. */
export async function openCashDrawer(): Promise<{ message: string }> {
  return {
    message: "Cash drawer is not available yet.",
  }
}

export async function revealMaskedCardNumber(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _params: ReservationPaymentActionParams
): Promise<never> {
  throw new Error(
    "Display is not available yet — revealing a masked card number requires a dedicated, PCI-compliant backend endpoint that does not exist."
  )
}
