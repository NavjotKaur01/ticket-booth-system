import { useEffect, useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  calculateSalesTransactionChange,
  type ExpressPaymentType,
} from "@/features/check-in/service/express-panel.service"

type SalesTransactionDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  paymentType: ExpressPaymentType
  paymentDue: number
  /** Receives tendered amount when Ok is pressed (must be >= paymentDue). */
  onOk?: (paymentAmount: number) => void
}

function formatDialogMoney(value: number) {
  return value.toFixed(2)
}

export function SalesTransactionDialog({
  open,
  onOpenChange,
  paymentType,
  paymentDue,
  onOk,
}: SalesTransactionDialogProps) {
  const [paymentAmount, setPaymentAmount] = useState(formatDialogMoney(paymentDue))

  useEffect(() => {
    if (open) {
      setPaymentAmount(formatDialogMoney(paymentDue))
    }
  }, [open, paymentDue])

  const numericPaymentAmount = useMemo(
    () => Math.max(0, Number(paymentAmount) || 0),
    [paymentAmount]
  )
  const change = useMemo(
    () =>
      calculateSalesTransactionChange({
        paymentAmount: numericPaymentAmount,
        paymentDue,
      }),
    [numericPaymentAmount, paymentDue]
  )
  const isShortPayment = numericPaymentAmount + 0.001 < paymentDue

  function handleOk() {
    if (isShortPayment) {
      return
    }

    onOk?.(numericPaymentAmount)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        nested
        showCloseButton
        className="max-w-sm overflow-hidden p-0 sm:max-w-sm"
      >
        <DialogHeader className="shrink-0 border-b bg-primary px-4 py-3 pr-12 text-primary-foreground">
          <DialogTitle className="text-base font-semibold">
            Sales Transaction
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-0 sm:grid-cols-[10.5rem_minmax(0,1fr)]">
          <div className="space-y-5 border-b px-4 py-4 text-sm sm:border-r sm:border-b-0 sm:px-5">
            <div>Payment Type</div>
            <div>Payment Amount</div>
            <div>Payment Due</div>
            <div>Change</div>
          </div>

          <div className="space-y-4 px-4 py-4 sm:px-5">
            <div className="text-sm font-medium">{paymentType}</div>

            <Input
              value={paymentAmount}
              onChange={(event) => setPaymentAmount(event.target.value)}
              className="h-9 tabular-nums"
              inputMode="decimal"
            />

            <div className="text-sm font-medium tabular-nums">
              {formatDialogMoney(paymentDue)}
            </div>

            <div className="text-sm font-medium tabular-nums">
              {formatDialogMoney(change)}
            </div>

            {isShortPayment ? (
              <p className="text-xs text-destructive">
                Express Pay requires full payment when reservation is made.
                Amount of payment is less then the amount due. Cannot continue.
              </p>
            ) : null}
          </div>
        </div>

        <DialogFooter className="shrink-0 border-t px-4 py-3 sm:justify-center">
          <Button
            type="button"
            className="min-w-20"
            onClick={handleOk}
            disabled={isShortPayment}
          >
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


