import { cn } from "@/lib/utils"
import type { Reservation } from "@/types/reservation"

/** Subtle highlight for cancelled reservations — light tint, not full desktop red. */
export function getReservationRowClassName(reservation: Reservation) {
  if (!reservation.isCancelled) {
    return undefined
  }

  return cn(
    "bg-red-50 hover:!bg-red-100",
    "dark:bg-red-950/25 dark:hover:!bg-red-950/35",
    "[&_td]:!bg-red-50 [&_td]:hover:!bg-red-100",
    "dark:[&_td]:!bg-red-950/25 dark:[&_td]:hover:!bg-red-950/35"
  )
}
