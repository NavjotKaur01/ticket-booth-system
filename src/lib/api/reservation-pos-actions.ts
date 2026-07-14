/**
 * Stubs for reservation/payment actions that have no backend endpoint yet
 * (confirmed against src/store/api/clubmanApi.ts as of this change).
 *
 * TODO: backend not available yet — replace each stub with a real
 * dispatchEndpoint/RTK Query call once the corresponding endpoint exists.
 * The function signatures below are intentionally the only thing UI code
 * depends on, so swapping the implementation later requires no UI changes.
 */

export type AssignReservationSeatParams = {
  connectionName: string
  locationId: string
  reservationId: string
  tableNums: string
  lastUpdateId: string
}

export async function assignReservationSeat (
  _params: AssignReservationSeatParams
): Promise<never> {
  throw new Error(
    'Assign Seat is not available yet — the table assignment endpoint has not been implemented on the backend.'
  )
}

export type ReservationPaymentActionParams = {
  connectionName: string
  locationId: string
  reservationId: string
  lastUpdateId: string
}

export async function refundReservationPayment (
  _params: ReservationPaymentActionParams
): Promise<never> {
  throw new Error(
    'Refund is not available yet — the payment refund endpoint has not been implemented on the backend.'
  )
}

export async function voidReservationPayment (
  _params: ReservationPaymentActionParams
): Promise<never> {
  throw new Error(
    'Void is not available yet — the payment void endpoint has not been implemented on the backend.'
  )
}

export async function clearReservationPayment (
  _params: ReservationPaymentActionParams
): Promise<never> {
  throw new Error(
    'Clear is not available yet — the payment clear endpoint has not been implemented on the backend.'
  )
}

export async function openCashDrawer (): Promise<never> {
  throw new Error(
    'Cash Drawer is not available yet — this requires POS hardware integration that has not been implemented.'
  )
}

export async function captureCardSwipe (): Promise<never> {
  throw new Error(
    'Swipe is not available yet — this requires a card reader integration that has not been implemented.'
  )
}

export async function revealMaskedCardNumber (
  _params: ReservationPaymentActionParams
): Promise<never> {
  throw new Error(
    'Display is not available yet — revealing a masked card number requires a dedicated, PCI-compliant backend endpoint that does not exist.'
  )
}


