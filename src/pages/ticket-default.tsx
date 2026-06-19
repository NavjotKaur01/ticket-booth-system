import { useState } from "react"

import { Button } from "@/components/ui/button"
import { TicketDefaultsDialog } from "@/features/ticket-default/ticket-defaults-dialog"

export function TicketDefault() {
  const [open, setOpen] = useState(true)

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold tracking-tight text-foreground">
        Ticket Defaults
      </h1>

      {!open && (
        <Button type="button" size="sm" onClick={() => setOpen(true)}>
          Edit Ticket Defaults
        </Button>
      )}

      <TicketDefaultsDialog open={open} onOpenChange={setOpen} />
    </div>
  )
}
