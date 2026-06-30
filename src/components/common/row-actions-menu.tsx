import { MoreVertical } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const ROW_ACTIONS = [
  "Cancel Reservation",
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
  onCancelReservation?: () => void
  onPrintTickets?: () => void
  onPrintIndividualTickets?: () => void
}

/** Three-dot row action menu shared by Reservations and Check-In tables. */
export function RowActionsMenu({
  onCancelReservation,
  onPrintTickets,
  onPrintIndividualTickets,
}: RowActionsMenuProps) {
  function handleActionSelect(action: (typeof ROW_ACTIONS)[number]) {
    if (action === "Cancel Reservation") {
      onCancelReservation?.()
      return
    }

    if (action === "Print Ticket(s)") {
      onPrintTickets?.()
      return
    }

    if (action === "Print Individual Tickets") {
      onPrintIndividualTickets?.()
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
