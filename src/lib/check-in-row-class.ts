import { cn } from "@/lib/utils"
import type { CheckInRecord } from "@/types/check-in"

/** Row tint rules from desktop Check-in (cancelled / moved). */
export function getCheckInRowClassName(record: CheckInRecord) {
  if (record.isCancelled) {
    return cn(
      "bg-red-200 hover:!bg-red-300",
      "dark:bg-red-950/45 dark:hover:!bg-red-950/55",
      "[&_td]:!bg-red-200 [&_td]:hover:!bg-red-300",
      "dark:[&_td]:!bg-red-950/45 dark:[&_td]:hover:!bg-red-950/55"
    )
  }

  if (record.oldReservationId.trim()) {
    return cn(
      "bg-sky-50 hover:!bg-sky-100",
      "dark:bg-sky-950/25 dark:hover:!bg-sky-950/35",
      "[&_td]:!bg-sky-50 [&_td]:hover:!bg-sky-100",
      "dark:[&_td]:!bg-sky-950/25 dark:[&_td]:hover:!bg-sky-950/35"
    )
  }

  return undefined
}
