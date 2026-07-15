import { PlusCircle } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import { FormField, FormSection } from "@/components/forms/form-fields"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ProcessPaymentDialog } from "@/features/check-in/dialogs/process-payment-dialog"
import { SalesTransactionDialog } from "@/features/check-in/dialogs/sales-transaction-dialog"
import { MultiplePromotionsDialog } from "@/features/check-in/multiple-promotions-dialog"
import { PaymentNumberFieldset } from "@/features/check-in/payment-number-fieldset"
import {
  calculateExpressPanelTotalsFromSection,
  type ExpressPaymentType,
} from "@/features/check-in/service/express-panel.service"
import { cn } from "@/lib/utils"
import type { ReservationPromo } from "@/types/reservation-promo"
import type { ReservationSectionOption } from "@/types/reservation"

const SELECT_TRIGGER_CLASS = "h-8 w-full min-w-0 text-xs"

type ActiveTransaction = {
  paymentType: ExpressPaymentType
  quantity: number
}

export type ExpressPanelSalePayload = {
  section: ReservationSectionOption
  promo: ReservationPromo | null
  party: number
  passes: number
  paymentType: "cash" | "credit-card"
  paymentAmount: number
}

type CheckInExpressPanelProps = {
  sections: ReservationSectionOption[]
  promos: ReservationPromo[]
  visible?: boolean
  isSubmitting?: boolean
  error?: string | null
  onSale: (payload: ExpressPanelSalePayload) => void | Promise<void>
}

export function CheckInExpressPanel({
  sections,
  promos,
  visible = true,
  isSubmitting = false,
  error = null,
  onSale,
}: CheckInExpressPanelProps) {
  const [sectionId, setSectionId] = useState("")
  const [promoId, setPromoId] = useState("none")
  const [passes, setPasses] = useState("1")
  const [cashNumber, setCashNumber] = useState<number | null>(null)
  const [cardNumber, setCardNumber] = useState<number | null>(null)
  const [activeTransaction, setActiveTransaction] =
    useState<ActiveTransaction | null>(null)
  const [multiplePromotionsOpen, setMultiplePromotionsOpen] = useState(false)

  useEffect(() => {
    if (!sections.length) {
      setSectionId("")
      return
    }

    if (!sections.some((section) => section.id === sectionId)) {
      setSectionId(sections[0].id)
    }
  }, [sectionId, sections])

  const selectedSection = useMemo(
    () => sections.find((section) => section.id === sectionId) ?? null,
    [sectionId, sections]
  )

  const selectedPromo = useMemo(() => {
    if (promoId === "none") {
      return null
    }

    return promos.find((promo) => promo.id === promoId) ?? null
  }, [promoId, promos])

  const passQuantity = Math.max(0, Number(passes) || 0)
  const totals = useMemo(
    () =>
      calculateExpressPanelTotalsFromSection({
        sectionPrice: selectedSection?.showPrice ?? 0,
        walkUpFee: selectedSection?.walkUpFee ?? 0,
        quantity: passQuantity,
        promo: selectedPromo,
      }),
    [passQuantity, selectedPromo, selectedSection]
  )
  const transactionTotals = useMemo(
    () =>
      calculateExpressPanelTotalsFromSection({
        sectionPrice: selectedSection?.showPrice ?? 0,
        walkUpFee: selectedSection?.walkUpFee ?? 0,
        quantity: activeTransaction?.quantity ?? 0,
        promo: selectedPromo,
      }),
    [activeTransaction?.quantity, selectedPromo, selectedSection]
  )

  if (!visible) {
    return null
  }

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

  async function handleSalesTransactionOk() {
    if (!selectedSection || !activeTransaction) {
      return
    }

    await onSale({
      section: selectedSection,
      promo: selectedPromo,
      party: activeTransaction.quantity,
      passes: activeTransaction.quantity,
      paymentType:
        activeTransaction.paymentType === "Cash" ? "cash" : "credit-card",
      paymentAmount: transactionTotals.paymentDue,
    })
  }

  return (
    <>
      <div className="px-3 py-3">
        <FormSection title="Express" className="space-y-3">
          {error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : null}
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3 xl:items-start">
            <div className="min-w-0 space-y-2">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <FormField label="Section" className="min-w-0">
                  <Select value={sectionId} onValueChange={setSectionId}>
                    <SelectTrigger className={SELECT_TRIGGER_CLASS}>
                      <SelectValue placeholder="Select section" />
                    </SelectTrigger>
                    <SelectContent>
                      {sections.map((opt) => (
                        <SelectItem key={opt.id} value={opt.id}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="Promo" className="min-w-0">
                  <Select value={promoId} onValueChange={setPromoId}>
                    <SelectTrigger className={SELECT_TRIGGER_CLASS}>
                      <SelectValue placeholder="Select promo code" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Select promo code</SelectItem>
                      {promos.map((opt) => (
                        <SelectItem key={opt.id} value={opt.id}>
                          {opt.promotionName || opt.promotionCode || opt.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              </div>

              <FormField label="Passes" className="w-full max-w-[8.5rem]">
                <div className="flex items-center gap-1.5">
                  <Input
                    type="number"
                    min={1}
                    value={passes}
                    onChange={(event) => {
                      setPasses(event.target.value)
                      setCashNumber(null)
                      setCardNumber(null)
                    }}
                    className="h-8 min-w-0 flex-1 text-center text-xs tabular-nums"
                    disabled={isSubmitting}
                  />
                  <Button
                    type="button"
                    size="icon"
                    className="size-8 shrink-0"
                    aria-label="Open multiple promotions"
                    onClick={() => setMultiplePromotionsOpen(true)}
                    disabled={
                      isSubmitting ||
                      Boolean(selectedSection?.restrictPromoForSection)
                    }
                    title={
                      selectedSection?.restrictPromoForSection
                        ? "Multiple promotions are disabled for this section"
                        : "Add multiple promotions"
                    }
                  >
                    <PlusCircle className="size-4" />
                  </Button>
                </div>
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
            onOk={() => {
              void handleSalesTransactionOk()
            }}
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
            onOk={() => {
              void handleSalesTransactionOk()
            }}
          />
        )
      ) : null}

      <MultiplePromotionsDialog
        open={multiplePromotionsOpen}
        onOpenChange={setMultiplePromotionsOpen}
        promos={promos}
        sectionPrice={selectedSection?.showPrice ?? 0}
        walkUpFee={selectedSection?.walkUpFee ?? 0}
        initialParty={Math.max(1, passQuantity || 1)}
        onConfirm={(payload) => {
          setPasses(String(payload.partyNumber))
          setPromoId(payload.primaryPromo?.id ?? "none")
          setCashNumber(null)
          setCardNumber(null)
        }}
      />
    </>
  )
}
