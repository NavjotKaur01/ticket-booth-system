import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import type { Reservation } from "@/types/reservation"

type AssignSeatsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  reservation: Reservation | null
  checkInAfterSave?: boolean
  isSubmitting?: boolean
  error?: string | null
  onSave: (payload: {
    tableNums: string
    checkInAfterSave: boolean
  }) => void | Promise<void>
}

/** Minimal Assign Seats — updates table numbers (desktop chart deferred). */
export function AssignSeatsDialog({
  open,
  onOpenChange,
  reservation,
  checkInAfterSave: initialCheckIn = false,
  isSubmitting = false,
  error = null,
  onSave,
}: AssignSeatsDialogProps) {
  const [tableNums, setTableNums] = useState("")
  const [checkInAfterSave, setCheckInAfterSave] = useState(initialCheckIn)

  useEffect(() => {
    if (!open) {
      return
    }

    setTableNums(reservation?.tables ?? "")
    setCheckInAfterSave(initialCheckIn)
  }, [initialCheckIn, open, reservation])

  const guestName = reservation
    ? `${reservation.firstName} ${reservation.lastName}`.trim()
    : ""

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex max-w-md flex-col overflow-hidden p-0 sm:max-w-md"
      >
        <DialogHeader className="shrink-0 border-b px-4 py-3">
          <DialogTitle className="text-base font-semibold">
            Assign Seats
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 px-4 py-4">
          {guestName ? (
            <p className="text-sm text-muted-foreground">{guestName}</p>
          ) : null}
          <div className="space-y-1.5">
            <Label htmlFor="assign-table-nums">Table Nums</Label>
            <Input
              id="assign-table-nums"
              value={tableNums}
              onChange={(event) => setTableNums(event.target.value)}
              placeholder="e.g. 12, 13"
              className="h-9"
              disabled={isSubmitting}
            />
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <Checkbox
              checked={checkInAfterSave}
              onCheckedChange={(value) => setCheckInAfterSave(value === true)}
              disabled={isSubmitting}
            />
            Check-In after save
          </label>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>

        <DialogFooter className="shrink-0 border-t px-4 py-3 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={isSubmitting || !reservation}
            onClick={() => {
              void onSave({ tableNums, checkInAfterSave })
            }}
          >
            {isSubmitting ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
