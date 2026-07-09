import { MoreVertical } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const ROW_ACTIONS = [
  "Check-In",
  "Move Reservation",
  "Print Ticket(s)",
  "Print Individual Tickets",
  "Print Receipt",
  "Print Signature",
  "Reservation History",
  "Add Note",
  "Resend Ticket",
] as const

type RowActionsMenuProps = {
  isCancelled?: boolean
  onCancelReservation?: () => void
  onUnCancelReservation?: () => void
  onCheckIn?: () => void
  onMoveReservation?: () => void
  onPrintTickets?: () => void
  onPrintIndividualTickets?: () => void
  onPrintReceipt?: () => void
  onReservationHistory?: () => void
  onAddNote?: () => void
  onPrintSignature?: () => void
}

/** Three-dot row action menu shared by Reservations and Check-In tables. */
export function RowActionsMenu({
  isCancelled = false,
  onCancelReservation,
  onUnCancelReservation,
  onCheckIn,
  onMoveReservation,
  onPrintTickets,
  onPrintIndividualTickets,
  onPrintReceipt,
  onReservationHistory,
  onAddNote,
  onPrintSignature,
}: RowActionsMenuProps) {
  const cancelActionLabel = isCancelled
    ? "UnCancel Reservation"
    : "Cancel Reservation"

  function handleActionSelect(
    action: typeof cancelActionLabel | (typeof ROW_ACTIONS)[number]
  ) {
    if (action === "Cancel Reservation") {
      onCancelReservation?.()
      return
    }

    if (action === "UnCancel Reservation") {
      onUnCancelReservation?.()
      return
    }

    if (action === "Move Reservation") {
      onMoveReservation?.()
      return
    }

    if (action === "Check-In") {
      onCheckIn?.()
      return
    }

    if (action === "Print Ticket(s)") {
      onPrintTickets?.()
      return
    }

    if (action === "Print Individual Tickets") {
      onPrintIndividualTickets?.()
      return
    }

    if (action === "Print Receipt") {
      onPrintReceipt?.()
      return
    }

    if (action === "Reservation History") {
      onReservationHistory?.()
      return
    }

    if (action === "Add Note") {
      onAddNote?.()
      return
    }

    if (action === "Print Signature") {
      onPrintSignature?.()
      return
    }
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
      <DropdownMenuContent align="end" className="min-w-[12.5rem]">
        <DropdownMenuItem onSelect={() => handleActionSelect(cancelActionLabel)}>
          {cancelActionLabel}
        </DropdownMenuItem>
        {ROW_ACTIONS.map((action) => (
          <DropdownMenuItem
            key={action}
            onSelect={() => handleActionSelect(action)}
          >
            {action}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
