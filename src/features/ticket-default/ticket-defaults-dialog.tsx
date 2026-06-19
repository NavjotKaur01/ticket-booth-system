import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  DEFAULT_TICKET_DEFAULT_FORM,
  type TicketDefaultFormValues,
} from "@/types/ticket-default"

type TicketDefaultsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TicketDefaultsDialog({
  open,
  onOpenChange,
}: TicketDefaultsDialogProps) {
  const [form, setForm] = useState<TicketDefaultFormValues>(
    DEFAULT_TICKET_DEFAULT_FORM
  )

  useEffect(() => {
    if (!open) {
      setForm(DEFAULT_TICKET_DEFAULT_FORM)
    }
  }, [open])

  function updateField<K extends keyof TicketDefaultFormValues>(
    field: K,
    value: TicketDefaultFormValues[K]
  ) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function handleSave() {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="flex max-h-[92vh] max-w-2xl flex-col overflow-hidden sm:max-w-2xl"
      >
        <DialogHeader className="shrink-0 gap-0 border-b px-4 py-3 pr-12">
          <DialogTitle className="text-lg leading-snug font-normal">
            <span className="font-semibold text-foreground">Ticket Defaults</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 overflow-y-auto px-4 py-3">
          <div className="grid gap-2 sm:grid-cols-[7.5rem_minmax(0,1fr)] sm:items-start">
            <Label
              htmlFor="ticket-default-middle-text"
              className="pt-2 text-xs font-medium"
            >
              Middle Text
            </Label>
            <Textarea
              id="ticket-default-middle-text"
              value={form.middleText}
              onChange={(event) =>
                updateField("middleText", event.target.value)
              }
              className="min-h-24 resize-y"
            />
          </div>

          <div className="grid gap-2 sm:grid-cols-[7.5rem_minmax(0,1fr)] sm:items-start">
            <Label
              htmlFor="ticket-default-bottom-text"
              className="pt-2 text-xs font-medium"
            >
              Bottom Text
            </Label>
            <Textarea
              id="ticket-default-bottom-text"
              value={form.bottomText}
              onChange={(event) =>
                updateField("bottomText", event.target.value)
              }
              className="min-h-24 resize-y"
            />
          </div>
        </div>

        <DialogFooter className="shrink-0 border-t px-4 py-2 sm:justify-end">
          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleSave}>
              Save
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
