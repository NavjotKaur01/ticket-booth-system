export type ReservationCheckInRequest = {
  ConnectionString: string
  ReservationId: string
  LastUpdateDt: string
  LastUpdateId: string
}

/** Undo full party check-in — note casing of LastUpdateID vs CheckIn. */
export type RevertReservationCheckInRequest = {
  ConnectionString: string
  ReservationId: string
  LastUpdateDt: string
  LastUpdateID: string
}
