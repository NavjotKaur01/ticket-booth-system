import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  formatReservationMoney,
  parseReservationMoney,
} from '@/lib/calculate-reservation-totals'
import { toastError } from '@/lib/app-toast'

export type RefundCardOption = {
  paymentId: string
  label: string
  amount: number
}

export type RefundReservationDetails = {
  party: string
  promo: string
  subTotal: number
  serviceCharge: number
  discount: number
  total: number
  pricePerTicket: number
  totalPayment: number
}

type RefundOption = '1' | '2' | '3' | '4'

const REFUND_OPTION_LABELS: Record<RefundOption, string> = {
  '1': 'Refund Payment Amount',
  '2': 'Refund Payment Amount Minus Service Charge',
  '3': 'Refund Entire Amount',
  '4': 'Refund Entire Amount Minus Service Charge',
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100
}

export function RefundPaymentDialog({
  open,
  onOpenChange,
  cards,
  initialPaymentId,
  serviceCharge,
  paidAmount,
  details,
  busy = false,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  cards: RefundCardOption[]
  initialPaymentId: string
  serviceCharge: number
  paidAmount: number
  details: RefundReservationDetails
  busy?: boolean
  onConfirm: (paymentId: string, refundAmount: number) => void
}) {
  const [selectedPaymentId, setSelectedPaymentId] = useState(initialPaymentId)
  const [option, setOption] = useState<RefundOption>('1')
  const [refundAmount, setRefundAmount] = useState(() => {
    const card = cards.find((c) => c.paymentId === initialPaymentId) ?? null
    return formatReservationMoney(roundMoney(card?.amount ?? 0))
  })
  const selectedCard = useMemo(
    () => cards.find((card) => card.paymentId === selectedPaymentId) ?? null,
    [cards, selectedPaymentId]
  )

  const computeAmount = useMemo(() => {
    return (opt: RefundOption, card: RefundCardOption | null): number => {
      const cardAmount = card?.amount ?? 0
      switch (opt) {
        case '1':
          return roundMoney(cardAmount)
        case '2':
          return roundMoney(cardAmount - serviceCharge)
        case '3':
          return roundMoney(paidAmount)
        case '4':
          return roundMoney(paidAmount - serviceCharge)
        default:
          return roundMoney(cardAmount)
      }
    }
  }, [paidAmount, serviceCharge])

  function handleOptionChange(next: RefundOption) {
    setOption(next)
    setRefundAmount(formatReservationMoney(computeAmount(next, selectedCard)))
  }

  function handleCardChange(paymentId: string) {
    setSelectedPaymentId(paymentId)
    const card = cards.find((c) => c.paymentId === paymentId) ?? null
    // Desktop resets to the card's own amount when the card changes.
    setOption('1')
    setRefundAmount(formatReservationMoney(roundMoney(card?.amount ?? 0)))
  }

  function handleConfirm() {
    if (!selectedCard) {
      toastError('No payment selected to apply refund. Cannot refund.')
      return
    }

    const amount = roundMoney(parseReservationMoney(refundAmount))
    if (amount <= 0) {
      toastError('Amount entered must be greater than 0. Cannot refund.')
      return
    }
    if (amount > roundMoney(paidAmount)) {
      toastError(
        'Amount entered cannot be greater than total amount of payments.'
      )
      return
    }

    onConfirm(selectedCard.paymentId, amount)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        nested
        disableOutsideDismiss
        className="w-[620px] max-w-[calc(100%-2rem)] gap-0 overflow-hidden rounded-md p-0 [&_[data-slot=dialog-close]]:top-1.5 [&_[data-slot=dialog-close]]:right-2 [&_[data-slot=dialog-close]]:bg-transparent [&_[data-slot=dialog-close]]:text-white [&_[data-slot=dialog-close]]:hover:bg-white/15 [&_[data-slot=dialog-close]]:hover:text-white"
      >
        <DialogHeader className="bg-blue-700 px-3 py-2.5">
          <DialogTitle className="text-base text-primary-foreground">
            Refund
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 px-2 py-2">
          <fieldset className="rounded-sm border border-slate-300 px-2 pb-2 pt-1">
            <legend className="px-1 text-xs text-foreground">
              Reservation Details
            </legend>
            <div className="grid grid-cols-2 gap-x-4">
              <div className="space-y-1.5">
                <DesktopDetailField label="Party" value={details.party} />
                <DesktopDetailField
                  label="SubTotal"
                  value={formatReservationMoney(details.subTotal)}
                />
                <DesktopDetailField
                  label="Service Charger"
                  value={formatReservationMoney(details.serviceCharge)}
                />
                <DesktopDetailField
                  label="Discount"
                  value={formatReservationMoney(details.discount)}
                />
                <DesktopDetailField
                  label="Total"
                  value={formatReservationMoney(details.total)}
                />
                <DesktopDetailField
                  label="Price Per Ticket"
                  value={formatReservationMoney(details.pricePerTicket)}
                />
                <DesktopDetailField
                  label="Total Payment"
                  value={formatReservationMoney(details.totalPayment)}
                />
              </div>
              <div>
                <DesktopDetailField
                  label="Promo Code"
                  value={details.promo}
                />
              </div>
            </div>
          </fieldset>

          <fieldset className="rounded-sm border border-slate-300 px-2 pb-2 pt-1">
            <legend className="px-1 text-xs text-foreground">Refund Option</legend>
            <RadioGroup
              value={option}
              onValueChange={(value) => handleOptionChange(value as RefundOption)}
              className="mt-1 flex flex-col gap-1"
            >
              {(Object.keys(REFUND_OPTION_LABELS) as RefundOption[]).map((key) => (
                <label
                  key={key}
                  className="flex cursor-pointer items-center gap-1.5 text-xs"
                >
                  <RadioGroupItem value={key} className="size-3.5 border" />
                  {REFUND_OPTION_LABELS[key]}
                </label>
              ))}
            </RadioGroup>
          </fieldset>

          <div className="space-y-2 px-1">
            <div className="flex items-center gap-3">
              <label
                className="w-28 shrink-0 text-xs font-medium"
                htmlFor="refund-card"
              >
                Card To Refund
              </label>
              <Select value={selectedPaymentId} onValueChange={handleCardChange}>
                <SelectTrigger id="refund-card" className="h-8 flex-1 rounded-sm text-xs">
                  <SelectValue placeholder="Select card" />
                </SelectTrigger>
                <SelectContent>
                  {cards.map((card) => (
                    <SelectItem key={card.paymentId} value={card.paymentId}>
                      {card.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-3">
              <label
                className="w-28 shrink-0 text-xs font-medium"
                htmlFor="refund-amount"
              >
                Refund Amount
              </label>
              <Input
                id="refund-amount"
                value={refundAmount}
                inputMode="decimal"
                className="h-8 w-40 rounded-sm text-xs"
                onChange={(event) => {
                  setRefundAmount(event.target.value)
                }}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 border-t border-border/50 px-1 pt-2">
            <Button
              type="button"
              size="sm"
              onClick={handleConfirm}
              disabled={busy}
              className="min-w-20 rounded-sm bg-emerald-500 text-white hover:bg-emerald-600"
            >
              {busy ? 'Refunding…' : 'Ok'}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={busy}
              className="min-w-20 rounded-sm text-blue-700 hover:bg-blue-50 hover:text-blue-800"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function DesktopDetailField({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="w-28 shrink-0 text-xs font-medium">{label}</label>
      <Input
        value={value}
        readOnly
        tabIndex={-1}
        className="h-7 rounded-sm border-slate-200 bg-slate-50 px-2 text-xs text-muted-foreground shadow-none focus-visible:ring-0"
      />
    </div>
  )
}
