import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type ProcessPaymentDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  quantity: number
  paymentAmount: string
  onOk?: () => void
}

function MastercardMark() {
  return (
    <div className="relative flex h-20 w-32 items-center justify-center rounded-lg border border-red-400 bg-white shadow-sm">
      <div className="absolute left-[1.1rem] h-12 w-12 rounded-full bg-red-600" />
      <div className="absolute right-[1.1rem] h-12 w-12 rounded-full bg-amber-400" />
      <div className="absolute h-12 w-6 bg-orange-500/85" />
      <span className="relative z-10 text-xl font-bold italic text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.55)]">
        MasterCard
      </span>
    </div>
  )
}

export function ProcessPaymentDialog({
  open,
  onOpenChange,
  quantity,
  paymentAmount,
  onOk,
}: ProcessPaymentDialogProps) {
  function handleOk() {
    onOk?.()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        nested
        showCloseButton
        className="w-[min(94vw,27rem)] max-w-none overflow-hidden p-0 sm:max-w-none"
      >
        <DialogHeader className="shrink-0 border-b bg-primary px-4 py-3 pr-12 text-primary-foreground">
          <DialogTitle className="text-base font-semibold">
            Process Payment
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 px-4 py-5 sm:px-5">
          <p className="text-center text-[1.1rem] font-medium text-foreground">
            Please swipe credit card :
          </p>

          <div className="flex justify-center">
            <MastercardMark />
          </div>

          <section className="rounded-md border border-border/70 bg-muted/10 p-4">
            <h3 className="mb-3 text-sm font-medium text-foreground">
              Payment Details
            </h3>
            <div className="grid gap-2 text-sm sm:grid-cols-2">
              <div>
                Number of tickets : <span className="font-semibold">{quantity}</span>
              </div>
              <div>
                Payment Amount : <span className="font-semibold">{paymentAmount}</span>
              </div>
            </div>
          </section>
        </div>

        <DialogFooter className="shrink-0 border-t px-4 py-3 sm:justify-center">
          <Button type="button" className="min-w-20" onClick={handleOk}>
            Ok
          </Button>
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
