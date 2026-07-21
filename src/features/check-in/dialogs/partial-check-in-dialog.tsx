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
import { cn } from "@/lib/utils"

type PartialCheckInDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "check-in" | "unscan"
  lastName?: string
  firstName?: string
  partyNo?: number
  totalAmount?: string
  paidAmount?: string
  checkedIn?: number
  remaining?: number
  maxCount: number
  isSubmitting?: boolean
  error?: string | null
  onConfirm: (count: number) => void | Promise<void>
}

function formatMoneyDisplay(value: string | number | undefined) {
  if (value == null || value === "") {
    return "0.00"
  }
  if (typeof value === "number") {
    return value.toFixed(2)
  }
  const trimmed = value.trim().replace(/^\$/, "")
  const parsed = Number.parseFloat(trimmed)
  return Number.isFinite(parsed) ? parsed.toFixed(2) : trimmed
}

/** Desktop Partial Check-In / Partial Un-scan popup. */
export function PartialCheckInDialog({
  open,
  onOpenChange,
  mode,
  lastName = "",
  firstName = "",
  partyNo = 0,
  totalAmount = "0.00",
  paidAmount = "0.00",
  checkedIn = 0,
  remaining = 0,
  maxCount,
  isSubmitting = false,
  error = null,
  onConfirm,
}: PartialCheckInDialogProps) {
  const [selected, setSelected] = useState<number | null>(null)

  useEffect(() => {
    if (open) {
      setSelected(null)
    }
  }, [open])

  const title = mode === "check-in" ? "Partial Check-In" : "Partial Un-scan"
  const numberLabel =
    mode === "check-in"
      ? "Click the Number of Customer to Print on Ticket"
      : "Click the Number of Customer to Un-scan"
  // Desktop fills PrintButtonList with every available number and lets the
  // containing ScrollViewer handle large parties.
  const numbers = Array.from(
    { length: Math.max(0, Math.floor(maxCount)) },
    (_, index) => index + 1
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex max-w-lg flex-col overflow-hidden p-0 sm:max-w-lg"
      >
        <DialogHeader className="shrink-0 border-b px-4 py-3">
          <DialogTitle className="text-base font-semibold">{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 px-4 py-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="partial-last-name">Last Name</Label>
              <Input
                id="partial-last-name"
                value={lastName}
                readOnly
                className="h-9 bg-muted/40"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="partial-first-name">First Name</Label>
              <Input
                id="partial-first-name"
                value={firstName}
                readOnly
                className="h-9 bg-muted/40"
              />
            </div>
          </div>

          {mode === "check-in" ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <div className="space-y-1.5">
                  <Label>Number in Party</Label>
                  <Input
                    value={String(partyNo)}
                    readOnly
                    className="h-9 bg-muted/40"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Total Amount</Label>
                  <Input
                    value={formatMoneyDisplay(totalAmount)}
                    readOnly
                    className="h-9 bg-muted/40"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Paid Amount</Label>
                  <Input
                    value={formatMoneyDisplay(paidAmount)}
                    readOnly
                    className="h-9 bg-muted/40"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="space-y-1.5">
                  <Label>Checked In</Label>
                  <Input
                    value={String(checkedIn)}
                    readOnly
                    className="h-9 bg-muted/40"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Remaining</Label>
                  <Input
                    value={String(remaining)}
                    readOnly
                    className="h-9 bg-muted/40"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Number in Party</Label>
                <Input
                  value={String(partyNo)}
                  readOnly
                  className="h-9 bg-muted/40"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Scanned</Label>
                <Input
                  value={String(maxCount)}
                  readOnly
                  className="h-9 bg-muted/40"
                />
              </div>
            </div>
          )}

          <div>
            <p className="mb-2 text-sm font-medium text-foreground">
              {numberLabel}
            </p>
            {numbers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No seats available.</p>
            ) : (
              <div className="max-h-36 overflow-y-auto pr-1">
                <div className="flex flex-wrap gap-1.5">
                  {numbers.map((num) => (
                    <Button
                      key={num}
                      type="button"
                      variant={selected === num ? "default" : "outline"}
                      className={cn(
                        "size-9 rounded-sm p-0 text-sm font-semibold tabular-nums"
                      )}
                      disabled={isSubmitting}
                      onClick={() => setSelected(num)}
                    >
                      {num}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>

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
            disabled={!selected || selected > maxCount || isSubmitting}
            onClick={() => {
              if (selected) {
                void onConfirm(selected)
              }
            }}
          >
            {isSubmitting
              ? "Saving…"
              : mode === "check-in"
                ? "Print"
                : "OK"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
