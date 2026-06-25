import { useMemo, useState } from "react"

import { FormField, FormSection } from "@/components/forms/form-fields"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { promoOptions, sectionOptions } from "@/data/reservation"
import { ProcessPaymentDialog } from "@/features/check-in/dialogs/process-payment-dialog"
import { SalesTransactionDialog } from "@/features/check-in/dialogs/sales-transaction-dialog"
import { PaymentNumberFieldset } from "@/features/check-in/payment-number-fieldset"
import {
  calculateExpressPanelTotals,
  type ExpressPaymentType,
} from "@/features/check-in/service/express-panel.service"
import { cn } from "@/lib/utils"

const SELECT_TRIGGER_CLASS = "h-8 w-full min-w-0 text-xs"

type ActiveTransaction = {
  paymentType: ExpressPaymentType
  quantity: number
}

export function CheckInExpressPanel() {
  const [section, setSection] = useState(sectionOptions[0]?.id ?? "")
  const [promo, setPromo] = useState("none")
  const [passes, setPasses] = useState("1")
  const [cashNumber, setCashNumber] = useState<number | null>(null)
  const [cardNumber, setCardNumber] = useState<number | null>(null)
  const [activeTransaction, setActiveTransaction] = useState<ActiveTransaction | null>(null)

  const passQuantity = Math.max(0, Number(passes) || 0)
  const totals = useMemo(
    () =>
      calculateExpressPanelTotals({
        sectionId: section,
        promoId: promo,
        quantity: passQuantity,
      }),
    [passQuantity, promo, section]
  )
  const transactionTotals = useMemo(
    () =>
      calculateExpressPanelTotals({
        sectionId: section,
        promoId: promo,
        quantity: activeTransaction?.quantity ?? 0,
      }),
    [activeTransaction?.quantity, promo, section]
  )

  function handlePaymentSelect(paymentType: ExpressPaymentType, quantity: number) {
    setPasses(String(quantity))

    if (paymentType === "Cash") {
      setCashNumber(quantity)
      setCardNumber(null)
    } else {
      setCardNumber(quantity)
      setCashNumber(null)
    }

    setActiveTransaction({ paymentType, quantity })
  }

  function handleSalesTransactionOk() {
    // Placeholder for payment posting once the backend flow is wired.
  }

  return (
    <>
      <div className="px-3 py-3">
        <FormSection title="Express" className="space-y-3">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3 xl:items-start">
            <div className="min-w-0 space-y-2">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <FormField label="Section" className="min-w-0">
                  <Select value={section} onValueChange={setSection}>
                    <SelectTrigger className={SELECT_TRIGGER_CLASS}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sectionOptions.map((opt) => (
                        <SelectItem key={opt.id} value={opt.id}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="Promo" className="min-w-0">
                  <Select value={promo} onValueChange={setPromo}>
                    <SelectTrigger className={SELECT_TRIGGER_CLASS}>
                      <SelectValue placeholder="Select promo code" />
                    </SelectTrigger>
                    <SelectContent>
                      {promoOptions.map((opt) => (
                        <SelectItem key={opt.id} value={opt.id}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              </div>

              <FormField label="Passes" className="w-full max-w-[6.5rem]">
                <Input
                  type="number"
                  min={1}
                  value={passes}
                  onChange={(event) => {
                    setPasses(event.target.value)
                    setCashNumber(null)
                    setCardNumber(null)
                  }}
                  className="h-8 text-center text-xs tabular-nums"
                />
              </FormField>
            </div>

            <div className="min-w-0">
              <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
                <PaymentNumberFieldset
                  label="Cash"
                  selected={cashNumber}
                  onSelect={(value) => handlePaymentSelect("Cash", value)}
                />
                <PaymentNumberFieldset
                  label="Credit Card"
                  selected={cardNumber}
                  onSelect={(value) => handlePaymentSelect("Credit Card", value)}
                />
              </div>
            </div>

            <div className="min-w-0 rounded-md border border-border/60 bg-background p-3">
              <div className="space-y-2">
                {[
                  { label: "Subtotal", value: totals.subtotal },
                  { label: "Service Charge", value: totals.serviceCharge },
                  { label: "Discount", value: totals.discount },
                  { label: "Tax", value: totals.tax },
                ].map((line) => (
                  <div
                    key={line.label}
                    className="flex items-center justify-between gap-3 text-xs"
                  >
                    <span className="text-muted-foreground">{line.label}</span>
                    <span className="font-medium tabular-nums text-foreground">
                      {line.value}
                    </span>
                  </div>
                ))}
              </div>
              <div
                className={cn(
                  "mt-3 border-t border-border/60 pt-3",
                  "flex items-end justify-between gap-3"
                )}
              >
                <span className="text-sm font-semibold text-foreground">TOTAL</span>
                <span className="text-xl leading-none font-bold tabular-nums text-primary sm:text-2xl">
                  {totals.total}
                </span>
              </div>
            </div>
          </div>
        </FormSection>
      </div>

      {activeTransaction ? (
        activeTransaction.paymentType === "Cash" ? (
          <SalesTransactionDialog
            key={`${activeTransaction.paymentType}-${activeTransaction.quantity}-${transactionTotals.paymentDue}`}
            open
            onOpenChange={(nextOpen) => {
              if (!nextOpen) {
                setActiveTransaction(null)
              }
            }}
            paymentType={activeTransaction.paymentType}
            paymentDue={transactionTotals.paymentDue}
            onOk={handleSalesTransactionOk}
          />
        ) : (
          <ProcessPaymentDialog
            key={`${activeTransaction.paymentType}-${activeTransaction.quantity}-${transactionTotals.paymentDue}`}
            open
            onOpenChange={(nextOpen) => {
              if (!nextOpen) {
                setActiveTransaction(null)
              }
            }}
            quantity={activeTransaction.quantity}
            paymentAmount={transactionTotals.total}
            onOk={handleSalesTransactionOk}
          />
        )
      ) : null}
    </>
  )
}



