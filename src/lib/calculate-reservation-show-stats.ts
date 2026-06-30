import { RESERVATION_STATUS_ACTIVE } from "@/lib/reservation-lookup-codes"
import type { Reservation, ReservationCounts } from "@/types/reservation"

function isActiveReservation(
  reservation: Pick<Reservation, "resStatus" | "isCancelled">
) {
  if (reservation.isCancelled) {
    return false
  }

  const status = reservation.resStatus.trim().toUpperCase()
  return !status || status === RESERVATION_STATUS_ACTIVE
}

/** Desktop ReservationVM counts: active reservations only, seats from booth default. */
export function calculateReservationShowStats(
  totalSeatsCount: number,
  reservations: Pick<
    Reservation,
    "qty" | "seated" | "scanner" | "resStatus" | "isCancelled"
  >[]
): ReservationCounts {
  const activeReservations = reservations.filter(isActiveReservation)
  const reserved = activeReservations.reduce(
    (total, reservation) => total + reservation.qty,
    0
  )
  const seated = activeReservations.reduce(
    (total, reservation) => total + reservation.seated,
    0
  )
  const scanned = activeReservations.reduce(
    (total, reservation) => total + reservation.scanner,
    0
  )

  return {
    seats: totalSeatsCount,
    reservation: reserved,
    available: totalSeatsCount - reserved,
    seated,
    scanned,
  }
}
