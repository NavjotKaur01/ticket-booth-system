import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type ExpressWalkupPaymentMethodDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  totalLabel: string
  showExpress?: boolean
  onQuickPay: () => void
  onOther: () => void
  onExpress: () => void
}

/** Desktop ExpressWalkupReservation confirmPop — Payment Method chooser. */
export function ExpressWalkupPaymentMethodDialog({
  open,
  onOpenChange,
  totalLabel,
  showExpress = true,
  onQuickPay,
  onOther,
  onExpress,
}: ExpressWalkupPaymentMethodDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        nested
        showCloseButton
        className="max-w-sm overflow-hidden p-0 sm:max-w-sm"
      >
        <DialogHeader className="shrink-0 border-b bg-primary px-4 py-3 pr-12 text-primary-foreground">
          <DialogTitle className="text-base font-semibold">
            Payment Method
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 px-4 py-4">
          <p className="text-sm text-foreground">
            Please select payment method{" "}
            <span className="font-semibold tabular-nums">{totalLabel}</span>
          </p>

          <div className="flex flex-wrap items-end justify-center gap-4 pt-1">
            <div className="flex flex-col items-center gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">
                Credit Card
              </span>
              <Button
                type="button"
                className="min-w-[4.5rem] bg-emerald-600 text-white hover:bg-emerald-700"
                onClick={onQuickPay}
              >
                Quick Pay
              </Button>
            </div>

            <Button
              type="button"
              className="min-w-[4.5rem] bg-emerald-600 text-white hover:bg-emerald-700"
              onClick={onOther}
            >
              Other
            </Button>

            {showExpress ? (
              <Button
                type="button"
                className="min-w-[4.5rem] bg-emerald-600 text-white hover:bg-emerald-700"
                onClick={onExpress}
              >
                Express
              </Button>
            ) : null}
          </div>
        </div>

        <DialogFooter className="shrink-0 border-t px-4 py-3 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="min-w-20"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
