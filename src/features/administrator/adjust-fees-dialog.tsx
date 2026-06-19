import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

const FEE_ROWS = [
  { id: "day-of-show", label: "Day of show", defaultValue: "1" },
  { id: "phone-charge", label: "Phone charge", defaultValue: "0.00" },
  { id: "walkup-charge", label: "Walkup charge", defaultValue: "0.00" },
  { id: "web-charge", label: "Web charge", defaultValue: "0.00" },
] as const

type AdjustFeesDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AdjustFeesDialog({ open, onOpenChange }: AdjustFeesDialogProps) {
  const [fees, setFees] = useState<Record<string, string>>({})

  function handleSave() {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="flex max-h-[92vh] max-w-lg flex-col overflow-hidden sm:max-w-lg"
      >
        <DialogHeader className="shrink-0 gap-0 border-b px-4 py-3 pr-12">
          <DialogTitle className="text-lg leading-snug font-normal">
            <span className="font-semibold text-foreground">Adjust Fees</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 overflow-y-auto px-4 py-3">
          <p className="text-sm leading-relaxed text-muted-foreground">
            This will adjust fees for all FUTURE shows(after today). Reservation
            will not be adjusted in the reservation changes.
          </p>

          <div className="grid grid-cols-[1fr_auto_auto] items-center gap-x-4 gap-y-3 text-sm">
            <span className="font-medium text-foreground">Fees Type</span>
            <span className="font-medium text-foreground">Default</span>
            <span className="font-medium text-foreground">Fees</span>

            {FEE_ROWS.map((row) => (
              <div key={row.id} className="contents">
                <span className="text-foreground">{row.label}</span>
                <span className="tabular-nums text-muted-foreground">
                  {row.defaultValue}
                </span>
                <Input
                  value={fees[row.id] ?? ""}
                  onChange={(event) =>
                    setFees((current) => ({
                      ...current,
                      [row.id]: event.target.value,
                    }))
                  }
                  className="h-8 w-24"
                />
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="shrink-0 border-t px-4 py-2">
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
