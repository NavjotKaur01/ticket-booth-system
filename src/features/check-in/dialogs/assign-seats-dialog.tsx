import { useState } from "react"

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AssignSeatsPanel,
  type AssignSeatsSaveResult,
} from "@/features/assign-seats"
import { ASSIGN_SEATS_BLUE } from "@/features/assign-seats/assign-seats-styles"
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
  onSaved: (payload: {
    result: AssignSeatsSaveResult
    checkInAfterSave: boolean
    reservationId: string | null
  }) => void | Promise<void>
}

/**
 * Desktop AssignSeats window chrome:
 * ~1120×670, blue #155abb title bar, fixed layout, X close.
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
  onSaved,
}: AssignSeatsDialogProps) {
  const [panelError, setPanelError] = useState<string | null>(null)

  const titleGuest = reservation
    ? ` — ${reservation.lastName} ${reservation.firstName}`.trim()
    : ""

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="flex h-[670px] max-h-[90vh] w-[1120px] max-w-[min(96vw,1150px)] flex-col gap-0 overflow-hidden rounded-[5px] border-0 p-0 sm:max-w-[min(96vw,1150px)]"
        style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.28)" }}
      >
        <div
          className="flex h-10 shrink-0 items-center justify-between px-2 pr-10"
          style={{ backgroundColor: ASSIGN_SEATS_BLUE }}
        >
          <DialogTitle className="text-sm font-semibold text-white">
            Assign Seats{titleGuest}
            {connectionName ? (
              <span className="ml-2 font-normal text-white/75">
                ({connectionName})
              </span>
            ) : null}
          </DialogTitle>
        </div>

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
