import { useMemo, useState } from "react"

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
import { buildPaymentAssignSeatSeed } from "@/features/assign-seats/assign-seats.service"
import type { ApiReservationToAssignSeat } from "@/types/api/assign-seats"
import type { Reservation } from "@/types/reservation"

type AssignSeatsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  connectionName: string
  locationId: string
  showId: string
  username: string
  reservation?: Reservation | null
  /**
   * Desktop ReservationPayment seed fields (Party / SeatNumbers / section…).
   * When nested (payment) or paymentSeed is set, Assign Seats uses the local
   * ReservationList path — same as CheckInVM.GetReservationsToAssignSeats(resList).
   */
  paymentSeed?: {
    qty: number
    /** Desktop ResAssignSeatNumbers (seat labels), NOT TableNums. */
    seatNumbers?: string
    section?: string
    source?: string
    promo?: string
    notes?: string
    dinner?: boolean | string
  } | null
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
  paymentSeed = null,
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

  /**
   * Desktop payment always passes ReservationList with one guest.
   * Use local seed whenever this dialog is nested on Reservation Payment,
   * or when paymentSeed is explicitly provided.
   */
  const useLocalReservationList = nested || Boolean(paymentSeed)

  const seedReservations = useMemo((): ApiReservationToAssignSeat[] | null => {
    if (!reservation?.id || !useLocalReservationList) {
      return null
    }

    const qty =
      (paymentSeed?.qty && paymentSeed.qty > 0
        ? paymentSeed.qty
        : reservation.qty) || 1

    // Desktop Rem = Party − ResAssignSeatNumbers count (SeatNumbers), NOT TableNums.
    // Passing TableNums here zeroed Rem and hid the guest in the list.
    const seatNumbers = paymentSeed?.seatNumbers ?? reservation.seatNo ?? ""

    const seed = buildPaymentAssignSeatSeed({
      reservationId: reservation.id,
      firstName: reservation.firstName,
      lastName: reservation.lastName,
      businessName: reservation.businessName,
      qty,
      seatNumbers,
      section: paymentSeed?.section ?? reservation.section,
      source: paymentSeed?.source ?? reservation.source,
      promo: paymentSeed?.promo ?? reservation.promo,
      notes: paymentSeed?.notes ?? reservation.notes,
      dinner: paymentSeed?.dinner ?? reservation.din,
      createDt: reservation.createdDt,
      resStatus: reservation.resStatus,
    })
    return seed ? [seed] : null
  }, [
    paymentSeed?.dinner,
    paymentSeed?.notes,
    paymentSeed?.promo,
    paymentSeed?.qty,
    paymentSeed?.seatNumbers,
    paymentSeed?.section,
    paymentSeed?.source,
    reservation,
    useLocalReservationList,
  ])

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          setPanelError(null)
        }
        onOpenChange(nextOpen)
      }}
    >
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
            seedReservations={seedReservations}
            isSubmitting={isSubmitting}
            error={error ?? panelError}
            onError={setPanelError}
            onDismiss={() => onOpenChange(false)}
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
