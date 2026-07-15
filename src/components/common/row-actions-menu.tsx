import { MoreVertical } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type RowActionsMenuProps = {
  isCancelled?: boolean
  onCancelReservation?: () => void
  onUnCancelReservation?: () => void
  onCheckIn?: () => void
  onUnCheckIn?: () => void
  onPartialCheckInOrSplit?: () => void
  onPartialUnscan?: () => void
  onQuickPay?: () => void
  onAssignSeats?: () => void
  onAssignSeatsAndCheckIn?: () => void
  onMoveReservation?: () => void
  onPrintTickets?: () => void
  onPrintIndividualTickets?: () => void
  onPrintReceipt?: () => void
  onReservationHistory?: () => void
  onAddNote?: () => void
  onPrintSignature?: () => void
  onResendTicket?: () => void
}

type MenuAction = {
  label: string
  onSelect: () => void
}

/** Three-dot row action menu shared by Reservations and Check-In tables. */
export function RowActionsMenu({
  isCancelled = false,
  onCancelReservation,
  onUnCancelReservation,
  onCheckIn,
  onUnCheckIn,
  onPartialCheckInOrSplit,
  onPartialUnscan,
  onQuickPay,
  onAssignSeats,
  onAssignSeatsAndCheckIn,
  onMoveReservation,
  onPrintTickets,
  onPrintIndividualTickets,
  onPrintReceipt,
  onReservationHistory,
  onAddNote,
  onPrintSignature,
  onResendTicket,
}: RowActionsMenuProps) {
  const actions: MenuAction[] = []

  if (isCancelled && onUnCancelReservation) {
    actions.push({
      label: "UnCancel Reservation",
      onSelect: onUnCancelReservation,
    })
  } else if (!isCancelled && onCancelReservation) {
    actions.push({
      label: "Cancel Reservation",
      onSelect: onCancelReservation,
    })
  }

  if (onCheckIn) {
    actions.push({ label: "Check-In", onSelect: onCheckIn })
  }
  if (onUnCheckIn) {
    actions.push({ label: "UnCheck-In", onSelect: onUnCheckIn })
  }
  if (onPartialCheckInOrSplit) {
    actions.push({
      label: "Partial Check-In/Split",
      onSelect: onPartialCheckInOrSplit,
    })
  }
  if (onPartialUnscan) {
    actions.push({ label: "Partial Un-scan", onSelect: onPartialUnscan })
  }
  if (onQuickPay) {
    actions.push({ label: "Quick Pay", onSelect: onQuickPay })
  }
  if (onAssignSeats) {
    actions.push({ label: "Assign Seats", onSelect: onAssignSeats })
  }
  if (onAssignSeatsAndCheckIn) {
    actions.push({
      label: "Assign Seats And Check-In",
      onSelect: onAssignSeatsAndCheckIn,
    })
  }
  if (onMoveReservation) {
    actions.push({ label: "Move Reservation", onSelect: onMoveReservation })
  }
  if (onPrintTickets) {
    actions.push({ label: "Print Ticket(s)", onSelect: onPrintTickets })
  }
  if (onPrintIndividualTickets) {
    actions.push({
      label: "Print Individual Tickets",
      onSelect: onPrintIndividualTickets,
    })
  }
  if (onPrintReceipt) {
    actions.push({ label: "Print Receipt", onSelect: onPrintReceipt })
  }
  if (onPrintSignature) {
    actions.push({ label: "Print Signature", onSelect: onPrintSignature })
  }
  if (onReservationHistory) {
    actions.push({
      label: "Reservation History",
      onSelect: onReservationHistory,
    })
  }
  if (onAddNote) {
    actions.push({ label: "Add Note", onSelect: onAddNote })
  }
  if (onResendTicket) {
    actions.push({ label: "Resend Ticket", onSelect: onResendTicket })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Row actions"
        >
          <MoreVertical className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-50">
        {actions.length === 0 ? (
          <DropdownMenuItem disabled>No actions</DropdownMenuItem>
        ) : (
          actions.map((action) => (
            <DropdownMenuItem key={action.label} onSelect={action.onSelect}>
              {action.label}
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
