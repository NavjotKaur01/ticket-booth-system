import { useState } from "react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AssignSeatsPanel,
  type AssignSeatsSaveResult,
} from "@/features/assign-seats"
import type { Reservation } from "@/types/reservation"

type AssignSeatsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  connectionName: string
  locationId: string
  showId: string
  username: string
  reservation?: Reservation | null
  checkInAfterSave?: boolean
  isSubmitting?: boolean
  error?: string | null
  /** Open on top of another dialog (Quick Play / Reservation Payment). */
  nested?: boolean
  onSaved: (payload: {
    result: AssignSeatsSaveResult
    checkInAfterSave: boolean
    reservationId: string | null
  }) => void | Promise<void>
}

/**
 * Assign Seats dialog — same workspace as ClubMan AssignSeats,
 * chrome matches site DialogHeader / border theme.
 */
export function AssignSeatsDialog({
  open,
  onOpenChange,
  connectionName,
  locationId,
  showId,
  username,
  reservation = null,
  checkInAfterSave = false,
  isSubmitting = false,
  error = null,
  nested = false,
  onSaved,
}: AssignSeatsDialogProps) {
  const [panelError, setPanelError] = useState<string | null>(null)

  const guestLabel = reservation
    ? [reservation.lastName, reservation.firstName].filter(Boolean).join(", ")
    : ""

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        nested={nested}
        disableOutsideDismiss={nested}
        className="flex h-[min(670px,90vh)] max-h-[90vh] w-[min(calc(100vw-2rem),72rem)] max-w-[72rem] flex-col gap-0 overflow-hidden p-0 sm:max-w-[72rem]"
      >
        <DialogHeader className="shrink-0 border-b border-border/50 px-4 py-3 pr-12">
          <DialogTitle className="truncate text-base font-semibold text-foreground">
            Assign Seats
            {guestLabel ? (
              <span className="font-normal text-muted-foreground">
                {" "}
                — {guestLabel}
              </span>
            ) : null}
            {connectionName ? (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({connectionName})
              </span>
            ) : null}
          </DialogTitle>
        </DialogHeader>

        {open && showId ? (
          <AssignSeatsPanel
            connectionName={connectionName}
            locationId={locationId}
            showId={showId}
            username={username}
            initialReservationId={reservation?.id ?? null}
            isSubmitting={isSubmitting}
            error={error ?? panelError}
            onError={setPanelError}
            onSaved={async (result) => {
              await onSaved({
                result,
                checkInAfterSave,
                reservationId: reservation?.id ?? null,
              })
            }}
          />
        ) : (
          <p className="p-4 text-sm text-muted-foreground">
            Select a show before assigning seats.
          </p>
        )}
      </DialogContent>
    </Dialog>
  )
}
